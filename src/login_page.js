$loginForm = document.getElementById("login_form");
$tips = document.getElementById("tips");

document.getElementById("login_form_btn").onclick = function (e) {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;
    const msg = {
        msgType: "API_MSG",
        method: "loginOrRegister",
        params: {
            email: email,
            password: password,
        },
    }
    chrome.runtime.sendMessage(msg, function (response) {
        console.info(response);

        if (response.ok) {
            const session = response.body;
            chrome.storage.sync.set({"token": session.token});
            chrome.storage.sync.set({"token_expired_at": session.expired_at});
            chrome.storage.sync.set({"user__username": session.user.email});

            $loginForm.innerHTML = "<p>Success!</p>"
            setTimeout(function () {
                window.close();
            }, 3000);
        } else {
            const ul = document.createElement("ul");
            ul.style.color = "red";
            try {
                response.body.messages.forEach(item => {
                    const li = document.createElement("li");
                    li.innerText = item;
                    ul.appendChild(li);
                })
            } catch (e) {
                const li = document.createElement("li");
                li.innerText = "Failed";
                ul.appendChild(li);
            }
            $tips.innerHTML = "";
            $tips.appendChild(ul);
        }
    });
}
