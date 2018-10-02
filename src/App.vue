<template>
    <div id="app">
        <FileLoader @files-uploaded="handleFiles"></FileLoader>
        <diagram ref="diag" v-bind:model-data="diagramData" v-on:model-changed="modelChanged" v-on:changed-selection="changedSelection"
                 style="border: solid 1px black; width:100%; height:100%"></diagram>
    </div>
</template>

<script>
    import FileLoader from './components/FileLoader.vue'
    import Diagram from './components/Diagram.vue'
    import ContractTrnsformer from './helpers/ContractTrnsformer'
    var SolidityParser = require("solidity-parser-antlr");

    export default {
        name: 'app',
        data: function () {
            return {
                diagramData: []
            }
        },
        methods: {
            model: function () {
                return this.$refs.diag.model();
            },
            handleFiles: function (files) {
                var contracts = [];
                var parsers = [];
                files.forEach(function (file) {
                    parsers.push(new Promise(function (resolve, reject) {
                        try {
                            var parsedContract = SolidityParser.parse(file.content);
                            if (parsedContract.type == "SourceUnit") {
                                contracts.push(ContractTrnsformer.printContract(file.file.name, parsedContract.children));
                            }
                            resolve();
                        } catch (e) {
                            reject();
                        }

                    }));
                });
                setTimeout(function() {
                    Promise.all(parsers).then(function(){
                        this.diagramData = contracts;
                    }.bind(this));
                }.bind(this),1);
            },
            modelChanged: function (e) {
                if (e.isTransactionFinished) {  // show the model data in the page's TextArea
                    this.savedModelText = e.model.toJson();
                }
            },
            changedSelection: function (e) {
                var node = e.diagram.selection.first();
                if (node instanceof go.Node) {
                    this.currentNode = node;
                    this.currentNodeText = node.data.text;
                } else {
                    this.currentNode = null;
                    this.currentNodeText = "";
                }
            },
        },
        components: {
            FileLoader,
            Diagram
        }
    }
</script>

<style>

    html,body,#app{
        margin: 0;
        width: 100%;
        height: 100%;
    }

    #app {
        width: 100%;
        height: 100%;
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
