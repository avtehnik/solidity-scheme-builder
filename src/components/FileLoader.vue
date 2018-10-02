<style>


    #file-drag-drop{
        display: block;
        position: absolute;
        height: 100px;
        width: 100%;
        z-index: 20;

    }
    #file-drag-drop form {
        margin: 0 auto;
        height: 100%;
        width: 300px;
        background: #ccc;
        border-radius: 4px;
        margin-top:100px;
    }
    #file-drag-drop form .drop-files{
        padding: 20px;
    }
</style>

<template>
    <div v-show="showEl" id="file-drag-drop">
        <form ref="fileform">
            <div class="drop-files">Drop solidiy source the files here!</div>
        </form>
    </div>
</template>

<script>
    export default {
        data(){
        return {
            showEl:true,
            dragAndDropCapable: false,
            files: [],
            uploadPercentage: 0
        }
    },

    mounted()
    {
        /*
         Determine if drag and drop functionality is capable in the browser
         */
        this.dragAndDropCapable = this.determineDragAndDropCapable();

        /*
         If drag and drop capable, then we continue to bind events to our elements.
         */
        if (this.dragAndDropCapable) {
            /*
             Listen to all of the drag events and bind an event listener to each
             for the fileform.
             */
            ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (evt) {
                /*
                 For each event add an event listener that prevents the default action
                 (opening the file in the browser) and stop the propagation of the event (so
                 no other elements open the file in the browser)
                 */
                this.$refs.fileform.addEventListener(evt, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }.bind(this), false);
            }.bind(this));

            /*
             Add an event listener for drop to the form
             */

            var addFile = function(file){

                new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onprogress = function () {
                    };
                    reader.onload = function () {
                        resolve();
                        this.files.push({file: file, content: reader.result});
                    }.bind(this);
                    reader.onerror = function () {
                        console.log(reader, arguments)
                    };
                }.bind(this))
            }.bind(this);

            var fileReaders = [];

            var traverseFileTree = function self(item, path) {
                path = path || "";
                if (item.isFile) {
                    // Get file
                    item.file(addFile);
                } else if (item.isDirectory) {
                    // Get folder contents
                    var dirReader = item.createReader();
                    dirReader.readEntries(function (entries) {
                        for (var i = 0; i < entries.length; i++) {
                            self(entries[i], path + item.name + "/");
                        }
                    });
                }
            };

            this.$refs.fileform.addEventListener('drop', function (e) {
                this.showEl = false;
                fileReaders = [];
                /*
                 Capture the files from the drop event and add them to our local files
                 array.
                 */

                var length = e.dataTransfer.items.length;
                for (var i = 0; i < length; i++) {
                    // recursive directory search
                    traverseFileTree(e.dataTransfer.items[i].webkitGetAsEntry());
                }

                setTimeout(function() {
                    Promise.all(fileReaders).then(function(){
                        this.$emit('files-uploaded', this.files);
                    }.bind(this));
                }.bind(this),500);
            }.bind(this));
        }
    },

    methods: {
        /*
         Determines if the drag and drop functionality is in the
         window
         */
        determineDragAndDropCapable()
        {
            /*
             Create a test element to see if certain events
             are present that let us do drag and drop.
             */
            var div = document.createElement('div');

            /*
             Check to see if the `draggable` event is in the element
             or the `ondragstart` and `ondrop` events are in the element. If
             they are, then we have what we need for dragging and dropping files.

             We also check to see if the window has `FormData` and `FileReader` objects
             present so we can do our AJAX uploading
             */
            return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
        }
    }
    }
</script>