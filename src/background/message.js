/*
Request for API Proxy:
{
    msgType: "",
    method: "",
    params: {}
}
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // api proxy
        if (request.msgType === "API_MSG") {
            const responseData = {}

            if (["loginOrRegister", "usersRegister", "usersLogin"].includes(request.method)) {
                const api = new Api();
                api[request.method](request.params).then(response => {
                    console.debug(response);
                    responseData.httpCode = response.status;
                    responseData.headers = response.headers;
                    return response.text();
                })
                    .then(response => {
                        try {
                            responseData.body = JSON.parse(response);
                        } catch (e) {
                            responseData.body = {};
                        }
                        sendResponse(responseData);

                    })
                    .catch(err => console.warn(err));
                return  true
            }

            User.Current()
                .then(user => {
                    const api = new Api(user.token);
                    return api[request.method](request.params);
                })
                .then(response => {
                    console.debug(response);
                    responseData.httpCode = response.status;
                    responseData.headers = response.headers;
                    return response.text();
                })
                .then(response => {
                    try {
                        responseData.body = JSON.parse(response);
                    } catch (e) {
                        responseData.body = {};
                    }
                    sendResponse(responseData);

                })
                .catch(err => console.warn(err));
        }
        return true;
    }
);

/*
See also:
https://developer.chrome.com/extensions/messaging
https://stackoverflow.com/questions/54126343/how-to-fix-unchecked-runtime-lasterror-the-message-port-closed-before-a-respon

Callback function should return true or Promise.
 */
