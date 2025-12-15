const BACKEND_API_URL = 'http://127.0.0.1:8000';
const API_TIMEOUT = 30000;

let isAnalyzing = false;
let currentRequestId = null;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeProfile') {
    if (isAnalyzing) {
      sendResponse({ success: false, error: 'Something went wrong. Please refresh the page.' });
      return false;
    }

    if (!request.data || !request.data.name || request.data.name === 'Not available') {
      sendResponse({ success: false, error: 'Invalid profile data' });
      return false;
    }
    isAnalyzing = true;
    currentRequestId = Date.now();
    const requestId = currentRequestId;
    
    chrome.runtime.sendMessage({
      action: 'profileDataUpdate',
      data: request.data
    }).catch(() => {});
    
    chrome.runtime.sendMessage({
      action: 'progressUpdate',
      progress: 35,
      text: 'Profile information collected successfully'
    }).catch(() => {});
    
    chrome.runtime.sendMessage({
      action: 'progressUpdate',
      progress: 40,
      text: 'Sending to AI for analysis...'
    }).catch(() => {});
    
    analyzeWithBackend(request.data, requestId)
      .then(result => {
        if (requestId !== currentRequestId) {
          return;
        }

        if (!validateAnalysisResult(result)) {
          throw new Error('Invalid analysis result');
        }

        chrome.runtime.sendMessage({
          action: 'showAnalysis',
          data: result
        }).catch(() => {});

        sendResponse({ success: true });
        isAnalyzing = false;
      })
      .catch(error => {
        if (requestId !== currentRequestId) {
          return;
        }

        const errorMessage = 'Something went wrong. Please refresh the page.';

        chrome.runtime.sendMessage({
          action: 'apiError',
          error: errorMessage
        }).catch(() => {});

        sendResponse({ success: false, error: errorMessage });
        isAnalyzing = false;
      });
    
    return true;
  } else if (request.action === 'requestAnalysis') {
    triggerScraping();
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'retryScraping') {
    triggerScraping();
    sendResponse({ success: true });
    return true;
  }
});

function triggerScraping() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      return;
    }

    if (!tabs || !tabs[0] || !tabs[0].url) {
      return;
    }

    if (!tabs[0].url.includes('linkedin.com/in/')) {
      return;
    }

    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
      setTimeout(() => {
        sendScrapeMessage(tabId, 0);
      }, 500);
    }).catch(() => {
      sendScrapeMessage(tabId, 0);
    });
  });
}

function sendScrapeMessage(tabId, retryCount) {
  const maxRetries = 3;
  const retryDelay = 1000;

  chrome.tabs.sendMessage(tabId, { action: 'scrapeProfile' }, (response) => {
    if (chrome.runtime.lastError) {
      const errorMsg = chrome.runtime.lastError.message;
      
      if (errorMsg.includes('Could not establish connection') && retryCount < maxRetries) {
        setTimeout(() => {
          sendScrapeMessage(tabId, retryCount + 1);
        }, retryDelay * (retryCount + 1));
      } else {
        if (retryCount === maxRetries) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).then(() => {
            setTimeout(() => {
              sendScrapeMessage(tabId, 0);
            }, 1000);
          }).catch(() => {});
        }
      }
    }
  });
}

function validateAnalysisResult(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }

  const requiredFields = ['primaryType', 'description', 'confidence', 'dominance', 'influence', 'steadiness', 'compliance'];
  for (const field of requiredFields) {
    if (result[field] === undefined || result[field] === null) {
      return false;
    }
  }

  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) {
    return false;
  }

  const discValues = ['dominance', 'influence', 'steadiness', 'compliance'];
  for (const value of discValues) {
    if (typeof result[value] !== 'number' || result[value] < 0 || result[value] > 100) {
      return false;
    }
  }

  return true;
}

async function analyzeWithBackend(profileData, requestId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    chrome.runtime.sendMessage({
      action: 'progressUpdate',
      progress: 50,
      text: 'Analyzing with AI...'
    }).catch(() => {});

    const response = await fetch(`${BACKEND_API_URL}/api/analyze-profile/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
      signal: controller.signal
    });

    chrome.runtime.sendMessage({
      action: 'progressUpdate',
      progress: 70,
      text: 'Processing AI analysis...'
    }).catch(() => {});

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error('Something went wrong. Please refresh the page.');
    }

    const analysis = await response.json();

    if (!analysis || typeof analysis !== 'object') {
      throw new Error('Invalid response from backend');
    }

    chrome.runtime.sendMessage({
      action: 'progressUpdate',
      progress: 85,
      text: 'Generating insights...'
    }).catch(() => {});

    return analysis;
    
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Could not connect to backend. Please ensure the backend server is running.');
    }

    throw new Error('Something went wrong. Please refresh the page.');
  }
}
