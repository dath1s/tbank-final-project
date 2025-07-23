export function hideRegisterForm() {
    const enterFormBlock = document.getElementById('sign_in');
    const registerFormBlock = document.getElementById('sign_up');
    const registerForm = document.getElementById('sign_up__form');

    if (!enterFormBlock || !registerFormBlock || !registerForm) {
        return;
    }

    registerFormBlock.classList.add('hide');
    enterFormBlock.classList.remove('hide');
    registerForm.reset();
}

export function hideEnterForm() {
    const enterFormBlock = document.getElementById('sign_in');
    const registerFormBlock = document.getElementById('sign_up');
    const loginForm = document.getElementById('sign_in__form');

    if (!enterFormBlock || !registerFormBlock || !loginForm) {
        return;
    }

    enterFormBlock.classList.add('hide');
    registerFormBlock.classList.remove('hide');
    loginForm.reset();
}