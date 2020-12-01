let $popup;
let $comment;
fetch(chrome.extension.getURL("./marker.html"))
    .then(response => response.text())
    .then(function (markerStr) {
        const markerNode = new DOMParser().parseFromString(markerStr, "text/html");
        document.body.appendChild(markerNode.body.firstChild);

        $popup = document.getElementById("ghl_marker_popup");
        $comment = $popup.querySelector(".ghl-comment");
        addBtnClick($popup.querySelectorAll(".ghl-btn"));

        document.getElementById("saveCommentBtn").addEventListener("click", saveComment);
    }).catch(err => {
    console.error("fetch marker.html failed.");
});

/**
 * Click btn to add new color span, or replace color span to text, or replace color.
 * @param btnDoms
 */
function addBtnClick(btnDoms) {
    for (let i = 0; i < btnDoms.length; i++) {
        btnDoms[i].onclick = function (clickEvent) {
            const btnColor = clickEvent.target.dataset.ghlColor;
            const hashKey = $popup.dataset.ghlHashKey;

            // remove color
            if (clickEvent.target.classList.contains("hover")) {
                SelectionCollection.RemoveAndSync(hashKey);
                delete $popup.dataset.ghlHashKey;
                turnOffPopup();
                return
            }

            // change color
            if (hashKey) {
                SelectionCollection.UpdateAndSync(hashKey, btnColor);
                turnOffPopup();
                return
            }

            // add new color
            const item = new SelectionItem($selectionRange, btnColor, null);
            SelectionCollection.PushAndSync(item);
            turnOffPopup();
        }
    }
}

/**
 * After click or double click, turn on popup if selected.
 */
let $doubleClickTimeoutID;
let $selectionRange;
window.addEventListener('mouseup', function (mouseEvent) {
    if (!$popup.contains(mouseEvent.target)) {
        turnOffPopup();
    }
    clearTimeout($doubleClickTimeoutID);
    $doubleClickTimeoutID = setTimeout(function () {
        $selectionRange = getSelectionRange();
        if ($selectionRange) {
            turnOnPopup(mouseEvent);
        }
    }, 280);
});


/**
 * Click selected span, then show popup, add btn hover class.
 * Fetch hashKey from `data-ghl-hash-key`
 */
window.addEventListener("click", function (clickEvent) {
    const hashKey = clickEvent.target.getAttribute("data-ghl-hash-key");
    const color = clickEvent.target.dataset.ghlColor;
    if (!hashKey || !color) {
        return
    }
    const item = SelectionCollection.getInstance().data[hashKey];
    if (!item) {
        return
    }

    // replay highilight button and comment
    turnOnComment(item.comment);
    turnOnPopup(clickEvent);
    const selectedBtn = $popup.querySelector(`[data-ghl-color=${color}]`);
    selectedBtn.classList.add("hover");
    $popup.dataset.ghlHashKey = clickEvent.target.dataset.ghlHashKey;
});

function turnOnPopup(event) {
    $popup.style.position = "absolute";
    $popup.style.top = "" + event.pageY + "px";
    $popup.style.left = "" + event.pageX + "px";
    $popup.style.display = "inline-block";
}

function turnOffPopup() {
    if ($popup.style.display === "inline-block") {
        $popup.style.display = "none";
        const btns = $popup.querySelectorAll(".ghl-btn")
        for (let i = 0; i < btns.length; i++) {
            btns[i].classList.remove("hover");
        }
        delete $popup.dataset.ghlHashKey

        turnOffComment();
    }
}

function turnOnComment(content) {
    $comment.style.display = "block";
    if (content) {
        $comment.querySelector("textarea").value = content;
    }
}

function turnOffComment() {
    $comment.style.display = "none";
    $comment.querySelector("textarea").value = "";
}

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
        chrome.storage.sync.clear();
        console.info("chrome.storage.sync.clear");
    })
}

setTimeout(initHighLights, 500);

function saveComment() {
    const hashKey = $popup.dataset.ghlHashKey;
    const content = this.parentElement.querySelector("textarea").value;
    console.debug("saveComment", hashKey, content);
    SelectionCollection.PutComment(hashKey, content);
    turnOffPopup();
}