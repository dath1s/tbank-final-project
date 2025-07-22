async function hideRegisterForm() {
    const enterFormBlock = await document.getElementById('sign_in');
    const registerFormBlock = await document.getElementById('sign_up');

    const registerForm = document.getElementById('sign_up__form');

    registerFormBlock.classList.add('hide');
    enterFormBlock.classList.remove('hide');

    registerForm.reset();
}

async function hideEnterForm() {
    const enterFormBlock = await document.getElementById('sign_in');
    const registerFormBlock = await document.getElementById('sign_up');

    const loginForm = document.getElementById('sign_in__form');

    enterFormBlock.classList.add('hide');
    registerFormBlock.classList.remove('hide');

    loginForm.reset();
}

document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById('sign_in__form');
    const registerForm = document.getElementById('sign_up__form');

    const enterFormBlock = document.getElementById('sign_in');
    const registerFormBlock = document.getElementById('sign_up');

    const errorWindow = document.getElementById('error-message-container');
    const errorMessage = document.getElementById('error-message');

    if (window.location.hash === '#sign-in') {
        await hideRegisterForm();
    } else {
        await hideEnterForm();
    }

    function hideErrorContainer() {
        errorWindow.classList.add('hide-error');
    }

    function showErrorContainer(message) {
        errorWindow.classList.remove('hide-error');
        errorMessage.innerHTML = message;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideErrorContainer();

        if (!enterFormBlock.classList.contains('hide') && registerFormBlock.classList.contains('hide')) {
            const username = document.getElementById('login_signin').value;
            const password = document.getElementById('password_signin').value;

            if (!username || !password) {
                showErrorContainer('Поля логин и пароль должны быть заполнены.');
                return -1;
            }

            const isUsernameExists = await fetch('http://localhost:9999/api/login', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify({username, password}),
                credentials: "include"
            });

            switch (isUsernameExists.status) {
                case 401:
                    const data = await isUsernameExists.json();
                    showErrorContainer(data.message);
                    break;
                case 200:
                    console.log('Вы успешно зашли');
                    loginForm.reset();
                    window.location.href = '/'
                    break;
            }

            return 0;
        }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideErrorContainer();

        const username = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const passwordRepeat = document.getElementById('password-repeat').value;

        const passwordRegex = /^[A-Za-z\d@$!%*#?&]{8,}$/;
        const usernameRegex = /^[A-Za-z\d]{5,}$/;

        if (!username || !password || !passwordRepeat) {
            showErrorContainer('Все поля должны быть обязательно заполнены');
            return -1
        }

        if (!usernameRegex.test(username)) {
            showErrorContainer('Логин должен быть длиной от 5' +
                ' символов и стостоять только из латинских букв(a-z, A-Z) и цифр(1-9)');
            return -1;
        }

        if (!passwordRegex.test(password)) {
            showErrorContainer('Пароль должен быть длиной не менее 8 символов и стостоять ' +
                'только из латинских букв(a-z, A-Z), цифр(1-9) и спецсимволов(@, $, !, %, *, #, ?, &)');
            return -1;
        }

        if (password !== passwordRepeat) {
            showErrorContainer('Пароли должны совпадать');
            return -1;
        }

        const isUsernameAvailable = await fetch('http://localhost:9999/api/register', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify({username, password})
        });

        switch (isUsernameAvailable.status) {
            case 409:
                showErrorContainer('Данный логин уже занят');
                break;
            case 201:
                console.log('Вы успешно зарегистрировались');

                const userEnter = await fetch('http://localhost:9999/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json;charset=utf-8',
                    },
                    body: JSON.stringify({username, password}),
                    credentials: "include"
                });

                if (userEnter.status === 200) {
                    registerForm.reset();
                    window.location.href = '/'
                    return 0;
                }
                showErrorContainer('Произошла какая-то ошибка, попробуйте позже.')

                break;
        }
    });
});