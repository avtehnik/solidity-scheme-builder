var ContractTrnsformer = {


  getFunctionModifiersArray: function (modifiers) {
    var modifiersList = [];
    modifiers.forEach(function (modifier) {
      modifiersList.push(modifier.name);
    });

    return modifiersList;
  },

  getFunctionArgumentsArray: function (funcArguments) {
    var funcArgumentsList = [];
    funcArguments.forEach(function (argument) {
      funcArgumentsList.push({"type": argument.typeName.name, "name": argument.name});
    });

    return funcArgumentsList;
  },

  getModifierParametersArray: function (modifierParameters) {

    var modifierParametersList = [];
    if (modifierParameters['type'] && modifierParameters['type'] == 'ParameterList') {

      modifierParameters.parameters.forEach(function (argument) {
        modifierParametersList.push({"type": argument.typeName.name, "name": argument.name});
      });

    } else {

    }
    return modifierParametersList;
  },


  getVariableString: function (item) {

    var variableType = "";
    var variableName = "";
    var variableVisibility = "";
    item.variables.forEach(function (variable) {
      //  console.log(variable);
      if (variable.typeName.type == 'ArrayTypeName') {
        variableType = variable.typeName.baseTypeName.name + "[]";
      } else if (variable.typeName.type == 'UserDefinedTypeName') {
        variableType = variable.typeName.namePath;
      } else {
        variableType = variable.typeName.name;
      }
      variableName = variable.name;
      variableVisibility = variable.visibility;
    });
    return {"name": variableName, "type": variableType, "visibility": variableVisibility};
  },

  getEnumString: function (enumItem) {
    var members = enumItem.members.map(function (member) {
      return member.name;
    }).join(', ');
    return {"name": enumItem.name, "type": "Enum", "visibility": "public", "values": members};
  },


  getEventParametersArray: function (parameters) {
    var variablesList;
    variablesList = [];
    parameters.parameters.forEach(function (variable) {
      //  console.log(variable);
      var type = "";
      if (variable.typeName.type == 'ArrayTypeName') {
        type = variable.typeName.baseTypeName.name + "[]";
      } else {
        type = variable.typeName.name;
      }
      variablesList.push({"type": type, "name": variable.name});
    });
    return variablesList;
  },


  printContractSubNodes: function (linesObj, subnodes) {


    subnodes.forEach(function (item) {

      if (item.type == "FunctionDefinition" && item.name !== null) {
        linesObj.methods.push({
          "name": item.name,
          "modifiers": ContractTrnsformer.getFunctionModifiersArray(item.modifiers),
          "parameters": ContractTrnsformer.getFunctionArgumentsArray(item.parameters.parameters),
          //"type": "method",
          "visibility": item.visibility
        });
      } else if (item.type == "EventDefinition") {
        linesObj.events.push({
          "name": item.name,
          "parameters": ContractTrnsformer.getEventParametersArray(item.parameters)
        });
      } else if (item.type == "StateVariableDeclaration") {
        linesObj.variables.push(ContractTrnsformer.getVariableString(item));
      } else if (item.type == "ModifierDefinition") {

        linesObj.modifiers.push({
          "name": item.name,
          "parameters": ContractTrnsformer.getModifierParametersArray(item.parameters)
        });

      } else if (item.type == "EnumDefinition") {
        linesObj.enums.push(ContractTrnsformer.getEnumString(item));
      } else {
//       console.log(item);
      }
      //console.log(item);
    })
  },


  printContract: function (filename, parsedContract) {
    var contractItem = {
      id: filename.replace(/^.*[\\\/]/, ''),
      key: filename.replace(/^.*[\\\/]/, ''),
      variables: [],
      enums: [],
      methods: [],
      events: [],
      modifiers: [],
      imports: [],
      links: [],
      compiler: "",
      filename: filename.replace("\./", '')
    };

    parsedContract.forEach(function (item) {

      if (item.type == "ContractDefinition") {
        contractItem.name = item.name;
        //contractItem.id = item.name;
        ContractTrnsformer.printContractSubNodes(contractItem, item.subNodes);
      } else if (item.type == "ImportDirective") {
        contractItem.imports.push(item.path.replace("\./", ''));
        contractItem.links.push(item.path.replace(/^.*[\\\/]/, ''));
      } else if (item.type == "PragmaDirective") {
        contractItem.compiler = item.name + " " + item.value;
      } else {
//     console.log(item);
      }
    });
    return contractItem;
  },


//var contracts = {list: []};

  readContract: function (fileName, contracts, text) {
    var parsedContract = parser.parse(text);
    if (parsedContract.type == "SourceUnit") {
      contracts.list.push(ContractTrnsformer.printContract(fileName, parsedContract.children));
    }
  }
}


export default ContractTrnsformer;