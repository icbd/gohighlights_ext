/*
Request for API Proxy:
{
    msgType: "",
    method: "",
    params: {}
}

Response:
{
    ok: true
    httpCode: 200,
    headers: {},
    body: {}
}
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // api proxy
        if (request.msgType === "API_MSG") {
            let apiPromise;
            if (["loginOrRegister", "usersRegister", "usersLogin"].includes(request.method)) {
                const api = new Api();
                apiPromise = api[request.method](request.params);
            } else {
                apiPromise = User.Current().then(user => {
                    const api = new Api(user.token);
                    return api[request.method](request.params);
                })
            }

            const responseData = {}
            apiPromise
                .then(response => {
                    console.debug(response);
                    if (response.status === 401) {
                        throw response;
                    }
                    responseData.ok = response.ok;
                    responseData.httpCode = response.status;
                    responseData.headers = response.headers;
                    return response.text();
                })
                .then(responseText => {
                    try {
                        responseData.body = JSON.parse(responseText);
                    } catch (e) {
                        responseData.body = {};
                    }
                    sendResponse(responseData);
                })
                .catch(err => console.info(err));
        }
        return true;
    }
);

/*
See also:
https://developer.chrome.com/extensions/messaging
https://stackoverflow.com/questions/54126343/how-to-fix-unchecked-runtime-lasterror-the-message-port-closed-before-a-respon

Callback function should return true.
 */
