/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Tiles
 */

import { ByteStream, Id64String, JsonUtils } from "@itwin/core-bentley";
import { Point3d, Transform, Vector3d } from "@itwin/core-geometry";
import {
  B3dmHeader,
  ColorDef,
  ElementAlignedBox3d,
  Feature,
  FeatureTable,
  TileReadStatus,
} from "@itwin/core-common";
import { IModelConnection } from "../IModelConnection";
import { Mesh } from "../render/primitives/mesh/MeshPrimitives";
import { RenderSystem } from "../render/RenderSystem";
import { GltfDataType, GltfMeshPrimitive } from "../gltf/GltfSchema";
import {
  BatchedTileIdMap,
  GltfBufferData,
  GltfReader,
  GltfReaderProps,
  GltfReaderResult,
  ShouldAbortReadGltf,
} from "./internal";

/**
 * Deserializes a tile in [b3dm](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification/TileFormats/Batched3DModel) format.
 * @internal
 */
export class B3dmReader extends GltfReader {
  private _batchIdRemap = new Map<number, number>();
  private _colors?: Array<number>;
  private readonly _modelId: Id64String;

  public static create(
    stream: ByteStream,
    iModel: IModelConnection,
    modelId: Id64String,
    is3d: boolean,
    range: ElementAlignedBox3d,
    system: RenderSystem,
    yAxisUp: boolean,
    isLeaf: boolean,
    tileCenter: Point3d,
    transformToRoot?: Transform,
    isCanceled?: ShouldAbortReadGltf,
    idMap?: BatchedTileIdMap,
    deduplicateVertices = false
  ): B3dmReader | undefined {
    const header = new B3dmHeader(stream);
    if (!header.isValid) return undefined;

    let returnToCenterTransform, pseudoRtcBias;
    if (
      header.featureTableJson &&
      Array.isArray(header.featureTableJson.RTC_CENTER)
    ) {
      returnToCenterTransform = Transform.createTranslationXYZ(
        header.featureTableJson.RTC_CENTER[0],
        header.featureTableJson.RTC_CENTER[1],
        header.featureTableJson.RTC_CENTER[2]
      );
    } else {
      /**
       * This is a workaround for tiles generated by
       * context capture which have a large offset from the tileset origin that exceeds the
       * capacity of 32 bit integers. It is essentially an ad hoc RTC applied at read time only if the tile is far from the
       * origin and there is no RTC supplied either with the B3DM of the GLTF.
       * as the vertices are supplied in a quantized format, applying the RTC bias to
       * quantization origin will make these tiles work correctly.
       */
      pseudoRtcBias = Vector3d.create(tileCenter.x, tileCenter.y, tileCenter.z);
    }

    if (undefined !== returnToCenterTransform)
      transformToRoot = transformToRoot
        ? transformToRoot.multiplyTransformTransform(returnToCenterTransform)
        : returnToCenterTransform;

    const props = GltfReaderProps.create(
      stream.nextBytes(header.length - stream.curPos),
      yAxisUp
    );
    const batchTableLength = header.featureTableJson
      ? JsonUtils.asInt(header.featureTableJson.BATCH_LENGTH, 0)
      : 0;

    return undefined !== props
      ? new B3dmReader(
          props,
          iModel,
          modelId,
          is3d,
          system,
          range,
          isLeaf,
          batchTableLength,
          transformToRoot,
          header.batchTableJson,
          isCanceled,
          idMap,
          pseudoRtcBias,
          deduplicateVertices
        )
      : undefined;
  }

  private constructor(
    props: GltfReaderProps,
    iModel: IModelConnection,
    modelId: Id64String,
    is3d: boolean,
    system: RenderSystem,
    private _range: ElementAlignedBox3d,
    private _isLeaf: boolean,
    private _batchTableLength: number,
    private _transformToRoot?: Transform,
    private _batchTableJson?: any,
    shouldAbort?: ShouldAbortReadGltf,
    private _idMap?: BatchedTileIdMap,
    private _pseudoRtcBias?: Vector3d,
    deduplicateVertices = false
  ) {
    super({
      props,
      iModel,
      system,
      shouldAbort,
      deduplicateVertices,
      is2d: !is3d,
    });
    this._modelId = modelId;
  }

  public async read(): Promise<GltfReaderResult> {
    // NB: For reality models with no batch table, we want the model ID in the feature table
    const featureTable: FeatureTable = new FeatureTable(
      this._batchTableLength ? this._batchTableLength : 1,
      this._modelId,
      this._type
    );
    if (
      this._batchTableLength > 0 &&
      this._idMap !== undefined &&
      this._batchTableJson !== undefined
    ) {
      if (
        this._batchTableJson.extensions &&
        this._batchTableJson.extensions["3DTILES_batch_table_hierarchy"]
      ) {
        const hierarchy =
          this._batchTableJson.extensions["3DTILES_batch_table_hierarchy"];
        const { classIds, classes, parentIds, parentCounts, instancesLength } =
          hierarchy;
        if (
          classes !== undefined &&
          classIds !== undefined &&
          instancesLength !== 0
        ) {
          const classCounts = new Array<number>(classes.length);
          classCounts.fill(0);
          const classIndexes = new Uint16Array(instancesLength);
          for (let i = 0; i < instancesLength; ++i) {
            const classId = classIds[i];
            classIndexes[i] = classCounts[classId]++;
          }

          let parentMap: [][] | undefined;
          if (parentIds) {
            parentMap = new Array<[]>();
            for (let i = 0, parentIndex = 0; i < instancesLength; i++) {
              const parentCount =
                parentCounts === undefined ? 1 : parentCounts[i];
              parentMap[i] = parentIds.slice(
                parentIndex,
                (parentIndex += parentCount)
              );
            }
          }

          const getProperties = (instance: any, instanceIndex: number) => {
            const classId = classIds[instanceIndex];
            const instanceClass = classes[classId];
            const instances = instanceClass.instances;
            const indexInClass = classIndexes[instanceIndex];
            for (const key in instances) {
              // eslint-disable-line guard-for-in
              const value = instances[key][indexInClass];
              if (value !== undefined && value !== null) instance[key] = value;
            }
            if (parentIds !== undefined) {
              const thisParents = parentMap![instanceIndex];
              for (const parentId of thisParents) {
                if (parentId !== instanceIndex)
                  getProperties(instance, parentId);
              }
            }
          };
          for (let batchId = 0; batchId < instancesLength; batchId++) {
            const instance: any = {};
            getProperties(instance, batchId);
            this._batchIdRemap.set(
              batchId,
              featureTable.insert(new Feature(this._idMap.getBatchId(instance)))
            );
            const cesiumColor = instance["cesium#color"];
            if (undefined !== cesiumColor) {
              if (!this._colors) {
                this._colors = new Array<number>(instancesLength);
                this._colors.fill(ColorDef.white.tbgr);
              }
              this._colors[batchId] = ColorDef.create(cesiumColor).tbgr;
            }
          }
        }
      } else {
        for (let i = 0; i < this._batchTableLength; i++) {
          const feature: any = {};
          for (const key in this._batchTableJson) // eslint-disable-line guard-for-in
            feature[key] = this._batchTableJson[key][i];

          this._batchIdRemap.set(
            i,
            featureTable.insert(new Feature(this._idMap.getBatchId(feature)))
          );
        }
      }
    }

    if (featureTable.isEmpty) {
      this._batchIdRemap.set(0, 0);
      const feature = new Feature(this._modelId);
      featureTable.insert(feature);
    }

    await this.resolveResources();
    if (this._isCanceled)
      return { readStatus: TileReadStatus.Canceled, isLeaf: this._isLeaf };

    return this.readGltfAndCreateGraphics(
      this._isLeaf,
      featureTable,
      this._range,
      this._transformToRoot,
      this._pseudoRtcBias
    );
  }

  protected override readBatchTable(mesh: Mesh, json: GltfMeshPrimitive) {
    if (mesh.features !== undefined) {
      if (
        this._batchTableLength > 0 &&
        undefined !== this._batchTableJson &&
        undefined !== json.attributes
      ) {
        const view = this.getBufferView(json.attributes, "_BATCHID");
        let batchIds: undefined | GltfBufferData;
        if (
          undefined !== view &&
          (undefined !== (batchIds = view.toBufferData(GltfDataType.UInt32)) ||
            undefined !== (batchIds = view.toBufferData(GltfDataType.Float)))
        ) {
          const indices = [];
          const { colors, colorMap } = mesh;
          let colorRemap: Uint32Array | undefined;
          if (this._colors && this._colors.length === this._batchTableLength) {
            colorRemap = new Uint32Array(this._batchTableLength);

            for (let i = 0; i < this._batchTableLength; i++)
              colorRemap[i] = colorMap.insert(this._colors[i]);
          }

          for (let i = 0; i < batchIds.count; i++) {
            const batchId = batchIds.buffer[i * view.stride];
            const remapId = this._batchIdRemap.get(batchId);
            indices.push(remapId === undefined ? 0 : remapId);
            if (colorRemap) colors.push(colorRemap[batchId]);
          }
          mesh.features.setIndices(indices);
        }
      } else {
        mesh.features.add(new Feature(this._modelId), 1);
      }
    }
  }
}
