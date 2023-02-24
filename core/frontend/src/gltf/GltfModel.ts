/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Rendering
 */

import { Transform, XAndY, XYAndZ } from "@itwin/core-geometry";
import { GltfAlphaMode, GltfDocument } from "./GltfSchema";

export namespace Gltf {
  export type Buffer = Uint8Array;

  export interface PositionQuantization {
    origin: XYAndZ;
    scale: XYAndZ;
    decodedMin: XYAndZ;
    decodedMax: XYAndZ;
  }

  export interface Attribute {
    buffer: Buffer;
  }

  export interface PositionAttribute extends Attribute {
    // If not "float", the positions are quantized or normalized.
    componentType: "float" | "u8" | "i8";
    quantization?: PositionQuantization;
  }

  export interface ColorAttribute extends Attribute {
    componentType: "float" | "u8" | "u16";
  }

  export interface Indices {
    dataType: "u8" | "u16" | "u32";
    count: number;
    buffer: Buffer;
  }

  export type PrimitiveType = "triangles";

  export interface Primitive {
    indices: Indices;
    attributeCount: number;
    position: PositionAttribute;
    color?: ColorAttribute;
  }

  export interface TextureUVQuantization {
    origin: XAndY;
    scale: XAndY;
    decodedMin: XAndY;
    decodedMax: XAndY;
  }

  export interface NormalAttribute extends Attribute {
    // If not "float", the components are normalized.
    componentType: "float" | "i8" | "i16";
  }

  export interface TextureUVAttribute extends Attribute {
    // If not "float", the components are quantized or normalized.
    componentType: "float" | "u8" | "u16" | "i8" | "i16";
    quantization?: TextureUVQuantization;
  }

  export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  export interface MetallicRoughness {
    baseColorFactor: Rgba;
    // ###TODO_GLTF baseColorTexture;
    metallicFactor: number;
    roughnessFactor: number;
    // ###TODO_GLTF metallicRoughnessTexture;
  }

  export interface Material {
    metallicRoughness: MetallicRoughness;
    alphaMode: GltfAlphaMode;
    alphaCutoff: number;
    doubleSided: boolean;
    // NB: a  mesh have normals defined but still be intended to be rendered without lighting.
    unlit: boolean;
  }

  export interface TrianglesPrimitive extends Primitive {
    type: "triangles";
    material: Material;
    normal?: NormalAttribute;
    textureUV?: TextureUVAttribute;
  }

  export type AnyPrimitive = TrianglesPrimitive;

  export interface Node {
    /** Transform from this node's local coordinate system to its parent node's coordinate system (or the model's coordinate system, if no parent node). */
    toParent?: Transform;
    /** The primitives drawn by this node. For glTF 2.0, there is exactly one primitive per node; glTF 1.0 permits any number of primitives per node. */
    primitives: AnyPrimitive[];
  }

  export interface Model {
    /** Transform from model coordinates to world coordinates. */
    toWorld?: Transform;
    nodes: Node[];
  }
}
