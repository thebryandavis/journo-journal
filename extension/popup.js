// Journo Journal Browser Extension - Popup Script

let selectedType = 'note';
const API_URL = 'http://localhost:3000'; // Change for production

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const authToken = await getAuthToken();

  if (!authToken) {
    document.getElementById('loginPrompt').style.display = 'block';
    document.getElementById('captureForm').style.display = 'none';
    return;
  }

  document.getElementById('loginPrompt').style.display = 'none';
  document.getElementById('captureForm').style.display = 'block';

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    document.getElementById('pageInfo').innerHTML = `
      <a href="${tab.url}" target="_blank">${tab.title}</a>
    `;

    // Pre-fill title with page title
    document.getElementById('title').value = tab.title;

    // Try to get selected text
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      if (results[0]?.result) {
        document.getElementById('content').value = results[0].result;
      }
    } catch (error) {
      console.log('Could not get selected text:', error);
    }
  }

  // Type selector
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
    });
  });

  // Form submission
  document.getElementById('quickCaptureForm').addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
  e.preventDefault();

  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const tags = document.getElementById('tags').value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const authToken = await getAuthToken();

    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title,
        content: content + (tab ? `\n\nSource: ${tab.url}` : ''),
        type: selectedType,
        tags,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save note');
    }

    // Success!
    statusDiv.className = 'status success';
    statusDiv.textContent = '✓ Saved to Journo Journal!';
    statusDiv.style.display = 'block';

    // Clear form
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('tags').value = '';

    setTimeout(() => {
      window.close();
    }, 1500);

  } catch (error) {
    statusDiv.className = 'status error';
    statusDiv.textContent = 'Failed to save. Please try again.';
    statusDiv.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save to Journo Journal';
  }
}

async function getAuthToken() {
  // In a real implementation, this would get the session token
  // For now, we'll use Chrome storage
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken);
    });
  });
}

function openLogin() {
  chrome.tabs.create({ url: `${API_URL}/login` });
}
