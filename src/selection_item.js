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
            hlSpan.className = "ghl-text";
            hlSpan.textContent = nodes[i].textContent;
            hlSpan.dataset.ghlColor = this.color;
            hlSpan.dataset.ghlHashKey = this.hashKey;
            if (this.comment) {
                hlSpan.dataset.ghlComment = this.comment;
            }
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
        try {
            const selection = item.selection;
            const range = document.createRange();
            const firstNodeContent = selection.texts[0];
            const endNodeContent = selection.texts[selection.texts.length - 1];
            const allTextNodes = filterTextNodes(dfsNodes(document.body));

            let found = false;
            let nodeIndex = 0;
            const startNodeSeeds = []; //[ {node: node, index: nodeIndex} ]
            allTextNodes.forEach(function (node) {
                nodeIndex += 1;
                if (node.textContent === firstNodeContent) {
                    startNodeSeeds.push({"node": node, "index": nodeIndex});
                }
                if (node.textContent === endNodeContent) {
                    for (let i = startNodeSeeds.length - 1; i >= 0; i--) {
                        if (nodeIndex - startNodeSeeds[i].index === (selection.texts.length - 1)) { // Same distance
                            found = true;
                            range.setStart(startNodeSeeds[i].node, selection.startOffset);
                            range.setEnd(node, selection.endOffset);
                            return false;// jump forEach
                        }
                    }
                }
            });
            if (found) {
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
