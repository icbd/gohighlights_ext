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
        this.Push(selectionItem);

        const msg = {
            msgType: "API_MSG",
            method: "marksCreate",
            params: {
                url: baseURL(),
                hash_key: selectionItem.hashKey,
                tag: selectionItem.color,
                selection: selectionItem.serialization(),
            }
        }
        chrome.runtime.sendMessage(msg, response => {
            console.debug(response);
        });

        return selectionItem.hashKey;
    }


    static Remove(hashKey) {
        let instance = this.getInstance();
        const selectionItem = instance.data[hashKey];

        instance.list = instance.list.filter(k => k !== hashKey);
        selectionItem.extinguish();
        delete instance.data[hashKey];

        return selectionItem;
    }

    static RemoveAndSync(hashKey) {
        const selectionItem = this.Remove(hashKey);

        const msg = {
            msgType: "API_MSG",
            method: "marksDestroy",
            params: {
                hash_key: hashKey,
            }
        }
        chrome.runtime.sendMessage(msg, response => {
            console.debug(response);
        });

        return selectionItem;
    }

    static Update(hashKey, tag) {
        const selectionItem = this.getInstance().data[hashKey];
        selectionItem.update(tag);
        return selectionItem;
    }

    static UpdateAndSync(hashKey, tag) {
        const selectionItem = this.Update(hashKey, tag);

        const msg = {
            msgType: "API_MSG",
            method: "marksUpdate",
            params: {
                hash_key: selectionItem.hashKey,
                tag: tag,
                selection: selectionItem.serialization(),
            }
        }
        chrome.runtime.sendMessage(msg, response => {
            console.debug(response);
        });

        return selectionItem;
    }
}
