// DISC Personality Component
import { sanitizeNumber } from '../utils/helpers.js';

export class DiscPersonalityComponent {
  constructor() {
    this.bars = {
      dom: { bar: document.getElementById('domBar'), value: document.getElementById('domValue') },
      inf: { bar: document.getElementById('infBar'), value: document.getElementById('infValue') },
      ste: { bar: document.getElementById('steBar'), value: document.getElementById('steValue') },
      com: { bar: document.getElementById('comBar'), value: document.getElementById('comValue') }
    };
  }

  update(data) {
    if (!data) return;
    
    setTimeout(() => {
      this.setBar('dom', sanitizeNumber(data.dominance || 0));
      this.setBar('inf', sanitizeNumber(data.influence || 0));
      this.setBar('ste', sanitizeNumber(data.steadiness || 0));
      this.setBar('com', sanitizeNumber(data.compliance || 0));
    }, 100);
  }

  setBar(prefix, percentage) {
    const clampedValue = Math.max(0, Math.min(100, percentage));
    const barData = this.bars[prefix];
    
    if (barData && barData.bar) {
      barData.bar.style.width = clampedValue + '%';
      if (clampedValue > 5) {
        barData.bar.textContent = clampedValue + '%';
      }
    }
    
    if (barData && barData.value) {
      barData.value.textContent = clampedValue + '%';
    }
  }
}

