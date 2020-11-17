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

    commit(url, tag, hashKey, selection) {
        const data = {
            "url": url,
            "tag": tag,
            "hash_key": hashKey,
            "selection": selection,
        }
        return this._conn("POST", "/api/v1/marks", data)
    }

    query(url) {
        const queryParams = "?url=" + btoa(url)
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
            }).then(function (response) {
                if (response.status === 401) {
                    throw new Error(response)
                }
                const data = response.json()
                console.debug(data)
                resolve(data)
            }).catch(function (response) {
                console.warn("api conn failed: ", response.status)
                chrome.storage.sync.set({"token": null});
                reject(err)
            })
        })
    }
}