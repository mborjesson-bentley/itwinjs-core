/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Base
 */

// Cspell:ignore popout
import { castDraft, Draft, produce } from "immer";
import { PointProps } from "@itwin/appui-abstract";
import { IconSpec, Point, Rectangle, RectangleProps, SizeProps } from "@itwin/core-react";
import { HorizontalPanelSide, isHorizontalPanelSide, PanelSide, panelSides, VerticalPanelSide } from "../widget-panels/Panel";
import { assert } from "@itwin/core-bentley";
import { getUniqueId } from "./NineZone";

/** @internal */
export interface SizeAndPositionProps extends SizeProps, PointProps { }

/** @internal */
export interface TabState {
  readonly id: string;
  readonly label: string;
  readonly iconSpec?: IconSpec;
  readonly preferredFloatingWidgetSize?: SizeProps;
  readonly preferredPopoutWidgetSize?: SizeAndPositionProps;
  readonly preferredPanelWidgetSize?: "fit-content";
  readonly allowedPanelTargets?: PanelSide[];
  readonly canPopout?: boolean;
  readonly userSized?: boolean;
  readonly isFloatingStateWindowResizable?: boolean;
  readonly hideWithUiWhenFloating?: boolean;
}

/** @internal */
export interface TabsState { readonly [id: string]: TabState }

/** @internal */
export interface WidgetState {
  readonly activeTabId: TabState["id"];
  readonly id: string;
  readonly minimized: boolean;
  readonly tabs: ReadonlyArray<TabState["id"]>;
  readonly isFloatingStateWindowResizable?: boolean;
}

/** @internal */
export interface FloatingWidgetState {
  readonly bounds: RectangleProps;
  readonly id: WidgetState["id"];
  readonly home: FloatingWidgetHomeState;
  readonly userSized?: boolean;
  readonly hidden?: boolean;
}

/** @internal */
export interface PopoutWidgetState {
  readonly bounds: RectangleProps;
  readonly id: WidgetState["id"];
  readonly home: FloatingWidgetHomeState;
}

/** @internal */
export interface FloatingWidgetHomeState {
  readonly widgetIndex: number;
  readonly widgetId: WidgetState["id"] | undefined;
  readonly side: PanelSide;
}

/** @internal */
export interface DraggedTabState {
  readonly tabId: TabState["id"];
  readonly position: PointProps;
  readonly home: FloatingWidgetHomeState;
}

/** @internal */
export interface WidgetsState { readonly [id: string]: WidgetState }

/** @internal */
export interface FloatingWidgetsState {
  readonly byId: { readonly [id: string]: FloatingWidgetState };
  readonly allIds: ReadonlyArray<FloatingWidgetState["id"]>;
}

/** @internal */
export interface PopoutWidgetsState {
  readonly byId: { readonly [id: string]: PopoutWidgetState };
  readonly allIds: ReadonlyArray<PopoutWidgetState["id"]>;
}

/** @internal */
export interface TabDropTargetState {
  readonly widgetId: WidgetState["id"];
  readonly tabIndex: number;
  readonly type: "tab";
}

/** @internal */
export interface WidgetDropTargetState {
  readonly widgetId: WidgetState["id"];
  readonly type: "widget";
}

/** @internal */
export interface PanelDropTargetState {
  readonly side: PanelSide;
  readonly newWidgetId: WidgetState["id"];
  readonly type: "panel";
}

/** @internal */
export interface SectionDropTargetState {
  readonly side: PanelSide;
  readonly newWidgetId: WidgetState["id"];
  readonly sectionIndex: number;
  readonly type: "section";
}

/** @internal */
export interface FloatingWidgetDropTargetState {
  readonly type: "floatingWidget";
  readonly newFloatingWidgetId: FloatingWidgetState["id"];
  readonly size: SizeProps;
}

/** Drop target of a tab drag action.
 * @internal
 */
export type TabDragDropTargetState = PanelDropTargetState | SectionDropTargetState | WidgetDropTargetState | TabDropTargetState | FloatingWidgetDropTargetState;

/** Default drop target, when nothing is targeted.
 * @internal
 */
export interface WindowDropTargetState {
  readonly type: "window";
}

/** Drop target of a widget drag action.
 * @internal
 */
export type WidgetDragDropTargetState = PanelDropTargetState | SectionDropTargetState | WidgetDropTargetState | TabDropTargetState | WindowDropTargetState;

/** @internal */
export type DropTargetState = TabDragDropTargetState | WidgetDragDropTargetState;

/** @internal */
export interface PanelsState {
  readonly bottom: HorizontalPanelState;
  readonly left: VerticalPanelState;
  readonly right: VerticalPanelState;
  readonly top: HorizontalPanelState;
}

/** @internal */
export interface PanelState {
  readonly collapseOffset: number;
  readonly collapsed: boolean;
  readonly maxSize: number;
  readonly minSize: number;
  readonly pinned: boolean;
  readonly resizable: boolean;
  readonly side: PanelSide;
  readonly size: number | undefined;
  readonly widgets: ReadonlyArray<WidgetState["id"]>;
  readonly maxWidgetCount: number;
  readonly splitterPercent: number | undefined;  // default to 50
}

/** @internal */
export interface HorizontalPanelState extends PanelState {
  readonly span: boolean;
  readonly side: HorizontalPanelSide;
}

/** @internal */
export interface VerticalPanelState extends PanelState {
  readonly side: VerticalPanelSide;
}

/** @internal */
export interface DockedToolSettingsState {
  readonly type: "docked";
}

/** @internal */
export interface WidgetToolSettingsState {
  readonly type: "widget";
}

/** @internal */
export type ToolSettingsState = DockedToolSettingsState | WidgetToolSettingsState;

/** @internal */
export interface NineZoneState {
  readonly draggedTab: DraggedTabState | undefined;
  readonly floatingWidgets: FloatingWidgetsState;
  readonly popoutWidgets: PopoutWidgetsState;
  readonly panels: PanelsState;
  readonly tabs: TabsState;
  readonly toolSettings: ToolSettingsState;
  readonly widgets: WidgetsState;
  readonly size: SizeProps;
}

/** @internal */
export interface ResizeAction {
  readonly type: "RESIZE";
  readonly size: SizeProps;
}

/** @internal */
export interface PanelToggleCollapsedAction {
  readonly type: "PANEL_TOGGLE_COLLAPSED";
  readonly side: PanelSide;
}

/** @internal */
export interface PanelSetCollapsedAction {
  readonly type: "PANEL_SET_COLLAPSED";
  readonly collapsed: boolean;
  readonly side: PanelSide;
}

/** @internal */
export interface PanelSetSizeAction {
  readonly type: "PANEL_SET_SIZE";
  readonly side: PanelSide;
  readonly size: number;
}

/** @internal */
export interface PanelSetSplitterPercentAction {
  readonly type: "PANEL_SET_SPLITTER_VALUE";
  readonly side: PanelSide;
  readonly percent: number;
}

/** @internal */
export interface PanelToggleSpanAction {
  readonly type: "PANEL_TOGGLE_SPAN";
  readonly side: HorizontalPanelSide;
}

/** @internal */
export interface PanelTogglePinnedAction {
  readonly type: "PANEL_TOGGLE_PINNED";
  readonly side: PanelSide;
}

/** @internal */
export interface PanelInitializeAction {
  readonly type: "PANEL_INITIALIZE";
  readonly side: PanelSide;
  readonly size: number;
}

/** @internal */
export interface FloatingWidgetResizeAction {
  readonly type: "FLOATING_WIDGET_RESIZE";
  readonly id: FloatingWidgetState["id"];
  readonly resizeBy: RectangleProps;
}

/** @internal */
export interface FloatingWidgetSetBoundsAction {
  readonly type: "FLOATING_WIDGET_SET_BOUNDS";
  readonly id: FloatingWidgetState["id"];
  readonly bounds: RectangleProps;
}

/** @internal */
export interface FloatingWidgetBringToFrontAction {
  readonly type: "FLOATING_WIDGET_BRING_TO_FRONT";
  readonly id: FloatingWidgetState["id"];
}

/** @internal */
export interface FloatingWidgetClearUserSizedAction {
  readonly type: "FLOATING_WIDGET_CLEAR_USER_SIZED";
  readonly id: FloatingWidgetState["id"];
}

/** @internal */
export interface FloatingWidgetSendBackAction {
  readonly type: "FLOATING_WIDGET_SEND_BACK";
  readonly id: FloatingWidgetState["id"];
}

/** @internal */
export interface PopoutWidgetSendBackAction {
  readonly type: "POPOUT_WIDGET_SEND_BACK";
  readonly id: PopoutWidgetState["id"];
}

/** @internal */
export interface PanelWidgetDragStartAction {
  readonly type: "PANEL_WIDGET_DRAG_START";
  readonly newFloatingWidgetId: FloatingWidgetState["id"];
  readonly id: WidgetState["id"];
  readonly bounds: RectangleProps;
  readonly side: PanelSide;
  readonly userSized?: boolean;
}

/** @internal */
export interface WidgetDragAction {
  readonly type: "WIDGET_DRAG";
  readonly dragBy: PointProps;
  readonly floatingWidgetId: FloatingWidgetState["id"];
}

/** @internal */
export interface WidgetDragEndAction {
  readonly type: "WIDGET_DRAG_END";
  readonly floatingWidgetId: FloatingWidgetState["id"];
  readonly target: WidgetDragDropTargetState;
}

/** @internal */
export interface WidgetTabClickAction {
  readonly type: "WIDGET_TAB_CLICK";
  readonly side: PanelSide | undefined;
  readonly widgetId: WidgetState["id"];
  readonly id: TabState["id"];
}

/** @internal */
export interface WidgetTabDoubleClickAction {
  readonly type: "WIDGET_TAB_DOUBLE_CLICK";
  readonly side: PanelSide | undefined;
  readonly widgetId: WidgetState["id"];
  readonly floatingWidgetId: FloatingWidgetState["id"] | undefined;
  readonly id: TabState["id"];
}

/** @internal */
export interface WidgetTabPopoutAction {
  readonly type: "WIDGET_TAB_POPOUT";
  readonly id: WidgetState["activeTabId"];
}

/** @internal */
export interface WidgetTabDragStartAction {
  readonly type: "WIDGET_TAB_DRAG_START";
  readonly side: PanelSide | undefined;
  readonly widgetId: WidgetState["id"];
  readonly floatingWidgetId: FloatingWidgetState["id"] | undefined;
  readonly id: TabState["id"];
  readonly position: PointProps;
  readonly userSized?: boolean;
}

/** @internal */
export interface WidgetTabDragAction {
  readonly type: "WIDGET_TAB_DRAG";
  readonly dragBy: PointProps;
}

/** @internal */
export interface WidgetTabDragEndAction {
  readonly type: "WIDGET_TAB_DRAG_END";
  readonly id: TabState["id"];
  readonly target: TabDragDropTargetState;
}

/** @internal */
export interface ToolSettingsDragStartAction {
  readonly type: "TOOL_SETTINGS_DRAG_START";
  readonly newFloatingWidgetId: FloatingWidgetState["id"];
}

/** @internal */
export interface ToolSettingsDockAction {
  readonly type: "TOOL_SETTINGS_DOCK";
}

/** @internal */
export type NineZoneActionTypes =
  ResizeAction |
  PanelToggleCollapsedAction |
  PanelSetCollapsedAction |
  PanelSetSizeAction |
  PanelSetSplitterPercentAction |
  PanelToggleSpanAction |
  PanelTogglePinnedAction |
  PanelInitializeAction |
  FloatingWidgetResizeAction |
  FloatingWidgetSetBoundsAction |
  FloatingWidgetBringToFrontAction |
  FloatingWidgetSendBackAction |
  FloatingWidgetClearUserSizedAction |
  PopoutWidgetSendBackAction |
  PanelWidgetDragStartAction |
  WidgetDragAction |
  WidgetDragEndAction |
  WidgetTabClickAction |
  WidgetTabDoubleClickAction |
  WidgetTabDragStartAction |
  WidgetTabDragAction |
  WidgetTabDragEndAction |
  WidgetTabPopoutAction |
  ToolSettingsDragStartAction |
  ToolSettingsDockAction;

/** @internal */
export const toolSettingsTabId = "nz-tool-settings-tab";

/** @internal */
export const NineZoneStateReducer: (state: NineZoneState, action: NineZoneActionTypes) => NineZoneState = produce(( // eslint-disable-line @typescript-eslint/naming-convention
  state: Draft<NineZoneState>,
  action: NineZoneActionTypes,
) => {
  switch (action.type) {
    case "RESIZE": {
      setSizeProps(state.size, action.size);
      const nzBounds = Rectangle.createFromSize(action.size);
      for (const id of state.floatingWidgets.allIds) {
        const floatingWidget = state.floatingWidgets.byId[id];
        const bounds = Rectangle.create(floatingWidget.bounds);
        const containedBounds = bounds.containIn(nzBounds);
        setRectangleProps(floatingWidget.bounds, containedBounds);
      }
      return;
    }
    case "PANEL_TOGGLE_COLLAPSED": {
      const panel = state.panels[action.side];
      panel.collapsed = !panel.collapsed;
      return;
    }
    case "PANEL_SET_COLLAPSED": {
      const panel = state.panels[action.side];
      panel.collapsed = action.collapsed;
      return;
    }
    case "PANEL_SET_SIZE": {
      const panel = state.panels[action.side];
      const newSize = Math.min(Math.max(action.size, panel.minSize), panel.maxSize);
      state.panels[action.side].size = newSize;
      // eslint-disable-next-line no-console
      // console.log(`${action.side} panel resized to value of ${newSize}`);
      return;
    }
    case "PANEL_SET_SPLITTER_VALUE": {
      const percent = Math.min(Math.max(action.percent, 0), 100);
      state.panels[action.side].splitterPercent = percent;
      return;
    }
    case "PANEL_TOGGLE_SPAN": {
      const panel = state.panels[action.side];
      state.panels[action.side].span = !panel.span;
      return;
    }
    case "PANEL_TOGGLE_PINNED": {
      const panel = state.panels[action.side];
      state.panels[action.side].pinned = !panel.pinned;
      return;
    }
    case "PANEL_INITIALIZE": {
      const panel = state.panels[action.side];
      const newSize = Math.min(Math.max(action.size, panel.minSize), panel.maxSize);
      state.panels[action.side].size = newSize;
      return;
    }
    case "PANEL_WIDGET_DRAG_START": {
      const panel = state.panels[action.side];
      const widgetIndex = panel.widgets.indexOf(action.id);

      state.floatingWidgets.allIds.push(action.newFloatingWidgetId);
      state.floatingWidgets.byId[action.newFloatingWidgetId] = {
        bounds: Rectangle.create(action.bounds).toProps(),
        userSized: action.userSized,
        id: action.newFloatingWidgetId,
        home: {
          side: action.side,
          widgetId: undefined,
          widgetIndex,
        },
      };
      state.widgets[action.newFloatingWidgetId] = state.widgets[action.id];
      state.widgets[action.newFloatingWidgetId].id = action.newFloatingWidgetId;
      delete state.widgets[action.id];

      panel.widgets.splice(widgetIndex, 1);

      const expandedWidget = panel.widgets.find((widgetId) => {
        return state.widgets[widgetId].minimized === false;
      });
      if (!expandedWidget && panel.widgets.length > 0) {
        const firstWidget = state.widgets[panel.widgets[0]];
        firstWidget.minimized = false;
      }
      return;
    }
    case "WIDGET_DRAG": {
      const floatingWidget = state.floatingWidgets.byId[action.floatingWidgetId];
      assert(!!floatingWidget);
      const newBounds = Rectangle.create(floatingWidget.bounds).offset(action.dragBy);
      setRectangleProps(floatingWidget.bounds, newBounds);
      return;
    }
    case "WIDGET_DRAG_END": {
      // TODO: handle duplicates in WIDGET_TAB_DRAG_END action
      const target = action.target;
      const floatingWidget = state.floatingWidgets.byId[action.floatingWidgetId];
      const draggedWidget = state.widgets[action.floatingWidgetId];
      if (isWindowDropTargetState(target)) {
        const nzBounds = Rectangle.createFromSize(state.size);
        if (draggedWidget.minimized) {
          const bounds = Rectangle.create(floatingWidget.bounds);
          const containedBounds = bounds.setHeight(35).containIn(nzBounds);
          const newBounds = Rectangle.create(floatingWidget.bounds).setPosition(containedBounds.topLeft());
          setRectangleProps(floatingWidget.bounds, newBounds);
        } else {
          const containedBounds = Rectangle.create(floatingWidget.bounds).containIn(nzBounds);
          setRectangleProps(floatingWidget.bounds, containedBounds);
        }
        floatingWidgetBringToFront(state, action.floatingWidgetId);
        return;
      }
      if (isTabDropTargetState(target)) {
        updateHomeOfToolSettingsWidget(state, target.widgetId, floatingWidget.home);
        const targetWidget = state.widgets[target.widgetId];
        targetWidget.tabs.splice(target.tabIndex, 0, ...draggedWidget.tabs);
      } else if (isSectionDropTargetState(target)) {
        const panel = state.panels[target.side];
        panel.widgets.splice(target.sectionIndex, 0, target.newWidgetId);
        panel.collapsed = false;
        state.widgets[target.newWidgetId] = {
          ...draggedWidget,
          id: target.newWidgetId,
        };
      } else if (isWidgetDropTargetState(target)) {
        updateHomeOfToolSettingsWidget(state, target.widgetId, floatingWidget.home);
        const widget = findWidget(state, target.widgetId);
        if (widget && isPanelWidgetLocation(widget)) {
          const panel = state.panels[widget.side];
          panel.collapsed = false;
        }
        const targetWidget = state.widgets[target.widgetId];
        targetWidget.tabs.splice(targetWidget.tabs.length, 0, ...draggedWidget.tabs);
      } else {
        const panelSectionId = getWidgetPanelSectionId(target.side, 0);
        const panel = state.panels[target.side];
        panel.widgets = [panelSectionId];
        panel.collapsed = false;
        state.widgets[panelSectionId] = {
          ...draggedWidget,
          id: panelSectionId,
          minimized: false,
        };
      }
      delete state.widgets[action.floatingWidgetId];
      delete state.floatingWidgets.byId[action.floatingWidgetId];
      const idIndex = state.floatingWidgets.allIds.indexOf(action.floatingWidgetId);
      state.floatingWidgets.allIds.splice(idIndex, 1);
      return;
    }
    case "FLOATING_WIDGET_RESIZE": {
      const { resizeBy } = action;
      const floatingWidget = state.floatingWidgets.byId[action.id];
      // if this is not a tool settings widget then set the userSized flag
      // istanbul ignore else
      if (!isToolSettingsFloatingWidget(state, action.id)) {
        floatingWidget.userSized = true;
      }

      assert(!!floatingWidget);
      const bounds = Rectangle.create(floatingWidget.bounds);
      const newBounds = bounds.inset(-resizeBy.left, -resizeBy.top, -resizeBy.right, -resizeBy.bottom);
      setRectangleProps(floatingWidget.bounds, newBounds);

      const widget = state.widgets[action.id];
      const size = newBounds.getSize();
      const tab = state.tabs[widget.activeTabId];
      initSizeProps(tab, "preferredFloatingWidgetSize", size);
      tab.userSized = true;
      return;
    }

    case "FLOATING_WIDGET_CLEAR_USER_SIZED": {
      floatingWidgetClearUserSizedFlag(state, action.id);
      return;
    }

    case "FLOATING_WIDGET_BRING_TO_FRONT": {
      floatingWidgetBringToFront(state, action.id);
      return;
    }
    case "FLOATING_WIDGET_SEND_BACK": {
      const floatingWidget = state.floatingWidgets.byId[action.id];
      const widget = state.widgets[action.id];
      const home = floatingWidget.home;
      const panel = state.panels[home.side];
      const destinationWidgetId = home.widgetId ?? getWidgetPanelSectionId(panel.side, home.widgetIndex);

      let destinationWidget = state.widgets[destinationWidgetId];

      // Use existing panel section (from widgetIndex) if new widgets can't be added to the panel.
      if (!destinationWidget && panel.widgets.length === panel.maxWidgetCount) {
        const id = panel.widgets[home.widgetIndex];
        destinationWidget = state.widgets[id];
      }

      // Add tabs to an existing widget.
      if (destinationWidget) {
        destinationWidget.tabs.push(...widget.tabs);
        removeWidget(state, widget.id);
        return;
      }

      // Add a new widget.
      state.widgets[destinationWidgetId] = {
        activeTabId: widget.tabs[0],
        id: destinationWidgetId,
        minimized: false,
        tabs: [...widget.tabs],
      };

      let insertIndex = destinationWidgetId.endsWith("End") ? 1 : 0;
      // istanbul ignore next
      if (0 === panel.widgets.length)
        insertIndex = 0;
      panel.widgets.splice(insertIndex, 0, destinationWidgetId);
      widget.minimized = false;

      removeWidget(state, widget.id);
      return;
    }
    case "POPOUT_WIDGET_SEND_BACK": {
      const popoutWidget = state.popoutWidgets.byId[action.id];
      const widget = state.widgets[action.id];
      const home = popoutWidget.home;
      const panel = state.panels[home.side];
      let widgetPanelSectionId = home.widgetId;
      let homeWidgetPanelSection;
      if (widgetPanelSectionId) {
        homeWidgetPanelSection = state.widgets[widgetPanelSectionId];
      } else {
        widgetPanelSectionId = getWidgetPanelSectionId(panel.side, home.widgetIndex);
        homeWidgetPanelSection = state.widgets[widgetPanelSectionId];
      }

      if (homeWidgetPanelSection) {
        homeWidgetPanelSection.tabs.push(...widget.tabs);
        removeWidget(state, popoutWidget.id);
      } else {
        // if widget panel section was removed because it was empty insert it
        state.widgets[widgetPanelSectionId] = {
          activeTabId: widget.tabs[0],
          id: widgetPanelSectionId,
          minimized: false,
          tabs: [...widget.tabs],
        };

        let insertIndex = widgetPanelSectionId.endsWith("End") ? 1 : 0;
        // istanbul ignore next
        if (0 === panel.widgets.length)
          insertIndex = 0;
        panel.widgets.splice(insertIndex, 0, widgetPanelSectionId);
        widget.minimized = false;
        removeWidget(state, popoutWidget.id);
        removePopoutWidget(state, popoutWidget.id);
      }
      return;
    }

    case "WIDGET_TAB_CLICK": {
      const widget = state.widgets[action.widgetId];
      // const isActive = action.id === widget.activeTabId;
      const floatingWidget = state.floatingWidgets.byId[action.widgetId];
      if (floatingWidget) {
        const size = Rectangle.create(floatingWidget.bounds).getSize();
        const activeTab = state.tabs[action.id];
        initSizeProps(activeTab, "preferredFloatingWidgetSize", size);
      }

      setWidgetActiveTabId(state, widget.id, action.id);
      if (widget.minimized) {
        widget.minimized = false;
        return;
      }
      return;
    }

    case "WIDGET_TAB_DOUBLE_CLICK": {
      const widget = state.widgets[action.widgetId];
      // istanbul ignore else
      if (action.floatingWidgetId !== undefined) {
        const active = action.id === widget.activeTabId;
        if (!active) {
          setWidgetActiveTabId(state, widget.id, action.id);
          return;
        }
        widget.minimized = !widget.minimized;
      }
      return;
    }
    case "WIDGET_TAB_DRAG_START": {
      const tabId = action.id;
      let home: FloatingWidgetHomeState | undefined;
      if (action.floatingWidgetId) {
        const floatingWidget = state.floatingWidgets.byId[action.floatingWidgetId];
        home = floatingWidget.home;
      } else {
        assert(!!action.side);
        const panel = state.panels[action.side];
        const widgetIndex = panel.widgets.indexOf(action.widgetId);
        home = {
          side: action.side,
          widgetId: action.widgetId,
          widgetIndex,
        };
      }
      state.draggedTab = {
        tabId,
        position: Point.create(action.position).toProps(),
        home,
      };
      removeWidgetTabInternal(state, action.widgetId, action.floatingWidgetId, undefined, action.side, action.id);
      return;
    }
    case "WIDGET_TAB_DRAG": {
      const draggedTab = state.draggedTab;
      assert(!!draggedTab);
      const newPosition = Point.create(draggedTab.position).offset(action.dragBy);
      setPointProps(draggedTab.position, newPosition);
      return;
    }
    case "WIDGET_TAB_DRAG_END": {
      assert(!!state.draggedTab);
      const target = action.target;
      if (isTabDropTargetState(target)) {
        updateHomeOfToolSettingsWidget(state, target.widgetId, state.draggedTab.home);
        const targetWidget = state.widgets[target.widgetId];
        const tabIndex = target.tabIndex;
        targetWidget.tabs.splice(tabIndex, 0, action.id);
      } else if (isPanelDropTargetState(target)) {
        const panel = state.panels[target.side];
        panel.widgets.push(target.newWidgetId);
        panel.collapsed = false;
        state.widgets[target.newWidgetId] = {
          activeTabId: action.id,
          id: target.newWidgetId,
          minimized: false,
          tabs: [action.id],
        };

      } else if (isSectionDropTargetState(target)) {
        const panel = state.panels[target.side];
        panel.widgets.splice(target.sectionIndex, 0, target.newWidgetId);
        panel.collapsed = false;
        state.widgets[target.newWidgetId] = {
          activeTabId: action.id,
          id: target.newWidgetId,
          minimized: false,
          tabs: [action.id],
        };
      } else if (isWidgetDropTargetState(target)) {
        updateHomeOfToolSettingsWidget(state, target.widgetId, state.draggedTab.home);
        const widget = findWidget(state, target.widgetId);
        if (widget && isPanelWidgetLocation(widget)) {
          const panel = state.panels[widget.side];
          panel.collapsed = false;
        }
        const targetWidget = state.widgets[target.widgetId];
        const tabIndex = targetWidget.tabs.length;
        targetWidget.tabs.splice(tabIndex, 0, action.id);
      } else {
        const tab = state.tabs[state.draggedTab.tabId];
        const nzBounds = Rectangle.createFromSize(state.size);
        const bounds = Rectangle.createFromSize(tab.preferredFloatingWidgetSize || target.size).offset(state.draggedTab.position);
        const containedBounds = bounds.containIn(nzBounds);
        const userSized = tab.userSized || (tab.isFloatingStateWindowResizable && /* istanbul ignore next */ !!tab.preferredFloatingWidgetSize);

        state.floatingWidgets.byId[target.newFloatingWidgetId] = {
          bounds: containedBounds.toProps(),
          id: target.newFloatingWidgetId,
          home: state.draggedTab.home,
          userSized,
        };
        state.floatingWidgets.allIds.push(target.newFloatingWidgetId);
        state.widgets[target.newFloatingWidgetId] = {
          activeTabId: action.id,
          id: target.newFloatingWidgetId,
          minimized: false,
          tabs: [action.id],
        };
      }
      state.draggedTab = undefined;
      return;
    }
    case "TOOL_SETTINGS_DRAG_START": {
      if (isDockedToolSettingsState(state.toolSettings)) {
        const tab = state.tabs[toolSettingsTabId];
        state.toolSettings = {
          type: "widget",
        };
        state.widgets[action.newFloatingWidgetId] = {
          activeTabId: toolSettingsTabId,
          id: action.newFloatingWidgetId,
          minimized: false,
          tabs: [toolSettingsTabId],
        };
        const size = tab.preferredFloatingWidgetSize || { height: 200, width: 300 };
        state.floatingWidgets.byId[action.newFloatingWidgetId] = {
          bounds: Rectangle.createFromSize(size).toProps(),
          id: action.newFloatingWidgetId,
          home: {
            side: "left",
            widgetId: undefined,
            widgetIndex: 0,
          },
        };
        state.floatingWidgets.allIds.push(action.newFloatingWidgetId);
      }
      return;
    }
    case "TOOL_SETTINGS_DOCK": {
      removeWidgetTab(state, toolSettingsTabId);
      state.toolSettings = {
        type: "docked",
      };
      return;
    }
  }
});

/** @internal */
export function getWidgetPanelSectionId(side: PanelSide, panelSectionIndex: number) {
  return 0 === panelSectionIndex ? `${side}Start` : `${side}End`;
}

function isToolSettingsFloatingWidget(state: Draft<NineZoneState>, id: WidgetState["id"]) {
  const widget = state.widgets[id];
  return (widget.tabs.length === 1 &&
    widget.tabs[0] === toolSettingsTabId &&
    id in state.floatingWidgets.byId
  );
}

/** Updated home state of floating tool settings widget. */
function updateHomeOfToolSettingsWidget(state: Draft<NineZoneState>, id: WidgetState["id"], home: FloatingWidgetHomeState) {
  if (!isToolSettingsFloatingWidget(state, id))
    return;
  state.floatingWidgets.byId[id].home = home;
}

/** @internal */
export function floatingWidgetBringToFront(state: Draft<NineZoneState>, floatingWidgetId: FloatingWidgetState["id"]) {
  const idIndex = state.floatingWidgets.allIds.indexOf(floatingWidgetId);
  const spliced = state.floatingWidgets.allIds.splice(idIndex, 1);
  state.floatingWidgets.allIds.push(spliced[0]);
}

/** @internal */
export function floatingWidgetClearUserSizedFlag(state: Draft<NineZoneState>, floatingWidgetId: FloatingWidgetState["id"]) {
  const floatingWidget = state.floatingWidgets.byId[floatingWidgetId];
  floatingWidget.userSized = false;
  const widget = state.widgets[floatingWidgetId];
  const tab = state.tabs[widget.activeTabId];
  tab.userSized = false;
}

/** Removes tab from the UI, but keeps the tab state.
 * @internal
 */
export function removeWidgetTab(state: Draft<NineZoneState>, tabId: TabState["id"]) {
  const location = findTab(state, tabId);
  if (!location)
    return;
  const floatingWidgetId = "floatingWidgetId" in location ? location.floatingWidgetId : undefined;
  const popoutWidgetId = "popoutWidgetId" in location ? location.popoutWidgetId : undefined;
  const side = "side" in location ? location.side : undefined;
  return removeWidgetTabInternal(state, location.widgetId, floatingWidgetId, popoutWidgetId, side, tabId);
}

/** Removes tab from the UI and deletes the tab state.
 * @internal
 */
export function removeTab(state: Draft<NineZoneState>, tabId: TabState["id"]) {
  removeWidgetTab(state, tabId);
  // keep state.tabs[tabId] around for preferred size info
}

function removeWidgetTabInternal(
  state: Draft<NineZoneState>,
  widgetId: WidgetState["id"],
  floatingWidgetId: FloatingWidgetState["id"] | undefined,
  popoutWidgetId: PopoutWidgetState["id"] | undefined,
  side: PanelSide | undefined,
  tabId: TabState["id"],
) {
  const widget = state.widgets[widgetId];
  const tabs = widget.tabs;
  const tabIndex = tabs.indexOf(tabId);
  tabs.splice(tabIndex, 1);
  if (tabId === widget.activeTabId) {
    setWidgetActiveTabId(state, widget.id, widget.tabs[0]);
  }

  if (tabs.length === 0) {
    if (floatingWidgetId !== undefined) {
      state.floatingWidgets.byId[floatingWidgetId].hidden = true;
      const idIndex = state.floatingWidgets.allIds.indexOf(floatingWidgetId);
      state.floatingWidgets.allIds.splice(idIndex, 1);
    }
    if (popoutWidgetId !== undefined) {
      delete state.popoutWidgets.byId[popoutWidgetId];
      const idIndex = state.popoutWidgets.allIds.indexOf(popoutWidgetId);
      state.popoutWidgets.allIds.splice(idIndex, 1);
    }
    if (side) {
      const widgets = state.panels[side].widgets;
      const widgetIndex = widgets.indexOf(widgetId);
      widgets.splice(widgetIndex, 1);

      const expandedWidget = widgets.find((wId) => {
        return state.widgets[wId].minimized === false;
      });
      if (!expandedWidget && widgets.length > 0) {
        const firstWidget = state.widgets[widgets[0]];
        firstWidget.minimized = false;
      }
    }
    delete state.widgets[widgetId];
  }
}

function removeWidget(state: Draft<NineZoneState>, id: WidgetState["id"]) {
  delete state.widgets[id];
  removeFloatingWidget(state, id);
  removePopoutWidget(state, id);
}

function removeFloatingWidget(state: Draft<NineZoneState>, id: FloatingWidgetState["id"]) {
  if (id in state.floatingWidgets.byId)
    state.floatingWidgets.byId[id].hidden = true;
  const index = state.floatingWidgets.allIds.indexOf(id);
  index >= 0 && state.floatingWidgets.allIds.splice(index, 1);
}

function removePopoutWidget(state: Draft<NineZoneState>, id: PopoutWidgetState["id"]) {
  // istanbul ignore else
  if (state.popoutWidgets) {
    delete state.popoutWidgets.byId[id];
    const index = state.popoutWidgets.allIds.indexOf(id);
    index >= 0 && state.popoutWidgets.allIds.splice(index, 1);
  }
}

function setWidgetActiveTabId(
  state: Draft<NineZoneState>,
  widgetId: WidgetState["id"],
  tabId: WidgetState["activeTabId"],
) {
  state.widgets[widgetId].activeTabId = tabId;
  const floatingWidget = state.floatingWidgets.byId[widgetId];
  if (floatingWidget && tabId && (tabId in state.tabs)) {
    const activeTab = state.tabs[tabId];
    const size = Rectangle.create(floatingWidget.bounds).getSize();
    initSizeProps(activeTab, "preferredFloatingWidgetSize", size);
  }
}

/** @internal */
export function createPanelsState(args?: Partial<PanelsState>): PanelsState {
  return {
    bottom: createHorizontalPanelState("bottom"),
    left: createVerticalPanelState("left"),
    right: createVerticalPanelState("right"),
    top: createHorizontalPanelState("top"),
    ...args,
  };
}

/** @internal */
export function createTabsState(args?: Partial<TabsState>): TabsState {
  return {
    [toolSettingsTabId]: createTabState(toolSettingsTabId, {
      label: "Tool Settings",
      allowedPanelTargets: ["bottom", "left", "right"],
    }),
    ...args,
  };
}

/** @internal */
export function createNineZoneState(args?: Partial<NineZoneState>): NineZoneState {
  return {
    draggedTab: undefined,
    floatingWidgets: {
      byId: {},
      allIds: [],
    },
    popoutWidgets: {
      byId: {},
      allIds: [],
    },
    panels: createPanelsState(),
    widgets: {},
    tabs: createTabsState(),
    toolSettings: {
      type: "docked",
    },
    size: {
      height: 0,
      width: 0,
    },
    ...args,
  };
}

/** @internal */
export function createWidgetState(id: WidgetState["id"], tabs: WidgetState["tabs"], args?: Partial<WidgetState>): WidgetState {
  assert(tabs.length !== 0);
  return {
    activeTabId: tabs[0],
    id,
    minimized: false,
    tabs,
    ...args,
  };
}

/** @internal */
export function createFloatingWidgetState(id: FloatingWidgetState["id"], args?: Partial<FloatingWidgetState>): FloatingWidgetState {
  return {
    bounds: new Rectangle().toProps(),
    id,
    home: {
      side: "left",
      widgetId: undefined,
      widgetIndex: 0,
    },
    hidden: false,
    ...args,
  };
}
/** @internal */
export function createPopoutWidgetState(id: PopoutWidgetState["id"], args?: Partial<PopoutWidgetState>): PopoutWidgetState {
  return {
    bounds: new Rectangle().toProps(),
    id,
    home: {
      side: "left",
      widgetId: undefined,
      widgetIndex: 0,
    },
    ...args,
  };
}

/** @internal */
export function createTabState(id: TabState["id"], args?: Partial<TabState>): TabState {
  return {
    allowedPanelTargets: undefined,
    id,
    label: "",
    ...args,
  };
}

/** @internal */
export function createDraggedTabState(tabId: DraggedTabState["tabId"], args?: Partial<DraggedTabState>): DraggedTabState {
  return {
    tabId,
    home: {
      side: "left",
      widgetId: undefined,
      widgetIndex: 0,
    },
    position: new Point().toProps(),
    ...args,
  };
}

/** @internal */
export function addPanelWidget(state: NineZoneState, side: PanelSide, id: WidgetState["id"], tabs: WidgetState["tabs"], widgetArgs?: Partial<WidgetState>): NineZoneState {
  const widget = createWidgetState(id, tabs, widgetArgs);
  return produce(state, (stateDraft) => {
    stateDraft.widgets[widget.id] = castDraft(widget);
    stateDraft.panels[side].widgets.push(widget.id);
  });
}

/** @internal */
export function addFloatingWidget(state: NineZoneState, id: FloatingWidgetState["id"], tabs: WidgetState["tabs"], floatingWidgetArgs?: Partial<FloatingWidgetState>,
  widgetArgs?: Partial<WidgetState>,
): NineZoneState {
  if (id in state.floatingWidgets.byId) {
    const widget = createWidgetState(id, tabs, widgetArgs);
    return produce(state, (stateDraft) => {
      stateDraft.floatingWidgets.byId[id].hidden = false;
      stateDraft.floatingWidgets.allIds.push(id);
      stateDraft.widgets[id] = castDraft(widget);
    });
  } else {
    const floatingWidget = createFloatingWidgetState(id, floatingWidgetArgs);
    const widget = createWidgetState(id, tabs, widgetArgs);
    return produce(state, (stateDraft) => {
      stateDraft.floatingWidgets.byId[id] = floatingWidget;
      stateDraft.floatingWidgets.allIds.push(id);
      stateDraft.widgets[id] = castDraft(widget);
    });
  }
}

/** @internal */
export function addPopoutWidget(state: NineZoneState, id: PopoutWidgetState["id"], tabs: WidgetState["tabs"], popoutWidgetArgs?: Partial<PopoutWidgetState>,
  widgetArgs?: Partial<WidgetState>,
): NineZoneState {
  const popoutWidget = createPopoutWidgetState(id, popoutWidgetArgs);
  const widget = createWidgetState(id, tabs, widgetArgs);
  return produce(state, (stateDraft) => {
    stateDraft.popoutWidgets.byId[id] = popoutWidget;
    stateDraft.popoutWidgets.allIds.push(id);
    stateDraft.widgets[id] = castDraft(widget);
  });
}

/** @internal */
export function addTab(state: NineZoneState, id: TabState["id"], tabArgs?: Partial<TabState>): NineZoneState {
  const tab = {
    ...createTabState(id),
    ...tabArgs,
  };
  return produce(state, (stateDraft) => {
    stateDraft.tabs[id] = tab;
  });
}

/** @internal */
export function createPanelState(side: PanelSide) {
  return {
    collapseOffset: 100,
    collapsed: false,
    maxSize: 600,
    minSize: 200,
    pinned: true,
    resizable: true,
    side,
    size: undefined,
    widgets: [],
    maxWidgetCount: getMaxWidgetCount(side),
    splitterPercent: 50,
  };
}

/** @internal */
export function createVerticalPanelState(side: VerticalPanelSide, args?: Partial<VerticalPanelState>): VerticalPanelState {
  return {
    ...createPanelState(side),
    side,
    ...args,
  };
}

/** @internal */
export function createHorizontalPanelState(side: HorizontalPanelSide, args?: Partial<HorizontalPanelState>): HorizontalPanelState {
  return {
    ...createPanelState(side),
    minSize: 100,
    side,
    span: true,
    ...args,
  };
}

/** @internal */
export function isHorizontalPanelState(state: PanelState): state is HorizontalPanelState {
  return isHorizontalPanelSide(state.side);
}

/** @internal */
export function isTabDropTargetState(state: DropTargetState): state is TabDropTargetState {
  return state.type === "tab";
}

/** @internal */
export function isPanelDropTargetState(state: DropTargetState): state is PanelDropTargetState {
  return state.type === "panel";
}

/** @internal */
export function isSectionDropTargetState(state: DropTargetState): state is SectionDropTargetState {
  return state.type === "section";
}

/** @internal */
export function isWidgetDropTargetState(state: DropTargetState): state is WidgetDropTargetState {
  return state.type === "widget";
}

function isWindowDropTargetState(state: WidgetDragDropTargetState): state is WindowDropTargetState {
  return state.type === "window";
}

function isDockedToolSettingsState(state: ToolSettingsState): state is DockedToolSettingsState {
  return state.type === "docked";
}

/** @internal */
export function isWidgetDragDropTargetState(state: DropTargetState): state is WidgetDragDropTargetState {
  if (state.type === "floatingWidget")
    return false;
  return true;
}

/** @internal */
export function isTabDragDropTargetState(state: DropTargetState): state is TabDragDropTargetState {
  if (state.type === "window")
    return false;
  return true;
}

/** @internal */
export function setRectangleProps(props: Draft<RectangleProps>, bounds: RectangleProps) {
  props.left = bounds.left;
  props.right = bounds.right;
  props.top = bounds.top;
  props.bottom = bounds.bottom;
}

function setPointProps(props: Draft<PointProps>, point: PointProps) {
  props.x = point.x;
  props.y = point.y;
}

function setSizeProps(props: Draft<SizeProps>, size: SizeProps) {
  props.height = size.height;
  props.width = size.width;
}

type KeysOfType<T, Type> = { [K in keyof T]: T[K] extends Type ? K : never }[keyof T];

function initSizeProps<T, K extends KeysOfType<T, SizeProps | undefined>>(obj: T, key: K, size: SizeProps) {
  if (obj[key]) {
    setSizeProps(obj[key], size);
    return;
  }
  (obj[key] as SizeProps) = {
    height: size.height,
    width: size.width,
  };
}

function setSizeAndPointProps(props: Draft<SizeAndPositionProps>, inValue: SizeAndPositionProps) {
  props.x = inValue.x;
  props.y = inValue.y;
  props.height = inValue.height;
  props.width = inValue.width;
}

/** @internal */
export function initSizeAndPositionProps<T, K extends KeysOfType<T, SizeAndPositionProps | undefined>>(obj: T, key: K, inValue: SizeAndPositionProps) {
  if (obj[key]) {
    setSizeAndPointProps(obj[key], inValue);
    return;
  }
  (obj[key] as SizeAndPositionProps) = {
    x: inValue.x,
    y: inValue.y,
    height: inValue.height,
    width: inValue.width,
  };
}

// note: panel side is no longer needed since only 2 panel sections are desired for any "PanelSide"
function getMaxWidgetCount(_side: PanelSide) {
  return 2;
}

interface PanelLocation {
  widgetId: WidgetState["id"];
  side: PanelSide;
}

interface FloatingLocation {
  widgetId: WidgetState["id"];
  floatingWidgetId: FloatingWidgetState["id"];
}

interface PopoutLocation {
  widgetId: WidgetState["id"];
  popoutWidgetId: PopoutWidgetState["id"];
}

type TabLocation = PanelLocation | FloatingLocation | PopoutLocation;

/** @internal */
export function isFloatingLocation(location: TabLocation): location is FloatingLocation {
  return "floatingWidgetId" in location;
}

/** @internal */
export function isPopoutLocation(location: TabLocation): location is PopoutLocation {
  return "popoutWidgetId" in location;
}

/** @internal */
export function isPanelLocation(location: TabLocation): location is PanelLocation {
  return "side" in location;
}

/** @internal */
export function isFloatingWidgetLocation(location: WidgetLocation): location is FloatingWidgetLocation {
  return "floatingWidgetId" in location;
}

/** @internal */
export function isPopoutWidgetLocation(location: WidgetLocation): location is PopoutWidgetLocation {
  return "popoutWidgetId" in location;
}

function isPanelWidgetLocation(location: WidgetLocation): location is PanelWidgetLocation {
  return "side" in location;
}

/** @internal */
export function findTab(state: NineZoneState, id: TabState["id"]): TabLocation | undefined {
  let widgetId;
  for (const [, widget] of Object.entries(state.widgets)) {
    const index = widget.tabs.indexOf(id);
    if (index >= 0) {
      widgetId = widget.id;
      break;
    }
  }
  if (!widgetId)
    return undefined;
  const widgetLocation = findWidget(state, widgetId);
  return widgetLocation ? {
    ...widgetLocation,
    widgetId,
  } : undefined;
}

interface PanelWidgetLocation {
  side: PanelSide;
}

interface FloatingWidgetLocation {
  floatingWidgetId: FloatingWidgetState["id"];
}

interface PopoutWidgetLocation {
  popoutWidgetId: PopoutWidgetState["id"];
}

type WidgetLocation = PanelWidgetLocation | FloatingWidgetLocation | PopoutWidgetLocation;

/** @internal */
export function findWidget(state: NineZoneState, id: WidgetState["id"]): WidgetLocation | undefined {
  if (id in state.floatingWidgets.byId) {
    return {
      floatingWidgetId: id,
    };
  }
  // istanbul ignore else
  if (state.popoutWidgets) {
    if (id in state.popoutWidgets.byId) {
      return {
        popoutWidgetId: id,
      };
    }
  }
  for (const side of panelSides) {
    const panel = state.panels[side];
    const index = panel.widgets.indexOf(id);
    if (index >= 0) {
      return {
        side,
      };
    }
  }
  return undefined;
}

/** @internal */
export function floatWidget(state: NineZoneState, widgetTabId: string, point?: PointProps, size?: SizeProps) {
  const location = findTab(state, widgetTabId);
  if (location) {
    if (isFloatingLocation(location))
      return undefined; // already floating

    const tab = state.tabs[widgetTabId];
    const preferredSize = size ?? (tab.preferredFloatingWidgetSize ?? { height: 400, width: 400 });
    const preferredPoint = point ?? { x: 50, y: 100 };
    const preferredBounds = Rectangle.createFromSize(preferredSize).offset(preferredPoint);
    const nzBounds = Rectangle.createFromSize(state.size);
    const containedBounds = preferredBounds.containIn(nzBounds);

    // istanbul ignore else - no else/using as type guard to cast
    if (isPanelLocation(location)) {
      const floatingWidgetId = widgetTabId ? widgetTabId : /* istanbul ignore next */ getUniqueId();
      const panel = state.panels[location.side];
      const widgetIndex = panel.widgets.indexOf(location.widgetId);

      return produce(state, (draft) => {
        const floatedTab = draft.tabs[widgetTabId];
        initSizeProps(floatedTab, "preferredFloatingWidgetSize", preferredSize);
        removeWidgetTab(draft, widgetTabId);
        draft.floatingWidgets.byId[floatingWidgetId] = {
          bounds: containedBounds.toProps(),
          id: floatingWidgetId,
          home: {
            side: location.side,
            widgetId: location.widgetId,
            widgetIndex,
          },
          hidden: false,
        };
        draft.floatingWidgets.allIds.push(floatingWidgetId);
        draft.widgets[floatingWidgetId] = {
          activeTabId: widgetTabId,
          id: floatingWidgetId,
          minimized: false,
          tabs: [widgetTabId],
          isFloatingStateWindowResizable: floatedTab.isFloatingStateWindowResizable,
        };
      });
    } else if (isPopoutLocation(location)) {
      return convertPopoutWidgetContainerToFloating(state, location.popoutWidgetId);
    }
  }
  return undefined;
}

/** @internal */
export function dockWidgetContainer(state: NineZoneState, widgetTabId: string, idIsContainerId?: boolean) {
  if (idIsContainerId) {
    const widgetLocation = findWidget(state, widgetTabId);
    if (widgetLocation) {
      if (isFloatingWidgetLocation(widgetLocation)) {
        const floatingWidgetId = widgetLocation.floatingWidgetId;
        return NineZoneStateReducer(state, {
          type: "FLOATING_WIDGET_SEND_BACK",
          id: floatingWidgetId,
        });
      } else {
        // istanbul ignore else
        if (isPopoutWidgetLocation(widgetLocation)) {
          const popoutWidgetId = widgetLocation.popoutWidgetId;
          return NineZoneStateReducer(state, {
            type: "POPOUT_WIDGET_SEND_BACK",
            id: popoutWidgetId,
          });
        }
      }
    }
  } else {
    const location = findTab(state, widgetTabId);
    if (location) {
      if (isFloatingLocation(location)) {
        const floatingWidgetId = location.widgetId;
        return NineZoneStateReducer(state, {
          type: "FLOATING_WIDGET_SEND_BACK",
          id: floatingWidgetId,
        });
      } else {
        // istanbul ignore else
        if (isPopoutLocation(location)) {
          const popoutWidgetId = location.widgetId;
          return NineZoneStateReducer(state, {
            type: "POPOUT_WIDGET_SEND_BACK",
            id: popoutWidgetId,
          });
        }
      }
    }
  }

  return undefined;
}

/** @internal */
export function convertFloatingWidgetContainerToPopout(state: NineZoneState, widgetContainerId: string): NineZoneState {
  // istanbul ignore next - not an expected condition
  if (!state.widgets[widgetContainerId]?.tabs || state.widgets[widgetContainerId].tabs.length !== 1) {
    // currently only support popping out a floating widget container if it has a single tab
    return state;
  }
  return produce(state, (draft) => {
    const floatingWidget = state.floatingWidgets.byId[widgetContainerId];
    const bounds = floatingWidget.bounds;
    const home = floatingWidget.home;
    const id = floatingWidget.id;
    // remove the floating entry
    delete draft.floatingWidgets.byId[widgetContainerId];
    const idIndex = draft.floatingWidgets.allIds.indexOf(widgetContainerId);
    draft.floatingWidgets.allIds.splice(idIndex, 1);
    // insert popout entry
    draft.popoutWidgets.byId[widgetContainerId] = { bounds, id, home };
    draft.popoutWidgets.allIds.push(widgetContainerId);
  });
}

/** @internal */
export function convertPopoutWidgetContainerToFloating(state: NineZoneState, widgetContainerId: string): NineZoneState {
  return produce(state, (draft) => {
    const popoutWidget = state.popoutWidgets.byId[widgetContainerId];
    const bounds = popoutWidget.bounds;
    const home = popoutWidget.home;
    const id = popoutWidget.id;
    // remove the floating entry
    delete draft.popoutWidgets.byId[widgetContainerId];
    const idIndex = draft.popoutWidgets.allIds.indexOf(widgetContainerId);
    draft.popoutWidgets.allIds.splice(idIndex, 1);
    // insert popout entry
    draft.floatingWidgets.byId[widgetContainerId] = { bounds, id, home };
    draft.floatingWidgets.allIds.push(widgetContainerId);
  });
}

/**
   * When running in web-browser - browser prohibits auto opening of popup windows so convert any PopoutWidgets to
   * FloatingWidgets in this situation.
   * @internal
   */
export function convertAllPopupWidgetContainersToFloating(state: NineZoneState): NineZoneState {
  return produce(state, (draft) => {
    for (const widgetContainerId of state.popoutWidgets.allIds) {
      const popoutWidget = state.popoutWidgets.byId[widgetContainerId];
      const bounds = popoutWidget.bounds;
      const home = popoutWidget.home;
      const id = popoutWidget.id;
      // remove the popout entry
      delete draft.popoutWidgets.byId[widgetContainerId];
      const idIndex = draft.popoutWidgets.allIds.indexOf(widgetContainerId);
      draft.popoutWidgets.allIds.splice(idIndex, 1);
      // insert floating entry
      draft.floatingWidgets.byId[widgetContainerId] = { bounds, id, home };
      draft.floatingWidgets.allIds.push(widgetContainerId);
    }
  });
}

/** @internal */
export function popoutWidgetToChildWindow(state: NineZoneState, widgetTabId: string, point?: PointProps, size?: SizeProps) {
  const location = findTab(state, widgetTabId);
  // istanbul ignore else
  if (location) {
    if (isPopoutLocation(location))
      return undefined; // already popout

    const tab = state.tabs[widgetTabId];
    const preferredSizeAndPosition = { height: 800, width: 600, x: 0, y: 0, ...tab.preferredPopoutWidgetSize, ...size, ...point };
    const preferredBounds = Rectangle.createFromSize(preferredSizeAndPosition).offset(preferredSizeAndPosition);

    const nzBounds = Rectangle.createFromSize(state.size);
    const containedBounds = preferredBounds.containIn(nzBounds);
    const popoutWidgetId = getUniqueId();

    // istanbul ignore else - no else/using as type guard to cast
    if (isPanelLocation(location)) {
      const panel = state.panels[location.side];
      const widgetIndex = panel.widgets.indexOf(location.widgetId);

      return produce(state, (draft) => {
        const popoutTab = draft.tabs[widgetTabId];
        initSizeAndPositionProps(popoutTab, "preferredPopoutWidgetSize", preferredSizeAndPosition);
        removeWidgetTab(draft, widgetTabId);
        if (!draft.popoutWidgets) {
          draft.popoutWidgets = {
            byId: {},
            allIds: [],
          };
        }
        draft.popoutWidgets.byId[popoutWidgetId] = {
          bounds: containedBounds.toProps(),
          id: popoutWidgetId,
          home: {
            side: location.side,
            widgetId: location.widgetId,
            widgetIndex,
          },
        };
        draft.popoutWidgets.allIds.push(popoutWidgetId);
        draft.widgets[popoutWidgetId] = {
          activeTabId: widgetTabId,
          id: popoutWidgetId,
          minimized: false,
          tabs: [widgetTabId],
        };
      });
    } else if (isFloatingLocation(location)) {
      const floatingWidget = state.widgets[location.floatingWidgetId];
      // popout widget can only have a single widgetTab so if that is the case just convert floating container to popout container
      if (floatingWidget.tabs.length === 1) {
        return produce(convertFloatingWidgetContainerToPopout(state, location.floatingWidgetId), (draft) => {
          const popoutTab = draft.tabs[widgetTabId];
          initSizeAndPositionProps(popoutTab, "preferredPopoutWidgetSize", preferredSizeAndPosition);
        });
      }

      // remove the tab from the floating container and create a new popout container
      const home = state.floatingWidgets.byId[location.floatingWidgetId].home;
      return produce(state, (draft) => {
        const popoutTab = draft.tabs[widgetTabId];
        initSizeAndPositionProps(popoutTab, "preferredPopoutWidgetSize", preferredSizeAndPosition);
        removeWidgetTab(draft, widgetTabId);
        if (!draft.popoutWidgets) {
          draft.popoutWidgets = {
            byId: {},
            allIds: [],
          };
        }
        draft.popoutWidgets.byId[popoutWidgetId] = {
          bounds: containedBounds.toProps(),
          id: popoutWidgetId,
          home,
        };
        draft.popoutWidgets.allIds.push(popoutWidgetId);
        draft.widgets[popoutWidgetId] = {
          activeTabId: widgetTabId,
          id: popoutWidgetId,
          minimized: false,
          tabs: [widgetTabId],
        };
      });
    }
  }
  return undefined;
}

/**
 * @internal
 */
export function setFloatingWidgetContainerBounds(state: NineZoneState, floatingWidgetId: string, bounds: RectangleProps) {
  if (floatingWidgetId in state.floatingWidgets.byId) {
    return produce(state, (draft) => {
      draft.floatingWidgets.byId[floatingWidgetId].bounds = bounds;
      draft.floatingWidgets.byId[floatingWidgetId].userSized = true;
    });
  }
  return state;
}

/** Add a widget tab to specified panel section and create section if necessary
 * @internal
 */
export function addWidgetTabToPanelSection(state: NineZoneState, side: PanelSide, panelSectionWidgetId: string, widgetTabId: string) {
  return produce(state, (draft) => {
    const panel = draft.panels[side];
    const widgetPanelSection = draft.widgets[panelSectionWidgetId];
    if (widgetPanelSection) {
      widgetPanelSection.tabs.push(widgetTabId);
    } else {
      draft.widgets[panelSectionWidgetId] = {
        activeTabId: widgetTabId,
        id: panelSectionWidgetId,
        minimized: false,
        tabs: [widgetTabId],
      };

      let insertIndex = panelSectionWidgetId.endsWith("Start") ? 0 : 1;
      if (0 === panel.widgets.length)
        insertIndex = 0;
      panel.widgets.splice(insertIndex, 0, panelSectionWidgetId);
    }
  });
}

/**
 * Adds the floating tab to an existing draft state
 * @internal
 */
export function addWidgetTabToDraftFloatingPanel(draft: Draft<NineZoneState>, floatingWidgetId: string, widgetTabId: string,
  home: FloatingWidgetHomeState, tab: TabState, preferredSize?: SizeProps, preferredPosition?: PointProps,
  userSized?: boolean, isFloatingStateWindowResizable?: boolean) {
  const size = { height: 200, width: 300, ...tab.preferredFloatingWidgetSize, ...preferredSize };
  const preferredPoint = preferredPosition ?? { x: (draft.size.width - size.width) / 2, y: (draft.size.height - size.height) / 2 };
  const nzBounds = Rectangle.createFromSize(draft.size);
  const bounds = Rectangle.createFromSize(size).offset(preferredPoint);
  const containedBounds = bounds.containIn(nzBounds);

  // add new id to list of floatingWidgets
  if (!draft.floatingWidgets.allIds.includes(floatingWidgetId))
    draft.floatingWidgets.allIds.push(floatingWidgetId);

  // add new floating widget to array of widgets in the state
  const floatedTab = draft.tabs[widgetTabId];
  initSizeProps(floatedTab, "preferredFloatingWidgetSize", size);
  if (!(floatingWidgetId in draft.floatingWidgets.byId)) {
    draft.floatingWidgets.byId[floatingWidgetId] = {
      bounds: containedBounds.toProps(),
      id: floatingWidgetId,
      home,
      userSized,
    };
  }

  if (floatingWidgetId in draft.widgets) {
    draft.widgets[floatingWidgetId].tabs.push(widgetTabId);
  } else {
    draft.widgets[floatingWidgetId] = {
      activeTabId: widgetTabId,
      id: floatingWidgetId,
      minimized: false,
      tabs: [widgetTabId],
      isFloatingStateWindowResizable,
    };
  }
}

/** Add a new Floating Panel with a single widget tab
 * @internal
 */
export function addWidgetTabToFloatingPanel(state: NineZoneState, floatingWidgetId: string, widgetTabId: string,
  home: FloatingWidgetHomeState, preferredSize?: SizeProps, preferredPosition?: PointProps,
  userSized?: boolean, isFloatingStateWindowResizable?: boolean): NineZoneState {
  const location = findTab(state, widgetTabId);
  if (location || !(widgetTabId in state.tabs))
    return state;

  // tab must be defined but not placed in a container (ie not in panel, floating, or popout)
  const tab = state.tabs[widgetTabId];

  return produce(state, (draft) => {
    addWidgetTabToDraftFloatingPanel (draft, floatingWidgetId, widgetTabId, home, tab, preferredSize, preferredPosition, userSized, isFloatingStateWindowResizable);
  });
}
