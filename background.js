chrome.runtime.onInstalled.addListener(function () {
    // remove popup, add customization popup
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({pageUrl: {schemes: ["http", "https"]}}),
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });

    User.Current().catch(err => {
        console.debug(err);
        // User.Login("wwwicbd@gmail.com", "12345678");
    });
});
