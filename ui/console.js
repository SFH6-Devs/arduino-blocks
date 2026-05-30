let consoleElement = null;

const getConsoleElement = () => {
    if (!consoleElement) {
        consoleElement = document.getElementById('console-output');
    }

    return consoleElement;
};

const scrollConsoleToBottom = (element) => {
    const panel = element?.parentElement;
    if (panel) {
        panel.scrollTop = panel.scrollHeight;
    }
};

export function clearConsole() {
    const element = getConsoleElement();
    if (!element) return;

    element.textContent = '';
}

export function appendConsoleLine(message = '') {
    const element = getConsoleElement();
    if (!element) return;

    const text = String(message).replace(/\r\n/g, '\n').replace(/\n+$/, '');
    if (!text) return;

    element.textContent = element.textContent
        ? `${element.textContent}\n${text}`
        : text;
    scrollConsoleToBottom(element);
}

export function writeConsole(message = '') {
    appendConsoleLine(message);
}

export function writeConsoleError(error) {
    const message = error?.stack || error?.message || String(error || 'Unknown error');
    appendConsoleLine(message);
}
