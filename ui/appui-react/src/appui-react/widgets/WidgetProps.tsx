/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Widget
 */

import * as React from "react";
import { AbstractWidgetProps } from "@itwin/appui-abstract";
import { IconProps } from "@itwin/core-react";
import { ConfigurableUiControlConstructor } from "../configurableui/ConfigurableUiControl";

/** Properties for a [[Widget]] component.
 * @deprecated in 3.5. Props of a deprecated component.
 * @public
 */
export interface WidgetProps extends Omit<AbstractWidgetProps, "getWidgetContent">, IconProps { // eslint-disable-line deprecation/deprecation
  /** if set, it is used to define a key that is used to look up a localized string. This value is used only if label is not explicitly set. */
  labelKey?: string;
  /** if set, it is used to define a key that is used to look up a localized string. This value is used only if tooltip is not explicitly set. */
  tooltipKey?: string;
  /** A [[WidgetControl]] providing information about the Widget. */
  control?: ConfigurableUiControlConstructor;
  /** A React component for the Widget. */
  element?: React.ReactNode;
  /** Control's class id */
  classId?: string | ConfigurableUiControlConstructor;
  /** @alpha */
  preferredPanelSize?: "fit-content";
}

/** Properties of a Widget.
 * @beta
 */
export interface CommonWidgetProps extends Readonly<AbstractWidgetProps> { // eslint-disable-line deprecation/deprecation
  /** Id used to uniquely identify the widget. */
  readonly id: string;
}