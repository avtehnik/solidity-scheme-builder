var go = require('gojs');

var goObject = go.GraphObject.make;


var convertVisibility = function (v) {
  switch (v) {
    case "public":
      return "+";
    case "internal":
      return "i";
    case "private":
      return "-";
    case "protected":
      return "#";
    case "default":
      return " ";
    default:
      return v;
  }
};

var DiagramTemplates = {



  propertyTemplate: goObject(go.Panel, "Horizontal",
    // property visibility/access
    goObject(go.TextBlock,
      {isMultiline: false, editable: false, width: 12},
      new go.Binding("text", "visibility", convertVisibility)),
    // property name, underlined if scope=="class" to indicate static property
    goObject(go.TextBlock,
      {isMultiline: false, editable: true},
      new go.Binding("text", "name").makeTwoWay(),
      new go.Binding("isUnderline", "scope", function (s) {
        return s[0] === 'c'
      })),
    // property type, if known
    goObject(go.TextBlock, "",
      new go.Binding("text", "type", function (t) {
        return (t ? ": " : "");
      })),
    goObject(go.TextBlock,
      {isMultiline: false, editable: true},
      new go.Binding("text", "type").makeTwoWay()),
    // property default value, if any
    goObject(go.TextBlock,
      {isMultiline: false, editable: false},
      new go.Binding("text", "default", function (s) {
        return s ? " = " + s : "";
      }))
  ),

  methodTemplate: goObject(go.Panel, "Horizontal",
    // method visibility/access
    goObject(go.TextBlock,
      {isMultiline: false, editable: false, width: 12},
      new go.Binding("text", "visibility", convertVisibility)),
    // method name, underlined if scope=="class" to indicate static method
    goObject(go.TextBlock,
      {isMultiline: false, editable: true},
      new go.Binding("text", "name").makeTwoWay()),
    // method parameters
    goObject(go.TextBlock, "()",
      // this does not permit adding/editing/removing of parameters via inplace edits
      new go.Binding("text", "parameters", function (parr) {
        var s = "(";
        for (var i = 0; i < parr.length; i++) {
          var param = parr[i];
          if (i > 0) s += ", ";
          s += param.name + ": " + param.type;
        }
        return s + ")";
      })),
    goObject(go.TextBlock, "()",
      // this does not permit adding/editing/removing of parameters via inplace edits
      new go.Binding("text", "modifiers", function (parr) {
        return parr.join(' , ');
      })),
    // method return type, if any
    goObject(go.TextBlock, "",
      new go.Binding("text", "type", function (t) {
        return (t ? ": " : "");
      })),
    goObject(go.TextBlock,
      {isMultiline: false, editable: true},
      new go.Binding("text", "type").makeTwoWay())
  ),
  eventTemplate: goObject(go.Panel, "Horizontal",
    // method visibility/access
    goObject(go.TextBlock,
      {isMultiline: false, editable: true},
      new go.Binding("text", "name").makeTwoWay()),
    // method parameters
    goObject(go.TextBlock, "()",
      // this does not permit adding/editing/removing of parameters via inplace edits
      new go.Binding("text", "parameters", function (parr) {
        var s = "(";
        for (var i = 0; i < parr.length; i++) {
          var param = parr[i];
          if (i > 0) s += ", ";
          s += param.name + ": " + param.type;
        }
        return s + ")";
      }))
  ),
  importTemplate: goObject(go.Panel, "Horizontal",
    // method visibility/access
    goObject(go.TextBlock,
      {isMultiline: false, editable: true},
      new go.Binding("text", "").makeTwoWay())
  )

}




export default DiagramTemplates;