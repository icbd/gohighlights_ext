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
            User.Current(function (user) {
                const api = new Api(user.token)
                return api[request.method](request.params).then(response => {
                    sendResponse(response);
                })
            });
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
