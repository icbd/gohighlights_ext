$loginForm = document.getElementById("login_form");
$username = document.getElementById("username");

document.getElementById("login_form_btn").onclick = function (e) {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;
    const msg = {
        msgType: "METHOD_CALL_MSG",
        method: "User.login",
        params: [email, password],
    }

    chrome.runtime.sendMessage(msg, response => {
        if (response.ok) {
            $loginForm.style.display = "none";
            $username.innerText = response.username;
        }
    });
}

chrome.storage.sync.get(["user__username"], result => {
    const username = result.user__username;
    if (username) {
        $loginForm.style.display = "none";
        $username.innerText = username;
    } else {
        $loginForm.style.display = "inline-block";
        $username.innerText = "";
    }
});
