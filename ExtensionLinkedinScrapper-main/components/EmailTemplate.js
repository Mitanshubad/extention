// Email Template Component
import { sanitizeText } from '../utils/helpers.js';

export class EmailTemplateComponent {
  constructor() {
    this.queryInput = document.getElementById('emailQuery');
    this.generateButton = document.getElementById('emailGenerateButton');
    this.generateText = document.getElementById('emailGenerateText');
    this.spinner = document.getElementById('emailSpinner');
    this.output = document.getElementById('emailOutput');
    this.actions = document.getElementById('emailActions');
    this.subjectEl = document.getElementById('emailSubject');
    this.bodyEl = document.getElementById('emailBody');
    this.copyButton = document.getElementById('emailCopyButton');
    this.clearButton = document.getElementById('emailClearButton');
  }

  setupListeners(onGenerate, onCopy, onClear) {
    if (this.generateButton && onGenerate) {
      this.generateButton.addEventListener('click', onGenerate);
    }
    
    if (this.copyButton && onCopy) {
      this.copyButton.addEventListener('click', onCopy);
    }
    
    if (this.clearButton && onClear) {
      this.clearButton.addEventListener('click', onClear);
    }
  }

  getQuery() {
    return this.queryInput ? this.queryInput.value.trim() : '';
  }

  setGenerating(isGenerating) {
    if (this.generateButton) {
      this.generateButton.disabled = isGenerating;
    }
    
    if (this.generateText) {
      this.generateText.textContent = isGenerating ? 'Generating...' : 'Generate Email';
    }
    
    if (this.spinner) {
      this.spinner.style.display = isGenerating ? 'inline-block' : 'none';
    }
  }

  displayTemplate(data) {
    if (this.output) {
      this.output.style.display = 'block';
    }
    
    if (this.actions) {
      this.actions.style.display = 'flex';
    }
    
    if (this.subjectEl) {
      this.subjectEl.textContent = sanitizeText(data.subject || '');
    }
    
    if (this.bodyEl) {
      this.bodyEl.textContent = sanitizeText(data.body || '');
    }
  }

  clear() {
    if (this.output) {
      this.output.style.display = 'none';
    }
    
    if (this.actions) {
      this.actions.style.display = 'none';
    }
    
    if (this.queryInput) {
      this.queryInput.value = '';
    }
    
    if (this.subjectEl) {
      this.subjectEl.textContent = '';
    }
    
    if (this.bodyEl) {
      this.bodyEl.textContent = '';
    }
  }

  showCopyFeedback() {
    if (this.copyButton) {
      this.copyButton.classList.add('copied');
      setTimeout(() => {
        this.copyButton.classList.remove('copied');
      }, 2000);
    }
  }

  getEmailText() {
    const subject = this.subjectEl ? this.subjectEl.textContent : '';
    const body = this.bodyEl ? this.bodyEl.textContent : '';
    return `Subject: ${subject}\n\n${body}`;
  }
}

