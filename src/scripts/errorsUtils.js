function hideErrorContainer() {
    const errorWindow = document.getElementById('error-message-container');
    if (errorWindow) {
        errorWindow.classList.add('hide-error');
    }
}

export function showErrorContainer(message) {
    const errorWindow = document.getElementById('error-message-container');
    const errorMessage = document.getElementById('error-message');

    if (errorWindow && errorMessage) {
        errorWindow.classList.remove('hide-error');
        errorMessage.textContent = message;
        setTimeout(hideErrorContainer, 3000);
    }
}