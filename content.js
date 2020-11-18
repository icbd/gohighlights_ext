let $popup;
fetch(chrome.extension.getURL("./marker.html"))
    .then(response => response.text())
    .then(function (markerStr) {
        const markerNode = new DOMParser().parseFromString(markerStr, "text/html");
        document.body.appendChild(markerNode.body.firstChild);

        $popup = document.getElementById("ghl_marker_popup");
        addBtnClick($popup.querySelectorAll(".ghl-btn"));
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
    }
}

function initHighLights() {
    User.Current(function (user) {
        if (!user) {
            console.error("user not login");
            return
        }

        const api = new Api(user.token)
        api.query(baseURL()).then(function (items) {
            items.forEach(function (item) {
                const selectionItem = SelectionItem.Parse(JSON.parse(item.selection));
                if (selectionItem) {
                    SelectionCollection.Push(selectionItem);
                }
            });
        });
    });
}

setTimeout(initHighLights, 500);