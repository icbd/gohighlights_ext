class User {
    constructor(token) {
        this.token = token;
    }

    /**
     *
     * @returns {Promise<unknown>}
     * @constructor
     */
    static Current() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(["token"], result => {
                const token = result.token;
                if (!token) {
                    reject(new Error("current user not found"));
                    return
                }
                chrome.storage.sync.get(["token_expired_at"], result => {
                    const expiredAt = result.token_expired_at;
                    if (expiredAt && Date.now() < Date.parse(expiredAt)) {
                        resolve(new User(token));
                    } else {
                        reject(new Error("token expired"));
                    }
                })
            });
        });
    }

    static Login(username, password) {
        const params = {
            email: username,
            password: password,
        }
        const api = new Api();
        api.usersLogin(params)
            .then(resp => {
                if (resp.ok) {
                    return resp.json();
                } else {
                    throw resp;
                }
            })
            .then(resp => {
                chrome.storage.sync.set({"token": resp.token});
                chrome.storage.sync.set({"token_expired_at": resp.expired_at});
            })
            .catch(resp => {
                console.error(resp);
            });
    }
}
