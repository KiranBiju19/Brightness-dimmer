// Screen Dimmer Extension Content Script
let dimmerOverlay = null;
let currentSettings = { brightness: 0, enabled: false };

// Initialize the extension
function init() {
  createDimmerOverlay();
  loadSettings();
}

// Create the dimmer overlay element
function createDimmerOverlay() {
  if (dimmerOverlay) return;
  
  dimmerOverlay = document.createElement('div');
  dimmerOverlay.id = 'screen-dimmer-overlay';
  dimmerOverlay.className = 'screen-dimmer-overlay';
  
  // Insert at the beginning of body to ensure it's on top
  if (document.body) {
    document.body.insertBefore(dimmerOverlay, document.body.firstChild);
  }
}

// Load settings from storage and apply
function loadSettings() {
  chrome.storage.sync.get(['brightness', 'enabled'], (result) => {
    currentSettings.brightness = result.brightness || 0;
    currentSettings.enabled = result.enabled || false;
    applyDimmer();
  });
}

// Apply dimmer settings
function applyDimmer() {
  if (!dimmerOverlay) createDimmerOverlay();
  
  if (currentSettings.enabled && currentSettings.brightness > 0) {
    const opacity = currentSettings.brightness / 100;
    dimmerOverlay.style.opacity = opacity;
    dimmerOverlay.style.display = 'block';
  } else {
    dimmerOverlay.style.display = 'none';
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateDimmer') {
    currentSettings.brightness = message.brightness;
    currentSettings.enabled = message.enabled;
    applyDimmer();
    sendResponse({ success: true });
  }
});

// Handle dynamic content changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      // Check if our overlay was removed
      if (!document.getElementById('screen-dimmer-overlay')) {
        createDimmerOverlay();
        applyDimmer();
      }
    }
  });
});

// Start observing when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    observer.observe(document.body, { childList: true, subtree: true });
  });
} else {
  init();
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Handle page navigation for SPAs
window.addEventListener('popstate', () => {
  setTimeout(() => {
    if (!document.getElementById('screen-dimmer-overlay')) {
      createDimmerOverlay();
      applyDimmer();
    }
  }, 100);
});

// Ensure overlay persists on hash changes
window.addEventListener('hashchange', () => {
  setTimeout(() => {
    if (!document.getElementById('screen-dimmer-overlay')) {
      createDimmerOverlay();
      applyDimmer();
    }
  }, 100);
});