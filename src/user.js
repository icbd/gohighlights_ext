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
}
