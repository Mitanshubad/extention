// Profile Info Component
import { sanitizeText } from '../utils/helpers.js';

export class ProfileInfoComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.nameEl = document.getElementById('profileName');
    this.headlineEl = document.getElementById('profileHeadline');
  }

  update(profileData) {
    if (!profileData) return;
    if (this.nameEl && profileData.name) {
      this.nameEl.textContent = sanitizeText(profileData.name);
    }
    
    if (this.headlineEl && profileData.headline && profileData.headline !== 'Not available') {
      this.headlineEl.textContent = sanitizeText(profileData.headline);
    }
    
    if (this.container && profileData.name) {
      this.container.style.display = 'block';
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

