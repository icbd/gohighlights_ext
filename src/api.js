class Api {
    constructor(token, host) {
        this.token = token || ""
        this.host = host || "http://localhost:3000"
    }

    register(username, password) {
        const data = {
            "email": username,
            "password": password,
        }
        return this._conn("POST", "/api/v1/users", data)
    }

    login(username, password) {
        const data = {
            "email": username,
            "password": password,
        }
        return this._conn("POST", "/api/v1/sessions", data);
    }

    commit(url, hashKey, tag, selection) {
        const data = {
            "url": url,
            "tag": tag,
            "hash_key": hashKey,
            "selection": selection,
        }
        return this._conn("POST", "/api/v1/marks", data)
    }

    update(hashKey, tag, selection) {
        const data = {
            "tag": tag,
            "selection": selection,
        }
        return this._conn("PATCH", "/api/v1/marks/" + hashKey, data)
    }

    cancel(hashKey) {
        return this._conn("DELETE", "/api/v1/marks/" + hashKey)
    }

    query(url) {
        const queryParams = "?url=" + encodeURIComponent(btoa(url));
        return this._conn("GET", "/api/v1/marks/query" + queryParams)
    }

    index(page, size) {
        const data = {
            "page": page || 1,
            "size": size || 10,
        }
        return this._conn("POST", "/api/v1/marks", data)
    }

    _conn(httpMethod, path, data) {
        let url = this.host + path
        if (httpMethod === "GET") {
            if (url.includes("?")) {
                url += "&bearer=" + this.token;
            } else {
                url += "?bearer=" + this.token;
            }
        } else {
            if (data) {
                data = {...data, ...{"bearer": this.token}}
            } else {
                data = {"bearer": this.token}
            }
        }

        return new Promise((resolve, reject) => {
            fetch(url, {
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json",
                    // "Authorization": "Bearer " + this.token, // CORS
                },
                method: httpMethod,
                mode: "cors",
            }).then(response => {
                if (response.status === 401) {
                    throw new Error(response);
                }
                return response.text();
            }).then(function (response) {
                let data;
                try {
                    data = JSON.parse(response)
                } catch (e) {
                    data = {};
                } finally {
                    console.debug(data);
                    resolve(data);
                }
            }).catch(function (response) {
                console.debug("api conn failed: ", response.status);
                if (response.status === 401) {
                    chrome.storage.sync.set({"token": null});
                }
                reject(err);
            })
        })
    }
}