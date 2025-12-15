// Error Component
export class ErrorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.errorMessageEl = document.getElementById('errorMessage');
    this.retryButton = document.getElementById('retryButton');
  }

  show(errorMessage, onRetry) {
    if (this.container) {
      this.container.style.display = 'block';
    }
    
    if (this.errorMessageEl) {
      this.errorMessageEl.textContent = errorMessage;
    }
    
    if (this.retryButton && onRetry) {
      this.retryButton.onclick = onRetry;
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

