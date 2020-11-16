class User {
    constructor(token) {
        this.token = token;
    }

    static Current(callback) {
        chrome.storage.sync.get(["token"], function (result) {
            const token = result.token;
            if (!token) {
                return callback(null)
            }
            chrome.storage.sync.get(["token_expired_at"], function (result) {
                if (Date.now() < Date.parse(result.token_expired_at)) {
                    return callback(new User(token));
                } else {
                    return callback(null)
                }
            })
        });
    }

    static Login(username, password) {
        const api = new Api();
        api.login(username, password).then(function (resp) {
            if (resp && resp["token"]) {
                chrome.storage.sync.set({"token": resp["token"]});
                chrome.storage.sync.set({"token_expired_at": resp["expired_at"]});
            }
        })
    }
}