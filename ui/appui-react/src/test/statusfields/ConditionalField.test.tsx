/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import * as React from "react";
import { ConditionalField, StatusBarSeparator } from "../../appui-react";
import { mount } from "../TestUtils";

/* eslint-disable deprecation/deprecation */
describe("ConditionalField", () => {

  it("should mount with isInFooterMode (deprecated)", () => {
    const wrapper = mount(
      <ConditionalField isInFooterMode={true} onOpenWidget={() => { }} openWidget="test"
        boolFunc={(props): boolean => props.isInFooterMode} >
        {(isInFooterMode: boolean) => isInFooterMode && <StatusBarSeparator />}
      </ConditionalField>);
    expect(wrapper.find(StatusBarSeparator).length).to.eq(1);
  });

  it("should mount with isInFooterMode=false (deprecated)", () => {
    const wrapper = mount(
      <ConditionalField isInFooterMode={false} onOpenWidget={() => { }} openWidget="test"
        boolFunc={(props): boolean => props.isInFooterMode} >
        {(isInFooterMode: boolean) => isInFooterMode && <StatusBarSeparator />}
      </ConditionalField>);
    expect(wrapper.find(StatusBarSeparator).length).to.eq(0);
  });

  it("should mount with isInFooterMode undefined", () => {
    const wrapper = mount(
      <ConditionalField
        boolFunc={(props): boolean => props.isInFooterMode} >
        {(isInFooterMode: boolean) => isInFooterMode && <StatusBarSeparator />}
      </ConditionalField>);
    expect(wrapper.find(StatusBarSeparator).length).to.eq(1);
  });

  it("should mount with children", () => {
    const wrapper = mount(
      <ConditionalField isInFooterMode={true} onOpenWidget={() => { }} openWidget="test"
        boolFunc={(props): boolean => props.isInFooterMode} defaultValue={false} >
        <StatusBarSeparator />
      </ConditionalField>);
    expect(wrapper.find(StatusBarSeparator).length).to.eq(1);
  });

  it("should mount with no children", () => {
    mount(
      <ConditionalField isInFooterMode={true} onOpenWidget={() => { }} openWidget="test"
        boolFunc={(props): boolean => props.isInFooterMode} >
      </ConditionalField>);
  });
});