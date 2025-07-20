async function hideRegisterForm() {
    const enterForm = await document.getElementById('sign_in');
    const registerForm = await document.getElementById('sign_up');

    registerForm.classList.add('hide');
    enterForm.classList.remove('hide');
}

async function hideEnterForm() {
    const enterForm = await document.getElementById('sign_in');
    const registerForm = await document.getElementById('sign_up');

    enterForm.classList.add('hide');
    registerForm.classList.remove('hide');
}

// document.addEventListener("DOMContentLoaded", () => {
//
//
//     enterFormRegisterButton.addEventListener("click", () => {
//         enterForm.classList.add('hide');
//         registerForm.classList.remove('hide');
//     });
//
//     registerFormEnterButton.addEventListener("click", () => {
//         registerForm.classList.add('hide');
//         enterForm.classList.remove('hide');
//     });
// });