function getSelectionRange() {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        return null;
    }
    return selection.getRangeAt(0);
}

function removeAllRanges() {
    window.getSelection().removeAllRanges();
}
