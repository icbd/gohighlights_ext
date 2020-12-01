class SelectionItem {
    constructor(range, color, hashKey, commentContent) {
        this.hashKey = hashKey || UUID.generate();
        this.range = range;
        this.color = color;
        this.comment = commentContent;
        this._selectedNodes = [];
        this._serialization = {
            texts: [],
            startOffset: range.startOffset, // don't know why, offset of `this.range` will change. Maybe splitText
            endOffset: range.endOffset,
            color: this.color,
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

    updateTag(color) {
        this.color = color;
        this._serialization.color = color;
        const nodes = this.selectedNodes();
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].dataset.ghlColor = this.color;
        }
        return this
    }

    updateComment(content) {
        this.comment = content;
        return this
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
    static Parse(item) {
        const selection = item.selection;
        try {
            const range = document.createRange();

            let matchIndex = 0;
            const nodes = filterTextNodes(dfsNodes(document.body));
            nodes.forEach(function (node) {
                if (selection.texts[matchIndex] !== node.textContent) {
                    return
                }

                if (matchIndex === 0) {
                    range.setStart(node, selection.startOffset);
                }

                if (matchIndex === (selection.texts.length - 1)) {
                    range.setEnd(node, selection.endOffset);
                    return false;// break forEach
                }
                matchIndex += 1
            })

            if (range.startContainer && range.endContainer) {
                let content = undefined;
                if (item.comment) {
                    content = item.comment.content;
                }
                return new SelectionItem(range, item.tag, item.hash_key, content);
            } else {
                return null
            }
        } catch (e) {
            console.debug(e);
            return null;
        }
    }
}
