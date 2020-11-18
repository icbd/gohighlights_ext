class SelectionItem {
    constructor(range, color, hashKey) {
        this.hashKey = hashKey || UUID.generate();
        this.range = range;
        this.color = color;
        this._selectedNodes = [];
        this._serialization = {
            texts: [],
            startOffset: range.startOffset, // don't know why, offset of `this.range` will change. Maybe splitText
            endOffset: range.endOffset,
            color: color,
            hashKey: this.hashKey,
        }

        this._init();
    }

    _init() {
        let nodes = dfsTextNodes(this.range.startContainer, this.range.endContainer);
        this._serialization.texts = nodes.map(item => item.textContent)

        let first = nodes.shift();
        nodes.unshift(first.splitText(this.range.startOffset));
        let final = nodes.pop();
        final.splitText(this.range.endOffset);
        nodes.push(final);
        this._selectedNodes = nodes;
    }

    selectedNodes() {
        return this._selectedNodes;
    }

    update(color) {
        this.color = color;
        const nodes = this.selectedNodes();
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].dataset.ghlColor = this.color;
        }
    }

    highlight() {
        const highlightNodes = [];
        const nodes = this.selectedNodes();
        for (let i = 0; i < nodes.length; i++) {
            let hlSpan = document.createElement("span");
            hlSpan.textContent = nodes[i].textContent;
            hlSpan.dataset.ghlColor = this.color;
            hlSpan.dataset.ghlHashKey = this.hashKey;
            highlightNodes.push(hlSpan);
            nodes[i].parentNode.insertBefore(hlSpan, nodes[i]);
            nodes[i].parentNode.removeChild(nodes[i]);
        }
        this._selectedNodes = highlightNodes;
    }

    extinguish() {
        const highlightNodes = this.selectedNodes();
        for (let i = 0; i < highlightNodes.length; i++) {
            let plainText = document.createTextNode(highlightNodes[i].textContent);
            highlightNodes[i].parentNode.insertBefore(plainText, highlightNodes[i]);
            highlightNodes[i].parentNode.removeChild(highlightNodes[i]);
        }
    }

    serialization() {
        return this._serialization;
    }

    // rebuild range
    static Parse(record) {
        const range = document.createRange();

        let matchIndex = 0;
        const nodes = filterTextNodes(dfsNodes(document.body));
        nodes.forEach(function (node) {
            if (record.texts[matchIndex] !== node.textContent) {
                return
            }

            if (matchIndex === 0) {
                range.setStart(node, record.startOffset);
            }

            if (matchIndex === (record.texts.length - 1)) {
                range.setEnd(node, record.endOffset);
                return false;// break forEach
            }
            matchIndex += 1
        })

        if (range.startContainer && range.endContainer) {
            return new SelectionItem(range, record.color, record.hashKey);
        } else {
            return null
        }
    }
}


class SelectionCollection {
    static getInstance() {
        if (!this.instance) {
            let instance = new SelectionCollection();
            instance.list = []; // [hashKey]
            instance.data = {}; // {hashKey => selectionItem}
            this.instance = instance;
        }
        return this.instance;
    }

    static Push(selectionItem) {
        let instance = this.getInstance();
        instance.list.push(selectionItem);
        let hashKey = selectionItem.hashKey;
        instance.data[hashKey] = selectionItem;
        selectionItem.highlight();
        return hashKey;
    }

    static PushAndSync(selectionItem) {
        const hashKey = this.Push(selectionItem);

        User.Current(function (user) {
            const api = new Api(user.token)
            api.commit(baseURL(),
                selectionItem.color,
                selectionItem.hashKey,
                JSON.stringify(selectionItem.serialization())).then(function (resp) {
                console.debug(resp);
            })
        });

        return hashKey;
    }


    static Remove(hashKey) {
        let instance = this.getInstance();
        instance.list = instance.list.filter(k => k !== hashKey);
        instance.data[hashKey].extinguish();
        delete instance.data[hashKey];
    }

    static RemoveAndSync(hashKey) {
        this.Remove(hashKey);

        User.Current(function (user) {
            const api = new Api(user.token);
            api.cancel(hashKey).then(function (resp) {
                console.debug(resp);
            })
        });
    }
}
