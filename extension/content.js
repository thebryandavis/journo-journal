// Journo Journal Browser Extension - Content Script

// Listen for keyboard shortcut (Ctrl/Cmd + Shift + J)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
    e.preventDefault();

    const selectedText = window.getSelection().toString();
    const pageTitle = document.title;
    const pageUrl = window.location.href;

    chrome.runtime.sendMessage({
      action: 'quickCapture',
      title: pageTitle,
      content: selectedText,
      url: pageUrl,
    });
  }
});

// Add visual highlight to selected text when capturing
let highlightedElements = [];

function highlightSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = '#FFB800';
    span.style.opacity = '0.3';
    span.className = 'journo-highlight';

    try {
      range.surroundContents(span);
      highlightedElements.push(span);
    } catch (e) {
      // Ignore if can't highlight
    }
  }
}
