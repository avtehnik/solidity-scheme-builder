<template></template>

<script>

    var go = require('gojs');
    var $ = go.GraphObject.make;
    import Templates from '../helpers/DiagramTemplates'

    export default {
        name: 'Diagram',
        props: ["modelData"],  // accept model data as a parameter
        data: function () {
            return {diagram: null}
        },  // provide access to the GoJS Diagram
        mounted: function () {
            var self = this;
            var $ = go.GraphObject.make;
            var myDiagram =
                    $(go.Diagram, this.$el,
                            {
                                initialContentAlignment: go.Spot.Center,
                                initialViewportSpot: go.Spot.TopCenter,
                                initialAutoScale: go.Diagram.Uniform,

                                "undoManager.isEnabled": true,
                                layout: $(go.ForceDirectedLayout)
                            });

            var ordering = 0;
            myDiagram.nodeTemplate = $(go.Node, "Auto",
                    {
                        locationSpot: go.Spot.Center,
                        fromSpot: go.Spot.AllSides,
                        toSpot: go.Spot.AllSides,
                        click: function (e, node) {
                            // highlight all Links and Nodes coming out of a given Node
                            var diagram = node.diagram;
                            diagram.startTransaction("highlight");
                            // remove any previous highlighting
                            diagram.clearHighlighteds();
                            // for each Link coming out of the Node, set Link.isHighlighted
                            node.findLinksOutOf().each(function (l) {
                                l.isHighlighted = true;
                            });
                            // for each Node destination for the Node, set Node.isHighlighted
                            node.findNodesOutOf().each(function (n) {
                                n.isHighlighted = true;
                            });
                            diagram.commitTransaction("highlight");
                        }
                    },
                    $(go.Shape, {fill: "lightyellow"}, new go.Binding("stroke", "isHighlighted", function (h) {
                        return h ? "red" : "black";
                    })
                            .ofObject()),
                    $(go.Panel, "Table",
                            {defaultRowSeparatorStroke: "black"},
                            // header
                            $(go.Panel, "Horizontal",
                                    // method visibility/access
                                    $(go.TextBlock,
                                            {
                                                row: ordering++, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
                                                font: "bold 12pt sans-serif",
                                                isMultiline: false, editable: true
                                            },
                                            new go.Binding("text", "name").makeTwoWay()
                                    ),
                                    $(go.TextBlock,
                                            {
                                                row: ordering++, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
                                                font: "bold 7pt sans-serif",
                                                isMultiline: false, editable: true
                                            },
                                            new go.Binding("text", "compiler").makeTwoWay()
                                    )
                            ),


                            // properties
                            $(go.TextBlock, "Variables", {row: ordering++, font: "italic 10pt sans-serif"}),
                            $(go.Panel, "Vertical", {name: "VARIABLES"},
                                    new go.Binding("itemArray", "variables"),
                                    {
                                        row: ordering++, margin: 3, stretch: go.GraphObject.Fill,
                                        defaultAlignment: go.Spot.Left, background: "lightyellow",
                                        itemTemplate: Templates.propertyTemplate
                                    }
                            ),

                            $(go.TextBlock, "Enums", {row: ordering++, font: "italic 10pt sans-serif"}),
                            $(go.Panel, "Vertical", {name: "ENUMS"},
                                    new go.Binding("itemArray", "enums"),
                                    {
                                        row: ordering++, margin: 3, stretch: go.GraphObject.Fill,
                                        defaultAlignment: go.Spot.Left, background: "lightyellow",
                                        itemTemplate: Templates.propertyTemplate
                                    }
                            ),
                            // methods

                            $(go.TextBlock, "Methods", {row: ordering++, font: "italic 10pt sans-serif"}),
                            $(go.Panel, "Vertical", {name: "METHODS"},
                                    new go.Binding("itemArray", "methods"),
                                    {
                                        row: ordering++, margin: 3, stretch: go.GraphObject.Fill,
                                        defaultAlignment: go.Spot.Left, background: "lightyellow",
                                        itemTemplate: Templates.methodTemplate
                                    }
                            ),
                            // events
                            $(go.TextBlock, "Events", {row: ordering++, font: "italic 10pt sans-serif"}),
                            $(go.Panel, "Vertical", {name: "METHODS"},
                                    new go.Binding("itemArray", "events"),
                                    {
                                        row: ordering++, margin: 3, stretch: go.GraphObject.Fill,
                                        defaultAlignment: go.Spot.Left, background: "lightyellow",
                                        itemTemplate: Templates.eventTemplate
                                    }
                            ),
                            // events
                            $(go.TextBlock, "Modifiers", {row: ordering++, font: "italic 10pt sans-serif"}),
                            $(go.Panel, "Vertical", {name: "METHODS"},
                                    new go.Binding("itemArray", "modifiers"),
                                    {
                                        row: ordering++, margin: 3, stretch: go.GraphObject.Fill,
                                        defaultAlignment: go.Spot.Left, background: "lightyellow",
                                        itemTemplate: Templates.eventTemplate
                                    }
                            ),
                            // imports
                            $(go.TextBlock, "Imports", {row: ordering++, font: "italic 10pt sans-serif"}),
                            $(go.Panel, "Vertical",
                                    new go.Binding("itemArray", "imports"),
                                    {
                                        row: ordering++, margin: 3, stretch: go.GraphObject.Fill,
                                        defaultAlignment: go.Spot.Left, background: "lightyellow",
                                        itemTemplate: Templates.importTemplate
                                    }
                            )
                    )
            );
            //myDiagram.makeSvg({
            //  scale: 2
            //});

            function convertIsTreeLink(r) {
                return r === "generalization";
            }

            function convertFromArrow(r) {
                switch (r) {
                    case "generalization":
                        return "";
                    default:
                        return "";
                }
            }

            function convertToArrow(r) {
                switch (r) {
                    case "generalization":
                        return "Triangle";
                    case "aggregation":
                        return "StretchedDiamond";
                    default:
                        return "";
                }
            }

            myDiagram.linkTemplate =
                    $(go.Link,
                            {
                                routing: go.Link.AvoidsNodes,
                                curve: go.Link.JumpOver,
                                reshapable: true,
                                resegmentable: true,
                                relinkableFrom: true,
                                relinkableTo: true
                            },
                            new go.Binding("isLayoutPositioned", "relationship", convertIsTreeLink),
                            //$(go.Shape),
                            //$(go.Shape, {scale: 1.3, fill: "white"},
                            //  new go.Binding("fromArrow", "relationship", convertFromArrow)),
                            //$(go.Shape, {scale: 1.3, fill: "white"},
                            //  new go.Binding("toArrow", "relationship", convertToArrow)),

                            $(go.Shape,
                                    // the Shape.stroke color depends on whether Link.isHighlighted is true
                                    new go.Binding("stroke", "isHighlighted", function (h) {
                                        return h ? "red" : "black";
                                    })
                                            .ofObject(),
                                    // the Shape.strokeWidth depends on whether Link.isHighlighted is true
                                    new go.Binding("strokeWidth", "isHighlighted", function (h) {
                                        return h ? 3 : 1;
                                    })
                                            .ofObject()),
                            $(go.Shape,
                                    {toArrow: "Standard", strokeWidth: 0},
                                    // the Shape.fill color depends on whether Link.isHighlighted is true
                                    new go.Binding("fill", "isHighlighted", function (h) {
                                        return h ? "red" : "black";
                                    })
                                            .ofObject())
                    );


            myDiagram.click = function (e) {
                myDiagram.startTransaction("no highlighteds");
                myDiagram.clearHighlighteds();
                myDiagram.commitTransaction("no highlighteds");
            };

            this.diagram = myDiagram;


//            this.updateModel(this.modelData);
        },
        watch: {
            modelData: function (val) {
                this.updateModel(val);
            }
        },
        methods: {
            model: function () {
                return this.diagram.model;
            },
            updateModel: function (data) {
                var linkdata = [];
                data.forEach(function (contract) {
                    contract.links.forEach(function (contractName) {
                        linkdata.push({from: contract.id, to: contractName, relationship: "aggregation"})
                    })
                });

                this.diagram.model = $(go.GraphLinksModel,
                        {
                            copiesArrays: true,
                            copiesArrayObjects: true,
                            nodeDataArray: data,
                            linkDataArray: linkdata
                        });

            },
            updateDiagramFromData: function () {
                this.diagram.startTransaction();
                // This is very general but very inefficient.
                // It would be better to modify the diagramData data by calling
                // Model.setDataProperty or Model.addNodeData, et al.
                this.diagram.updateAllRelationshipsFromData();
                this.diagram.updateAllTargetBindings();
                this.diagram.commitTransaction("updated");
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
