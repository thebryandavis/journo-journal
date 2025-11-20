// Journo Journal Browser Extension - Background Script

// Create context menu for quick capture
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToJourno',
    title: 'Save to Journo Journal',
    contexts: ['selection', 'page', 'link'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToJourno') {
    // Open popup with selected text
    chrome.action.openPopup();
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'quickCapture') {
    // Open popup with pre-filled data
    chrome.storage.local.set({
      quickCapture: {
        title: request.title,
        content: request.content,
        url: request.url,
      }
    });
    chrome.action.openPopup();
  }
});
