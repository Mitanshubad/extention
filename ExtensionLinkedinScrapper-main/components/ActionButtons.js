// Action Buttons Component
export class ActionButtonsComponent {
  constructor() {
    this.refreshButton = document.getElementById('refreshButton');
    this.saveButton = document.getElementById('saveButton');
  }

  setupListeners(onRefresh, onSave) {
    if (this.refreshButton && onRefresh) {
      this.refreshButton.addEventListener('click', onRefresh);
    }
    
    if (this.saveButton && onSave) {
      this.saveButton.addEventListener('click', onSave);
    }
  }

  setSaveState(state, text) {
    if (!this.saveButton) return;
    
    this.saveButton.disabled = state === 'saving';
    this.saveButton.title = text || 'Save';
    
    // Reset classes - use header-action-button since buttons are in header
    this.saveButton.className = 'header-action-button';
    
    if (state === 'saving') {
      this.saveButton.classList.add('saving');
    } else if (state === 'success') {
      this.saveButton.classList.add('success');
      setTimeout(() => {
        this.saveButton.classList.remove('success');
      }, 3000);
    } else if (state === 'exists') {
      this.saveButton.classList.add('exists');
      setTimeout(() => {
        this.saveButton.classList.remove('exists');
      }, 5000);
    } else if (state === 'error') {
      this.saveButton.classList.add('error');
      setTimeout(() => {
        this.saveButton.classList.remove('error');
      }, 3000);
    }
  }
}

