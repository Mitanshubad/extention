// Message Section Component
import { sanitizeText } from '../utils/helpers.js';

export class MessageSectionComponent {
  constructor(type) {
    this.type = type;
    this.queryInput = document.getElementById(`${type}Query`);
    this.generateButton = document.getElementById(`${type}GenerateButton`);
    this.generateText = document.getElementById(`${type}GenerateText`);
    this.spinner = document.getElementById(`${type}Spinner`);
    this.output = document.getElementById(`${type}Output`);
    this.actions = document.getElementById(`${type}Actions`);
    this.messageEl = document.getElementById(`${type}Message`);
    this.copyButton = document.getElementById(`${type}CopyButton`);
    this.clearButton = document.getElementById(`${type}ClearButton`);
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
      this.generateText.textContent = isGenerating ? 'Generating...' : (this.type === 'email' ? 'Generate Email' : 'Generate Message');
    }
    
    if (this.spinner) {
      this.spinner.style.display = isGenerating ? 'inline-block' : 'none';
    }
  }

  displayMessage(message) {
    if (this.output) {
      this.output.style.display = 'block';
    }
    
    if (this.actions) {
      this.actions.style.display = 'flex';
    }
    
    if (this.messageEl) {
      this.messageEl.textContent = sanitizeText(message);
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
    
    if (this.messageEl) {
      this.messageEl.textContent = '';
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

  getMessageText() {
    return this.messageEl ? this.messageEl.textContent : '';
  }
}

