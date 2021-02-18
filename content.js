if (document.contentType === "text/html") {
    let templateStr = `
<div id="ghl_marker_popup" class="ghl" v-show="showPop" :style="{ top: top + 'px', left: left + 'px' }">
    <div class="ghl-btn-options">
        <div class="ghl-btn"
         v-for="(btnColor,idx) in btnColors"
         :data-ghl-color="btnColor"
          :key="idx"
          :class="hoverColorBtn(btnColor)"
          @click.stop="clickColorBtn(btnColor)"></div>
    </div>
    
    <div class="ghl-comment" v-show="hashKey">
        <textarea placeholder="comment..." v-model="commentContent"></textarea>
        <button @click="commitComment">Save</button>
    </div>
</div>  
`
    const ghlDefaultData = {
        top: 0,
        left: 0,
        showPop: false,
        selectedColor: null,
        commentContent: null,
        selectionRange: null,
        hashKey: null,
        btnColors: ["green", "yellow", "purple"],
    };
    let ghlPopData = Object.assign({}, ghlDefaultData);

    const ghlPop = new Vue({
        el: "#ghl_marker_popup",
        data: ghlPopData,
        template: templateStr,
        beforeCreate: function () {
            let globalPopDiv = document.createElement("div");
            globalPopDiv.id = "ghl_marker_popup";
            document.body.appendChild(globalPopDiv);
        },
        mounted: function () {
            initHighLights();
        },
        computed: {},
        methods: {
            clickColorBtn: function (btnColor) {
                // Remove Color
                if (btnColor === this.selectedColor) {
                    SelectionCollection.RemoveAndSync(this.hashKey);
                    ghlPop.turnOffGhlPop();
                    return
                }

                // Change Color
                if (this.hashKey) {
                    SelectionCollection.UpdateAndSync(this.hashKey, btnColor);
                    ghlPop.turnOffGhlPop();
                    return
                }

                // Add New Color
                if (this.selectionRange) {
                    const item = new SelectionItem(this.selectionRange, btnColor, null);
                    SelectionCollection.PushAndSync(item);
                    ghlPop.turnOffGhlPop();
                    return
                }
            },
            hoverColorBtn: function (btnColor) {
                if (btnColor === this.selectedColor) {
                    return {hover: true}
                } else {
                    return {}
                }
            },
            commitComment: function () {
                SelectionCollection.PutComment(this.hashKey, this.commentContent);
                // update data-ghl-comment
                const selector = "[data-ghl-hash-key='" + this.hashKey + "']";
                document.querySelectorAll(selector).forEach(node => {
                    node.dataset.ghlComment = this.commentContent;
                });
                ghlPop.turnOffGhlPop();
            },
            turnOffGhlPop: function () {
                this.showPop = false;
                this.hashKey = null;
            },
            turnOnGhlPop: function (params) {
                this.showPop = true;
                this.top = params["top"];
                this.left = params["left"];
                this.selectedColor = params["selectedColor"] ?? null;
                this.commentContent = params["commentContent"] ?? null;
                this.selectionRange = params["selectionRange"] ?? null;
            }
        }
    });

    function initHighLights() {
        User.Current().then(user => {
            const msg = {
                msgType: "API_MSG",
                method: "marksQuery",
                params: {
                    url: baseURL(),
                }
            }
            chrome.runtime.sendMessage(msg, response => {
                    const items = response.body;
                    items.forEach(function (item) {
                        const selectionItem = SelectionItem.Parse(item);
                        if (selectionItem) {
                            SelectionCollection.Push(selectionItem);
                        }
                    });
                }
            );
        }).catch(err => {
            // chrome.storage.sync.clear();
            console.error(err);
        })
    }

    /**
     * After click or double click, turn on popup if selected.
     */
    let ghlDoubleClickTimeoutID;
    window.addEventListener('mouseup', function (mouseEvent) {
        if (!document.getElementById("ghl_marker_popup").contains(mouseEvent.target)) {
            ghlPop.turnOffGhlPop();
        }

        clearTimeout(ghlDoubleClickTimeoutID);
        ghlDoubleClickTimeoutID = setTimeout(function () {
            let selectionRange = getSelectionRange();
            if (selectionRange) {
                let top = mouseEvent.pageY - 60;
                let left = mouseEvent.pageX - 50;
                ghlPop.turnOnGhlPop({
                    top: top,
                    left: left,
                    selectionRange: selectionRange,
                });
            }
        }, 200);
    });


    /**
     * Click selected span, then show popup, add btn hover class.
     * Fetch hashKey from `data-ghl-hash-key`
     */
    window.addEventListener("click", function (clickEvent) {
        const hashKey = clickEvent.target.getAttribute("data-ghl-hash-key");
        const selectedColor = clickEvent.target.dataset.ghlColor;
        if (!hashKey || !selectedColor) {
            return
        }
        const item = SelectionCollection.getInstance().data[hashKey];
        if (!item) {
            return
        }

        ghlPopData.hashKey = hashKey;
        ghlPopData.selectedColor = selectedColor;

        // replay highilight button and comment
        let top = clickEvent.pageY + 10;
        let left = clickEvent.pageX - 20;
        ghlPop.turnOnGhlPop({top: top, left: left, selectedColor: selectedColor, commentContent: item.comment});
    });
}

