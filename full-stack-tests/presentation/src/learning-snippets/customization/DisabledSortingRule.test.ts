/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { IModelConnection, SnapshotConnection } from "@itwin/core-frontend";
import { Ruleset, VariableValueTypes } from "@itwin/presentation-common";
import { Presentation } from "@itwin/presentation-frontend";
import { initialize, terminate } from "../../IntegrationTests";
import { printRuleset } from "../Utils";

describe("Learning Snippets", () => {

  let imodel: IModelConnection;

  beforeEach(async () => {
    await initialize();
    imodel = await SnapshotConnection.openFile("assets/datasets/Properties_60InstancesWithUrl2.ibim");
  });

  afterEach(async () => {
    await imodel.close();
    await terminate();
  });

  describe("Customization Rules", () => {

    describe("DisabledSortingRule", () => {

      it("uses `priority` attribute", async () => {
        // __PUBLISH_EXTRACT_START__ Presentation.DisabledSortingRule.Priority.Ruleset
        // The ruleset has root node rule that returns `bis.SpatialViewDefinition` instances with labels
        // consisting of `Roll` and `Pitch` property values. Also there are two customization rules to sort
        // instances by `Roll` property and to disable `bis.SpatialViewDefinition` instances sorting.
        // The disabled sorting rule has higher priority and it is handled first.
        const ruleset: Ruleset = {
          id: "example",
          rules: [{
            ruleType: "RootNodes",
            specifications: [{
              specType: "InstanceNodesOfSpecificClasses",
              classes: { schemaName: "BisCore", classNames: ["SpatialViewDefinition"] },
              groupByClass: false,
              groupByLabel: false,
            }],
          }, {
            ruleType: "InstanceLabelOverride",
            class: { schemaName: "BisCore", className: "SpatialViewDefinition" },
            values: [{
              specType: "Composite",
              separator: " x ",
              parts: [
                { spec: { specType: "Property", propertyName: "Roll" } },
                { spec: { specType: "Property", propertyName: "Pitch" } },
              ],
            }],
          }, {
            ruleType: "PropertySorting",
            priority: 1,
            class: { schemaName: "BisCore", className: "SpatialViewDefinition" },
            propertyName: "Pitch",
          }, {
            ruleType: "DisabledSorting",
            priority: 2,
            class: { schemaName: "BisCore", className: "SpatialViewDefinition" },
          }],
        };
        // __PUBLISH_EXTRACT_END__
        printRuleset(ruleset);

        // verify that nodes are not sorted by `Pitch` property
        const nodes = await Presentation.presentation.getNodes({
          imodel,
          rulesetOrId: ruleset,
        });
        expect(nodes).to.be.lengthOf(4);
        expect(nodes[0]).to.containSubset({ label: { displayValue: "-107.42 x -160.99" } });
        expect(nodes[1]).to.containSubset({ label: { displayValue: "-45.00 x -35.26" } });
        expect(nodes[2]).to.containSubset({ label: { displayValue: "-90.00 x 0.00" } });
        expect(nodes[3]).to.containSubset({ label: { displayValue: "0.00 x 90.00" } });
      });

      it("uses `condition` attribute", async () => {
        // __PUBLISH_EXTRACT_START__ Presentation.DisabledSortingRule.Condition.Ruleset
        // The ruleset has root node rule that returns `bis.ViewDefinition` instances with labels
        // consisting of `CodeValue` property value. Also there are customization rule to disable
        // instances sorting.
        const ruleset: Ruleset = {
          id: "example",
          rules: [{
            ruleType: "RootNodes",
            specifications: [{
              specType: "InstanceNodesOfSpecificClasses",
              classes: { schemaName: "BisCore", classNames: ["ViewDefinition"], arePolymorphic: true },
              groupByClass: false,
              groupByLabel: false,
            }],
          }, {
            ruleType: "InstanceLabelOverride",
            class: { schemaName: "BisCore", className: "ViewDefinition" },
            values: [{
              specType: "Property",
              propertyName: "CodeValue",
            }],
          }, {
            ruleType: "DisabledSorting",
            condition: "TRUE",
          }],
        };
        // __PUBLISH_EXTRACT_END__
        printRuleset(ruleset);

        // verify that nodes are not sorted by `Pitch` property
        const nodes = await Presentation.presentation.getNodes({
          imodel,
          rulesetOrId: ruleset,
          rulesetVariables: [{ id: "SORT_INSTANCES", type: VariableValueTypes.Bool, value: true }],
        });
        expect(nodes).to.be.lengthOf(4);
        expect(nodes[0]).to.containSubset({ label: { displayValue: "Default - View 1" } });
        expect(nodes[1]).to.containSubset({ label: { displayValue: "Default - View 2" } });
        expect(nodes[2]).to.containSubset({ label: { displayValue: "Default - View 3" } });
        expect(nodes[3]).to.containSubset({ label: { displayValue: "Default - View 4" } });
      });

      it("uses `class` attribute", async () => {
        // __PUBLISH_EXTRACT_START__ Presentation.DisabledSortingRule.Class.Ruleset
        // The ruleset has root node rule that returns `bis.ViewDefinition` instances with labels
        // consisting of class name and `CodeValue` property value. Also there two are customization rules to sort
        // instances by `CodeValue` property and to disable `bis.SpatialViewDefinition` instances sorting.
        const ruleset: Ruleset = {
          id: "example",
          rules: [{
            ruleType: "RootNodes",
            specifications: [{
              specType: "InstanceNodesOfSpecificClasses",
              classes: { schemaName: "BisCore", classNames: ["ViewDefinition"], arePolymorphic: true },
              groupByClass: false,
              groupByLabel: false,
            }],
          }, {
            ruleType: "InstanceLabelOverride",
            class: { schemaName: "BisCore", className: "ViewDefinition" },
            values: [{
              specType: "Composite",
              separator: " - ",
              parts: [
                { spec: { specType: "ClassName" } },
                { spec: { specType: "Property", propertyName: "CodeValue" } },
              ],
            }],
          }, {
            ruleType: "PropertySorting",
            priority: 1,
            class: { schemaName: "BisCore", className: "ViewDefinition" },
            propertyName: "CodeValue",
            isPolymorphic: true,
          }, {
            ruleType: "DisabledSorting",
            priority: 2,
            class: { schemaName: "BisCore", className: "SpatialViewDefinition" },
          }],
        };
        // __PUBLISH_EXTRACT_END__
        printRuleset(ruleset);

        const nodes = await Presentation.presentation.getNodes({
          imodel,
          rulesetOrId: ruleset,
        });
        expect(nodes).to.be.lengthOf(4);
        expect(nodes[0]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 1" } });
        expect(nodes[1]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 2" } });
        expect(nodes[2]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 3" } });
        expect(nodes[3]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 4" } });
      });

      it("uses `isPolymorphic` attribute", async () => {
        // __PUBLISH_EXTRACT_START__ Presentation.DisabledSortingRule.IsPolymorphic.Ruleset
        // The ruleset has root node rule that returns `bis.ViewDefinition` instances with labels
        // consisting of class name and `CodeValue` property value. Also there are two customization rules to sort
        // instances by `CodeValue` property and to disable `bis.ViewDefinition2d` instances sorting polymorphically.
        const ruleset: Ruleset = {
          id: "example",
          rules: [{
            ruleType: "RootNodes",
            specifications: [{
              specType: "InstanceNodesOfSpecificClasses",
              classes: { schemaName: "BisCore", classNames: ["ViewDefinition"], arePolymorphic: true },
              groupByClass: false,
              groupByLabel: false,
            }],
          }, {
            ruleType: "InstanceLabelOverride",
            class: { schemaName: "BisCore", className: "ViewDefinition" },
            values: [{
              specType: "Composite",
              separator: " - ",
              parts: [
                { spec: { specType: "ClassName" } },
                { spec: { specType: "Property", propertyName: "CodeValue" } },
              ],
            }],
          }, {
            ruleType: "PropertySorting",
            priority: 1,
            class: { schemaName: "BisCore", className: "ViewDefinition" },
            propertyName: "CodeValue",
            isPolymorphic: true,
          }, {
            ruleType: "DisabledSorting",
            priority: 2,
            class: { schemaName: "BisCore", className: "ViewDefinition2d" },
            isPolymorphic: true,
          }],
        };
        // __PUBLISH_EXTRACT_END__
        printRuleset(ruleset);

        const nodes = await Presentation.presentation.getNodes({
          imodel,
          rulesetOrId: ruleset,
        });
        expect(nodes).to.be.lengthOf(4);
        expect(nodes[0]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 1" } });
        expect(nodes[1]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 2" } });
        expect(nodes[2]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 3" } });
        expect(nodes[3]).to.containSubset({ label: { displayValue: "SpatialViewDefinition - Default - View 4" } });
      });

    });

  });

});
