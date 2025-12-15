// Insights Component
import { sanitizeText } from '../utils/helpers.js';

export class InsightsComponent {
  constructor() {
    this.keyInsightsList = document.getElementById('keyInsightsList');
    this.painPointsList = document.getElementById('painPointsList');
    this.communicationStyle = document.getElementById('communicationStyle');
    this.salesApproach = document.getElementById('salesApproach');
    this.idealPitch = document.getElementById('idealPitch');
    this.bestApproach = document.getElementById('bestApproach');
    this.doList = document.getElementById('doList');
    this.dontList = document.getElementById('dontList');
  }

  update(data) {
    if (!data) return;
    
    // Key insights
    if (this.keyInsightsList) {
      this.keyInsightsList.innerHTML = '';
      const insights = data.keyInsights || data.key_insights || [];
      insights.forEach(insight => {
        const li = document.createElement('li');
        li.textContent = sanitizeText(String(insight));
        this.keyInsightsList.appendChild(li);
      });
    }
    
    // Pain points
    if (this.painPointsList) {
      this.painPointsList.innerHTML = '';
      const points = data.painPoints || data.pain_points || [];
      points.forEach(point => {
        const li = document.createElement('li');
        li.textContent = sanitizeText(String(point));
        this.painPointsList.appendChild(li);
      });
    }
    
    // Communication sections
    if (this.communicationStyle) {
      this.communicationStyle.textContent = sanitizeText(data.communicationStyle || data.communication_style || 'Not available');
    }
    
    if (this.salesApproach) {
      this.salesApproach.textContent = sanitizeText(data.salesApproach || data.sales_approach || 'Not available');
    }
    
    if (this.idealPitch) {
      this.idealPitch.textContent = sanitizeText(data.idealPitch || data.ideal_pitch || 'Not available');
    }
    
    if (this.bestApproach) {
      this.bestApproach.textContent = sanitizeText(data.bestApproach || data.best_approach || 'Not available');
    }
    
    // Do & Avoid
    if (this.doList) {
      this.doList.innerHTML = '';
      const dos = data.communicationDos || data.communication_dos || [];
      dos.forEach(item => {
        const li = document.createElement('li');
        li.textContent = sanitizeText(String(item));
        this.doList.appendChild(li);
      });
    }
    
    if (this.dontList) {
      this.dontList.innerHTML = '';
      const donts = data.communicationDonts || data.communication_donts || [];
      donts.forEach(item => {
        const li = document.createElement('li');
        li.textContent = sanitizeText(String(item));
        this.dontList.appendChild(li);
      });
    }
  }
}

