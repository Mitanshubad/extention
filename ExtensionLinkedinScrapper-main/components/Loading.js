// Loading Component
export class LoadingComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  updateProgress(progress, text) {
    const progressBar = document.getElementById('progressBar');
    const progressBarText = document.getElementById('progressBarText');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressText = document.getElementById('progressText');
    
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    if (progressBar) {
      progressBar.style.width = clampedProgress + '%';
      if (clampedProgress > 8 && progressBarText) {
        progressBarText.textContent = Math.round(clampedProgress) + '%';
      }
    }
    
    if (progressPercentage) {
      progressPercentage.textContent = Math.round(clampedProgress) + '%';
    }
    
    if (progressText) {
      progressText.textContent = text;
    }
    
    // Update loading info items based on progress
    this.updateLoadingInfoItems(clampedProgress);
  }
  
  updateLoadingInfoItems(progress) {
    const items = document.querySelectorAll('.loading-info-item');
    items.forEach((item, index) => {
      const svg = item.querySelector('svg');
      if (!svg) return;
      
      // Show checkmark when progress reaches certain thresholds
      // Distribute thresholds across 9 items (0-100%)
      const thresholds = [11, 22, 33, 44, 55, 66, 77, 88, 95];
      if (progress >= thresholds[index]) {
        item.classList.add('completed');
        svg.style.color = '#28a745';
        svg.style.opacity = '1';
      } else {
        item.classList.remove('completed');
        svg.style.color = '#0a66c2';
        svg.style.opacity = '0.7';
      }
    });
  }
}

