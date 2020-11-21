class Api {
    constructor(token, host) {
        this.token = token || ""
        this.host = host || "http://localhost:3000"
    }

    /*
      {
          email: "",
          password: ""
      }
     */
    loginOrRegister(params) {
        return this._conn("POST", "/api/v1/users", params)
    }

    /*
      {
          email: "",
          password: ""
      }
     */
    usersRegister(params) {
        return this._conn("POST", "/api/v1/users", params)
    }

    /*
      {
          email: "",
          password: ""
      }
     */
    usersLogin(params) {
        return this._conn("POST", "/api/v1/sessions", params);
    }


    /*
      {
          url: "",
          tag: "",
          hash_key: "",
          selection: ""
      }
     */
    marksCreate(params) {
        return this._conn("POST", "/api/v1/marks", params)
    }

    /*
      {
          hash_key: "",
          tag: "",
          selection: ""
      }
     */
    marksUpdate(params) {
        const hashKey = params.hash_key;
        delete params.hashKey;
        return this._conn("PATCH", "/api/v1/marks/" + hashKey, params)
    }

    /*
      {
          hash_key: ""
      }
     */
    marksDestroy(params) {
        return this._conn("DELETE", "/api/v1/marks/" + params.hash_key)
    }

    /*
      {
          url: "baseURL"
      }
     */
    marksQuery(params) {
        const queryParams = new URLSearchParams()
        queryParams.append("url", encodeURIComponent(btoa(params.url)));
        return this._conn("GET", "/api/v1/marks/query?" + queryParams)
    }

    /*
      {
          page: 1,
          size: 10
      }
     */
    marksIndex(params) {
        const queryParams = new URLSearchParams()
        if (params.page) {
            queryParams.append("page", params.page);
        }
        if (params.size) {
            queryParams.append("size", params.size);
        }
        return this._conn("GET", "/api/v1/marks?" + queryParams, data)
    }

    _conn(httpMethod, path, params) {
        const url = this.host + path;
        let body;
        switch (typeof params) {
            case "object":
                body = JSON.stringify(params);
                break;
            default:
                body = params;
                break;
        }
        return new Promise((resolve, reject) => {
            fetch(url, {
                body: body,
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "Bearer " + this.token,
                },
                method: httpMethod,
                mode: "cors",
            }).then(response => {
                resolve(response);
            });
        })
    }
}
