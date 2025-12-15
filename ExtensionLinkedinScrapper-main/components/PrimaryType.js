// Primary Type Component
import { sanitizeText, sanitizeNumber } from '../utils/helpers.js';

export class PrimaryTypeComponent {
  constructor() {
    this.primaryTypeEl = document.getElementById('primaryType');
    this.descriptionEl = document.getElementById('typeDescription');
    this.confidenceEl = document.getElementById('confidenceScore');
  }

  update(data) {
    if (!data) return;
    
    const primaryType = sanitizeText(data.primaryType || 'Unknown');
    const description = sanitizeText(data.description || 'No description available');
    const confidence = sanitizeNumber(data.confidence || 0);
    
    if (this.primaryTypeEl) {
      this.primaryTypeEl.textContent = primaryType;
    }
    
    if (this.descriptionEl) {
      this.descriptionEl.textContent = description;
    }
    
    if (this.confidenceEl) {
      this.confidenceEl.textContent = confidence;
    }
  }
}

