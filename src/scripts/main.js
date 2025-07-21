document.addEventListener("DOMContentLoaded", async () => {
    const enterBut = document.getElementById('not_auth__enter');
    const registerBut = document.getElementById('not_auth__register');
    const logoutBut = document.getElementById('auth__exit');
    const profileBut = document.getElementById('profile_picture');

    const userAuthStatus = await fetch('http://localhost:9999/', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json;charset=utf-8',
        },
        credentials: "include"
    });

    if (userAuthStatus.ok) {
        enterBut.classList.add('not-display');
        registerBut.classList.add('not-display');
        logoutBut.classList.remove('not-display');
        profileBut.classList.remove('not-display');
    } else {
        logoutBut.classList.add('not-display');
        profileBut.classList.add('not-display');
        enterBut.classList.remove('not-display');
        registerBut.classList.remove('not-display');
    }
});