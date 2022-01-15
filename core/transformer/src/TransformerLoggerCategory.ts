/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Logging
 */

/** Logger categories used by this package
 * @note All logger categories in this package start with the `core-backend` prefix.
 * @see [Logger]($bentley)
 * @public
 */
export enum TransformerLoggerCategory {
  /** The logger category used by the [IModelExporter]($transformer) class.
   * @beta
   */
  IModelExporter = "core-backend.IModelExporter",

  /** The logger category used by the [IModelTraverser]($transformer) class.
   * @beta
   */
  IModelTraverser = "core-backend.IModelTraverser",

  /** The logger category used by the [IModelImporter]($transformer) class.
   * @beta
   */
  IModelImporter = "core-backend.IModelImporter",

  /** The logger category used by the [IModelTransformer]($transformer) class.
   * @beta
   */
  IModelTransformer = "core-backend.IModelTransformer",
}
