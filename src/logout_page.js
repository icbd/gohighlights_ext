$username = document.getElementById("username");
$logoutBtn = document.getElementById("logoutBtn");

$logoutBtn.onclick = function () {
    chrome.storage.sync.clear();
    console.info("chrome.storage.sync.clear");

    $username.innerText = chrome.i18n.getMessage("not_logged_in");
    $logoutBtn.style.display = "none";
};

chrome.storage.sync.get(["user__username"], result => {
    const username = result.user__username;
    if (username) {
        $username.innerText = username;
    } else {
        $username.innerText = chrome.i18n.getMessage("not_logged_in");
        $logoutBtn.style.display = "none";
    }
});
