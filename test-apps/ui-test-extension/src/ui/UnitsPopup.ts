/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp } from "@itwin/core-frontend";
import { Localization } from "@itwin/core-common";
import { UnitSystemKey } from "@itwin/core-quantity";
import { Presentation } from "@itwin/presentation-frontend";
import {
  DialogButtonDef, DialogButtonType, DialogItem, DialogItemValue, DialogLayoutDataProvider, DialogPropertySyncItem, PropertyDescription,
} from "@itwin/appui-abstract";

/** UnitsPopup is a modal dialog with only one DialogItem. It is intended to be a very basic example of using DialogItem interfaces and the DialogLayoutDataProvider to create React UI
 * in an iModel.js app and to apply changes only when the user hits the OK button.
 */
export class UnitsPopupUiDataProvider extends DialogLayoutDataProvider {
  public static localization: Localization;

  constructor(localization: Localization) {
    super();
    UnitsPopupUiDataProvider.localization = localization;
  }

  private _handleOK = async () => {
    Presentation.presentation.activeUnitSystem = this.option;
    await IModelApp.quantityFormatter.setActiveUnitSystem(this.option);
  };

  public override supplyButtonData(): DialogButtonDef[] | undefined {
    const buttons: DialogButtonDef[] = [];
    buttons.push({ type: DialogButtonType.OK, onClick: this._handleOK });
    buttons.push({ type: DialogButtonType.Cancel, onClick: () => { } });
    return buttons;
  }

  // ------------- Enum based picklist ---------------
  private static _optionsName = "enumAsPicklist";

  private static _getEnumAsPicklistDescription = (): PropertyDescription => {
    return {
      name: UnitsPopupUiDataProvider._optionsName,
      displayLabel: UnitsPopupUiDataProvider.localization.getLocalizedString("uiTestExtension:StatusBar.Units"),
      typename: "enum",
      enum: {
        choices: [
          { label: UnitsPopupUiDataProvider.localization.getLocalizedString("uiTestExtension:StatusBar.Metric"), value: "metric" },
          { label: UnitsPopupUiDataProvider.localization.getLocalizedString("uiTestExtension:StatusBar.Imperial"), value: "imperial" },
          { label: UnitsPopupUiDataProvider.localization.getLocalizedString("uiTestExtension:StatusBar.UsSurvey"), value: "usSurvey" },
          { label: UnitsPopupUiDataProvider.localization.getLocalizedString("uiTestExtension:StatusBar.UsCustomary"), value: "usCustomary" },
        ],
      },
    };
  };

  private _optionsValue: DialogItemValue = { value: IModelApp.quantityFormatter.activeUnitSystem };

  public get option(): UnitSystemKey {
    return this._optionsValue.value as UnitSystemKey;
  }

  public set option(option: UnitSystemKey) {
    this._optionsValue = { value: option };
  }

  public override applyUiPropertyChange = (updatedValue: DialogPropertySyncItem): void => {
    this.option = updatedValue.value.value as UnitSystemKey;
  };

  public override supplyDialogItems(): DialogItem[] | undefined {
    const items = [{ value: this._optionsValue, property: UnitsPopupUiDataProvider._getEnumAsPicklistDescription(), editorPosition: { rowPriority: 0, columnIndex: 2 } }];
    return items;
  }
}