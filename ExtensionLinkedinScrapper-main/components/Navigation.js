// Navigation Component
export class NavigationComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.navigationGroups = [
      {
        title: 'Messaging',
        sections: [
          { id: 'email-template', label: 'Email Template', icon: '📧' },
          { id: 'linkedin-message', label: 'LinkedIn Message', icon: '💼' },
          { id: 'follow-up-message', label: 'Follow-up Message', icon: '🔄' }
        ]
      }
    ];
  }

  initialize() {
    if (!this.container) return;
    
    this.container.innerHTML = '';
    
    this.navigationGroups.forEach((group) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'nav-group';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'nav-group-title';
      titleDiv.textContent = group.title;
      groupDiv.appendChild(titleDiv);
      
      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'nav-group-items';
      
      group.sections.forEach((section) => {
        const button = document.createElement('button');
        button.className = 'nav-button';
        button.innerHTML = `<span class="nav-button-icon">${section.icon}</span><span>${section.label}</span>`;
        button.addEventListener('click', () => {
          this.scrollToSection(section.id);
          this.closeMenu();
        });
        itemsDiv.appendChild(button);
      });
      
      groupDiv.appendChild(itemsDiv);
      this.container.appendChild(groupDiv);
    });
  }

  scrollToSection(sectionId) {
    // Map section IDs to view IDs
    const viewMap = {
      'email-template': 'emailTemplateView',
      'linkedin-message': 'linkedinMessageView',
      'follow-up-message': 'followupMessageView'
    };
    
    const viewId = viewMap[sectionId];
    if (viewId) {
      this.showView(viewId);
    }
  }

  showView(viewId) {
    // Hide all views
    const allViews = document.querySelectorAll('.content-view');
    allViews.forEach(view => {
      view.style.display = 'none';
    });
    
    // Show the selected view
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.style.display = 'block';
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  showMainView() {
    // Hide all message views
    const messageViews = document.querySelectorAll('.message-view');
    messageViews.forEach(view => {
      view.style.display = 'none';
    });
    
    // Show main content view
    const mainView = document.getElementById('mainContentView');
    if (mainView) {
      mainView.style.display = 'block';
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  closeMenu() {
    const overlay = document.getElementById('burgerMenuOverlay');
    const button = document.getElementById('burgerMenuButton');
    if (overlay) {
      overlay.classList.remove('active');
    }
    if (button) {
      button.classList.remove('active');
    }
  }
}

