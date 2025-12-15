import { LoadingComponent } from './components/Loading.js';
import { ErrorComponent } from './components/Error.js';
import { NotOnProfileComponent } from './components/NotOnProfile.js';
import { ActionButtonsComponent } from './components/ActionButtons.js';
import { NavigationComponent } from './components/Navigation.js';
import { PrimaryTypeComponent } from './components/PrimaryType.js';
import { DiscPersonalityComponent } from './components/DiscPersonality.js';
import { InsightsComponent } from './components/Insights.js';
import { MessageSectionComponent } from './components/MessageSection.js';
import { EmailTemplateComponent } from './components/EmailTemplate.js';

const BACKEND_API_URL = 'http://127.0.0.1:8000';

let analysisData = null;
let profileData = null;
let linkedinUrl = '';
let currentState = 'loading';

const loadingComponent = new LoadingComponent('loadingState');
const errorComponent = new ErrorComponent('errorState');
const notOnProfileComponent = new NotOnProfileComponent('notOnProfileState');
const actionButtonsComponent = new ActionButtonsComponent();
const navigationComponent = new NavigationComponent('burgerMenuNav');
const primaryTypeComponent = new PrimaryTypeComponent();
const discPersonalityComponent = new DiscPersonalityComponent();
const insightsComponent = new InsightsComponent();
const linkedinMessageComponent = new MessageSectionComponent('linkedin');
const followupMessageComponent = new MessageSectionComponent('followup');
const emailTemplateComponent = new EmailTemplateComponent();

document.addEventListener('DOMContentLoaded', () => {
  initializeComponents();
  setupEventListeners();
  checkForExistingAnalysis();
});

function initializeComponents() {
  navigationComponent.initialize();
  actionButtonsComponent.setupListeners(handleRefresh, handleSave);
  
  setupBurgerMenu();
  
  emailTemplateComponent.setupListeners(
    () => generateMessage('email'),
    () => copyToClipboard('email'),
    () => clearMessage('email')
  );
  
  linkedinMessageComponent.setupListeners(
    () => generateMessage('linkedin'),
    () => copyToClipboard('linkedin'),
    () => clearMessage('linkedin')
  );
  
  followupMessageComponent.setupListeners(
    () => generateMessage('followup'),
    () => copyToClipboard('followup'),
    () => clearMessage('followup')
  );
  
  errorComponent.show('', handleRetry);
  errorComponent.hide();
  
  notOnProfileComponent.show(handleRetry);
  notOnProfileComponent.hide();
  
  setupCollapsibleCards();
}

function setupCollapsibleCards() {
  const collapseButtons = document.querySelectorAll('.collapse-button');
  
  collapseButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = button.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      const card = button.closest('.collapsible-card');
      
      if (card && targetContent) {
        card.classList.toggle('collapsed');
        
        const isCollapsed = card.classList.contains('collapsed');
        button.setAttribute('aria-label', isCollapsed ? 'Expand' : 'Collapse');
      }
    });
  });
  
  const cardHeaders = document.querySelectorAll('.collapsible-card .card-header');
  cardHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.collapse-button')) return;
      
      const button = header.querySelector('.collapse-button');
      if (button) {
        button.click();
      }
    });
  });
}

function setupBurgerMenu() {
  const burgerButton = document.getElementById('burgerMenuButton');
  const burgerOverlay = document.getElementById('burgerMenuOverlay');
  const burgerClose = document.getElementById('burgerMenuClose');
  
  if (burgerButton && burgerOverlay) {
    burgerButton.addEventListener('click', () => {
      burgerOverlay.classList.toggle('active');
      burgerButton.classList.toggle('active');
    });
  }
  
  if (burgerClose && burgerOverlay) {
    burgerClose.addEventListener('click', () => {
      burgerOverlay.classList.remove('active');
      if (burgerButton) burgerButton.classList.remove('active');
    });
  }
  
  if (burgerOverlay) {
    burgerOverlay.addEventListener('click', (e) => {
      if (e.target === burgerOverlay) {
        burgerOverlay.classList.remove('active');
        if (burgerButton) burgerButton.classList.remove('active');
      }
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burgerOverlay && burgerOverlay.classList.contains('active')) {
      burgerOverlay.classList.remove('active');
      if (burgerButton) burgerButton.classList.remove('active');
    }
  });
  
  setupMessageViewCloseButtons();
}

function setupMessageViewCloseButtons() {
  const emailClose = document.getElementById('emailCloseButton');
  const linkedinClose = document.getElementById('linkedinCloseButton');
  const followupClose = document.getElementById('followupCloseButton');
  
  if (emailClose) {
    emailClose.addEventListener('click', () => {
      navigationComponent.showMainView();
    });
  }
  
  if (linkedinClose) {
    linkedinClose.addEventListener('click', () => {
      navigationComponent.showMainView();
    });
  }
  
  if (followupClose) {
    followupClose.addEventListener('click', () => {
      navigationComponent.showMainView();
    });
  }
}

function setupEventListeners() {
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showAnalysis') {
    displayAnalysis(request.data);
      sendResponse({ success: true });
    } else if (request.action === 'progressUpdate') {
      loadingComponent.updateProgress(request.progress || 0, request.text || 'Processing...');
      sendResponse({ success: true });
    } else if (request.action === 'profileDataUpdate') {
      if (request.data) {
        profileData = request.data;
      }
      sendResponse({ success: true });
    } else if (request.action === 'scrapeError' || request.action === 'apiError') {
      showError(request.error || 'Something went wrong. Please refresh the page.');
      sendResponse({ success: true });
    }
    return true;
  });
}

function checkForExistingAnalysis() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      linkedinUrl = tabs[0].url;
    }
  });
  
  chrome.runtime.sendMessage({ action: 'requestAnalysis' }, () => {});
  
  requestLinkedinUrl();
}

function requestLinkedinUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      linkedinUrl = tabs[0].url;
    }
  });
}

function showError(errorMessage) {
  currentState = 'error';
  
  const analysisContent = document.getElementById('analysisContent');
  
  loadingComponent.hide();
  notOnProfileComponent.hide();
  if (analysisContent) analysisContent.style.display = 'none';
  
  const isNotOnProfilePage = errorMessage === 'NOT_ON_PROFILE_PAGE' ||
    errorMessage.includes('navigate to a LinkedIn profile page') ||
    errorMessage.includes('URL should contain /in/') ||
    errorMessage.includes('Not on a LinkedIn profile page');
  
  if (isNotOnProfilePage) {
    showNotOnProfilePage();
  } else {
    errorComponent.show(errorMessage, handleRetry);
  }
}

function showNotOnProfilePage() {
  currentState = 'notOnProfile';
  
  loadingComponent.hide();
  errorComponent.hide();
  const analysisContent = document.getElementById('analysisContent');
  if (analysisContent) analysisContent.style.display = 'none';
  
  notOnProfileComponent.show(handleRetry);
}

function displayAnalysis(data) {
  if (!data) return;
  
  analysisData = data;
  currentState = 'analysis';
  
  const analysisContent = document.getElementById('analysisContent');
  
  loadingComponent.hide();
  errorComponent.hide();
  notOnProfileComponent.hide();
  if (analysisContent) analysisContent.style.display = 'block';

  primaryTypeComponent.update(data);
  discPersonalityComponent.update(data);
  insightsComponent.update(data);
  
  if (data.name) {
    profileData = profileData || {};
    profileData.name = data.name;
    profileData.headline = data.headline || profileData.headline;
  }
}

function handleRetry() {
  currentState = 'loading';
  
  const analysisContent = document.getElementById('analysisContent');
  
  loadingComponent.show();
  errorComponent.hide();
  notOnProfileComponent.hide();
  if (analysisContent) analysisContent.style.display = 'none';
  
  profileData = null;
  
  loadingComponent.updateProgress(0, 'Refreshing analysis...');
  
  chrome.runtime.sendMessage({ action: 'retryScraping' }, () => {});
}

function handleRefresh() {
  handleRetry();
}

async function handleSave() {
  if (!analysisData || !profileData) {
    alert('Profile data or analysis data is not available. Please wait for the analysis to complete.');
    return;
  }
  
  actionButtonsComponent.setSaveState('saving', 'Saving...');
  
  try {
    if (!linkedinUrl) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          linkedinUrl = tabs[0].url;
        }
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const saveData = {
      name: profileData.name || analysisData.name || '',
      headline: profileData.headline || analysisData.headline || '',
      linkedin_profile: linkedinUrl || null,
      confidence: analysisData.confidence || null,
      dominance: analysisData.dominance || null,
      influence: analysisData.influence || null,
      steadiness: analysisData.steadiness || null,
      compliance: analysisData.compliance || null,
      primaryType: analysisData.primaryType || analysisData.disc_primary || '',
      keyInsights: analysisData.keyInsights || analysisData.key_insights || [],
      painPoints: analysisData.painPoints || analysisData.pain_points || [],
      communicationStyle: analysisData.communicationStyle || analysisData.communication_style || '',
      salesApproach: analysisData.salesApproach || analysisData.sales_approach || '',
      bestApproach: analysisData.bestApproach || analysisData.best_approach || '',
      idealPitch: analysisData.idealPitch || analysisData.ideal_pitch || '',
      communicationDos: analysisData.communicationDos || analysisData.communication_dos || [],
      communicationDonts: analysisData.communicationDonts || analysisData.communication_donts || [],
      rawProfileData: profileData || null,
    };
    
    const response = await fetch(`${BACKEND_API_URL}/api/save-analyzed-data/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.updated) {
      actionButtonsComponent.setSaveState('success', 'Updated!');
      setTimeout(() => {
        actionButtonsComponent.setSaveState('', 'Save');
      }, 3000);
    } else {
      actionButtonsComponent.setSaveState('success', 'Saved!');
      setTimeout(() => {
        actionButtonsComponent.setSaveState('', 'Save');
      }, 3000);
    }
  } catch (error) {
    actionButtonsComponent.setSaveState('error', 'Error');
    setTimeout(() => {
      actionButtonsComponent.setSaveState('', 'Save');
    }, 3000);
    alert('Failed to save analyzed data. Please try again.');
  }
}

async function generateMessage(type) {
  let component, query;
  
  if (type === 'email') {
    component = emailTemplateComponent;
    query = emailTemplateComponent.getQuery();
  } else if (type === 'linkedin') {
    component = linkedinMessageComponent;
    query = linkedinMessageComponent.getQuery();
  } else {
    component = followupMessageComponent;
    query = followupMessageComponent.getQuery();
  }
  
  if (!query) {
    alert('Please enter a query to generate the message');
    return;
  }
  
  if (!profileData) {
    alert('Profile data not available. Please wait for the analysis to complete.');
    return;
  }
  
  component.setGenerating(true);
  
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/generate-message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageType: type,
        query: query,
        profileData: profileData
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (type === 'email') {
      emailTemplateComponent.displayTemplate(data);
    } else {
      component.displayMessage(data.message || 'No message');
    }
  } catch (error) {
    alert('Something went wrong. Please refresh the page.');
  } finally {
    component.setGenerating(false);
  }
}

async function copyToClipboard(type) {
  let textToCopy = '';
  
  if (type === 'email') {
    textToCopy = emailTemplateComponent.getEmailText();
  } else if (type === 'linkedin') {
    textToCopy = linkedinMessageComponent.getMessageText();
  } else {
    textToCopy = followupMessageComponent.getMessageText();
  }
  
  if (!textToCopy || textToCopy.trim() === '') {
    return;
  }
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    
    if (type === 'email') {
      emailTemplateComponent.showCopyFeedback();
    } else if (type === 'linkedin') {
      linkedinMessageComponent.showCopyFeedback();
    } else {
      followupMessageComponent.showCopyFeedback();
    }
  } catch (err) {
    alert('Failed to copy. Please select and copy manually.');
  }
}

function clearMessage(type) {
  if (type === 'email') {
    emailTemplateComponent.clear();
  } else if (type === 'linkedin') {
    linkedinMessageComponent.clear();
  } else {
    followupMessageComponent.clear();
  }
}
