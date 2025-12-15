// Not On Profile Component
export class NotOnProfileComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.refreshButton = document.getElementById('refreshButtonTop');
  }

  show(onRefresh) {
    if (this.container) {
      this.container.style.display = 'block';
    }
    
    if (this.refreshButton && onRefresh) {
      this.refreshButton.onclick = onRefresh;
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

