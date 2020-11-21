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

chrome.pageAction.onClicked.addListener(tab => {
    chrome.storage.sync.get(["user__username"], result => {
        const username = result.user__username;
        console.info("current username", username);
        if (username) {
            chrome.pageAction.setPopup({tabId: tab.id, popup: "logout.html"});
            chrome.pageAction.setTitle({tabId: tab.id, title: username});
        } else {
            chrome.pageAction.setPopup({tabId: tab.id, popup: "login.html"});
            chrome.pageAction.setTitle({title: chrome.i18n.getMessage("not_logged_in"), tabId: tab.id});
        }
    });
});
