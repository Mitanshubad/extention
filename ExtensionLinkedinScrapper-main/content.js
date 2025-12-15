let isScraping = false;
let lastScrapeTime = 0;
const SCRAPE_COOLDOWN = 2000;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeProfile') {
    if (isScraping) {
      sendResponse({ success: false, message: 'Scraping already in progress' });
      return false;
    }

    const now = Date.now();
    if (now - lastScrapeTime < SCRAPE_COOLDOWN) {
      sendResponse({ success: false, message: 'Please wait before scraping again' });
      return false;
    }

    scrapeLinkedInProfile();
    sendResponse({ success: true, message: 'Scraping started' });
    return true;
  }
  return false;
});

if (window.location.href.includes('/in/')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        scrapeLinkedInProfile();
      }, 3000);
    });
} else {
    setTimeout(() => {
      scrapeLinkedInProfile();
    }, 3000);
  }
}
 
function scrapeLinkedInProfile() {
  if (isScraping) {
    return;
  }

  if (!window.location.href.includes('/in/')) {
    notifyError('NOT_ON_PROFILE_PAGE');
    return;
  }

  isScraping = true;
  lastScrapeTime = Date.now();
    
  try {
    const profileData = {
      name: sanitizeText(getName()),
      headline: sanitizeText(getHeadline()),
      location: sanitizeText(getLocation()),
      about: sanitizeText(getAboutSection(), 1000),
      experience: sanitizeText(formatExperienceToString(getExperienceSection()), 1500),
      skills: sanitizeText(formatSkills(getSkills()), 500),
      topSkills: sanitizeText(formatTopSkills(getTopSkills()), 500),
      posts: getRecentPosts(),
      education: sanitizeText(formatEducation(getEducation()), 500),
      connectionsCount: sanitizeText(getConnectionsCount()),
      currentCompany: sanitizeText(getCurrentCompany()),
      activity: sanitizeText(getActivity(), 1000)
    };
    if (!profileData.name || profileData.name === 'Not available') {
      isScraping = false;
      notifyError('Something went wrong. Please refresh the page.');
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }
    chrome.runtime.sendMessage({
      action: 'analyzeProfile',
      data: profileData
    }, response => {
      isScraping = false;

      if (chrome.runtime.lastError) {
        notifyError('Something went wrong. Please refresh the page.');
        return;
      }
      
      if (response && response.success) {
      } else {
        notifyError('Something went wrong. Please refresh the page.');
      }
    });

  } catch (error) {
    isScraping = false;
    notifyError('Something went wrong. Please refresh the page.');
  }
}

function sanitizeText(text, maxLength = null) {
  if (!text || text === 'Not available') {
    return text || 'Not available';
  }

  let sanitized = String(text)
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>]/g, '');

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized || 'Not available';
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

function getName() {
  const selectors = ['h1', 'h1.break-words', 'h1.v-align-middle'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent && el.textContent.trim().length > 0) {
      return el.textContent.trim();
    }
  }
  return 'Not available';
}

function getHeadline() {
  const fullHeadingSelectors = [
    '.ph5.pb5 .text-body-medium.break-words',
    '.pv-text-details__left-panel .text-body-medium.break-words',
    '.text-body-medium.break-words',
    '.pv-text-details__left-panel .text-body-medium',
    '.text-body-medium',
    '[data-generated-suggestion-target]'
  ];
  
  for (const selector of fullHeadingSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent && el.textContent.trim().length > 0) {
      const text = el.textContent.trim();
      if (text.length > 20) {
        return text;
      }
    }
  }
  const headingContainer = document.querySelector('.pv-text-details__left-panel, .ph5.pb5');
  if (headingContainer) {
    const allText = headingContainer.textContent || '';
    const headlineMatch = allText.match(/([^•\n]+(?:\s*\|\s*[^•\n]+)*)/);
    if (headlineMatch && headlineMatch[1].trim().length > 10) {
      return headlineMatch[1].trim();
  }
  }
  
  return 'Not available';
}

function getLocation() {
  const selectors = [
    '.text-body-small.inline.t-black--light.break-words',
    '.pv-text-details__left-panel .text-body-small'
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent && (el.textContent.includes(',') || el.textContent.trim().length > 3)) {
      return el.textContent.trim();
    }
  }
  return 'Not available';
}

function getAboutSection() {
  const spans = document.querySelectorAll(
    'div.full-width.t-14.t-normal.t-black.display-flex.align-items-center span[aria-hidden="true"]'
  );

  if (!spans.length) return 'About section not found';

  return [...spans]
    .map(s => s.innerText.trim())
    .sort((a, b) => b.length - a.length)[0];
}

function getTopSkills() {
  const skillsBlock = [...document.querySelectorAll(
    'div.display-flex.align-items-center.t-14.t-normal'
  )].find(el => el.innerText.includes('•'));

  if (!skillsBlock) return 'No skills listed';

  return skillsBlock.innerText
    .split('•')
    .map(s => s.trim())
    .filter(Boolean);
}



function getExperienceSection() {
  const items = document.querySelectorAll(
    'li.artdeco-list__item'
  );

  const experience = [];

  items.forEach(item => {
    const positionLink = item.querySelector(
      'a[href*="/add-edit/POSITION/"]'
    );
    if (!positionLink) return;

    const titleEl = positionLink.querySelector(
      'div.t-bold span[aria-hidden="true"]'
    );
    if (!titleEl) return;

    const companyEl = item.querySelector(
      'a[href*="/company/"] span[aria-hidden="true"]'
    );

    const dateEl = item.querySelector(
      '.pvs-entity__caption-wrapper'
    );
    if (!dateEl) return;

    const locationEl = [...item.querySelectorAll(
      'span.t-black--light span[aria-hidden="true"]'
    )].pop();

    experience.push({
      title: titleEl.innerText.trim(),
      company: companyEl ? companyEl.innerText.trim() : '',
      duration: dateEl.innerText.trim(),
      location: locationEl ? locationEl.innerText.trim() : ''
    });
  });

  return experience;
}


function formatExperienceToString(experienceArray) {
  if (!experienceArray.length) {
    return 'No experience data available';
  }

  return experienceArray
    .map((exp, index) => {
      let line = `${index + 1}. ${exp.title}`;

      if (exp.company) line += ` at ${exp.company}`;
      line += ` (${exp.duration}`;

      if (exp.location) line += `, ${exp.location}`;
      line += ')';

      return line;
    })
    .join('\n');
}


function extractPositionDetails(item) {
  const position = {
    title: '',
    duration: '',
    description: ''
  };

  const titleEl = item.querySelector('div.mr1.hoverable-link-text.t-bold span[aria-hidden="true"], div.t-bold span[aria-hidden="true"]');
  if (titleEl) {
    position.title = titleEl.textContent.trim();
  }

  const durationEl = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"], span.t-14.t-normal span.pvs-entity__caption-wrapper span[aria-hidden="true"]');
  if (durationEl) {
    const durationText = durationEl.textContent.trim();
    if (durationText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current)/i)) {
      position.duration = durationText;
    }
  }

  const descriptionEl = item.querySelector('div.inline-show-more-text--is-collapsed span[aria-hidden="true"], div.inline-show-more-text--is-expanded span[aria-hidden="true"], div.GrfFlnjLbpTBlOBNKqZQhYRopJTGyuH span[aria-hidden="true"]');
  if (descriptionEl) {
    position.description = descriptionEl.textContent.trim();
  }

  return position;
}

function formatExperienceEntry(exp) {
  const parts = [];
  
  if (exp.title) {
    parts.push(`Title: ${exp.title}`);
  }
  if (exp.company) {
    parts.push(`Company: ${exp.company}`);
  }
  if (exp.duration) {
    parts.push(`Duration: ${exp.duration}`);
  }
  if (exp.location) {
    parts.push(`Location: ${exp.location}`);
  }
  if (exp.description) {
    parts.push(`Description: ${exp.description}`);
  }

  return parts.join(' | ');
}

function getSkills() {
  const skills = [];

  const skillLinks = document.querySelectorAll(
    'a[data-field="skill_card_skill_topic"]'
  );

  skillLinks.forEach(link => {
    const span = link.querySelector(
      '.t-bold span[aria-hidden="true"]'
    );

    if (!span) return;

    const skill = span.textContent
      .replace(/\s+/g, ' ')
      .trim();

    if (skill && !skills.includes(skill)) {
      skills.push(skill);
    }
  });

  return skills;
}

function formatSkills(skills) {
  if (!skills.length) return 'No skills listed';

  return skills
    .map((skill, i) => `${i + 1}. ${skill}`)
    .join('\n');
}

function formatTopSkills(topSkills) {
  if (typeof topSkills === 'string') {
    return topSkills;
  }
  
  if (!Array.isArray(topSkills) || !topSkills.length) {
    return 'No skills listed';
  }

  return topSkills
    .map((skill, i) => `${i + 1}. ${skill}`)
    .join('\n');
}



function getRecentPosts() {
  const postsSection = document.querySelector('.scaffold-finite-scroll, [data-view-name="profile-recent-activity"]');
  if (postsSection) {
    const postElements = postsSection.querySelectorAll('.feed-shared-update-v2, [data-urn*="activity"]');
    const posts = [];
    
    postElements.forEach((post, index) => {
      if (index < 3) {
        const textEl = post.querySelector('.break-words, .feed-shared-text');
        if (textEl && textEl.textContent) {
          const text = textEl.textContent.trim();
          if (text.length > 10) {
            const timeEl = post.querySelector('.feed-shared-actor__sub-description, time');
        const reactionsEl = post.querySelector('.social-details-social-counts__reactions-count');
        const commentsEl = post.querySelector('.social-details-social-counts__comments');
        
          posts.push({
              text: text.substring(0, 200),
            time: timeEl ? timeEl.textContent.trim() : 'Unknown',
            reactions: reactionsEl ? reactionsEl.textContent.trim() : '0',
            comments: commentsEl ? commentsEl.textContent.trim() : '0'
          });
          }
        }
      }
    });
    
    if (posts.length > 0) {
      return posts;
    }
  }
  
  return [];
}

function getEducation() {
  const educationItems = [];

  const educationLinks = document.querySelectorAll(
    'a[href*="add-edit/EDUCATION"]'
  );

  educationLinks.forEach((link, index) => {
    const university =
      link.querySelector('.t-bold span[aria-hidden="true"]')
        ?.textContent
        ?.trim();

    const degree =
      link.querySelector('.t-14.t-normal span[aria-hidden="true"]')
        ?.textContent
        ?.trim();

    const duration =
      link.querySelector('.pvs-entity__caption-wrapper')
        ?.textContent
        ?.trim();

    if (university) {
      educationItems.push(
        `${index + 1}. ${university}` +
        (degree ? ` — ${degree}` : '') +
        (duration ? ` (${duration})` : '')
      );
    }
  });

  return educationItems;
}


function formatEducation(education) {
  if (!Array.isArray(education) || !education.length) {
    return 'No education data';
  }

  return education.join('\n');
}



function getConnectionsCount() {
  const items = document.querySelectorAll(
    'ul li'
  );

  for (const li of items) {
    if (li.textContent.toLowerCase().includes('connections')) {
      const span = li.querySelector('.t-bold');
      if (!span) return 'Unknown';

      return span.textContent.trim();
    }
  }

  return 'Unknown';
}



function getLicensesAndCertifications() {
  const results = [];

  const items = document.querySelectorAll(
    'div[data-view-name="profile-component-entity"]'
  );

  items.forEach(item => {
    const titleEl = item.querySelector('.t-bold span[aria-hidden="true"]');
    const orgEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
    const dateEl = item.querySelector('.pvs-entity__caption-wrapper');
    const credEl = [...item.querySelectorAll('.t-black--light span')]
      .find(s => s.textContent.includes('Credential ID'));

    if (!titleEl || !orgEl) return;

    const title = titleEl.textContent.trim();
    const organization = orgEl.textContent.trim();
    const date = dateEl ? dateEl.textContent.trim() : '';
    const credentialId = credEl ? credEl.textContent.trim() : '';

    results.push({
      title,
      organization,
      date,
      credentialId
    });
  });

  return results;
}
function formatLicensesToString(licenses) {
  if (!Array.isArray(licenses) || !licenses.length) {
    return 'No licenses or certifications listed';
  }

  return licenses
    .map((lic, index) => {
      let line = `${index + 1}. ${lic.title} – ${lic.organization}`;

      if (lic.date) line += ` (${lic.date})`;
      if (lic.credentialId) line += `, ${lic.credentialId}`;

      return line;
    })
    .join('\n');
}




function getCurrentCompany() {
  // 1. aria-label (best)
  const btn = document.querySelector('button[aria-label^="Current company:"]');
  if (btn) {
    const m = btn.getAttribute('aria-label')?.match(/Current company:\s*(.*?)\./);
    if (m) return m[1].trim();
  }

  // 2. visible text
  const text = document.querySelector('button span div[dir="ltr"]');
  if (text?.textContent.trim()) return text.textContent.trim();

  // 3. logo URL fallback
  const img = document.querySelector('button img[src*="company-logo"]');
  if (img) {
    const m = img.src.match(/\/([^\/]+)_logo/i);
    if (m) return m[1].replace(/[-_]/g, ' ').trim();
  }

  return 'Not available';
}


function getActivity() {
  const activitySelectors = [
    '.scaffold-finite-scroll',
    '[data-view-name="profile-recent-activity"]',
    '.feed-shared-update-v2',
    '[data-urn*="activity"]'
  ];
  
  const activities = [];
  
  for (const selector of activitySelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach((element, index) => {
        if (index < 5) {
          const textEl = element.querySelector('.break-words, .feed-shared-text, .update-components-text');
          if (textEl && textEl.textContent) {
            const text = textEl.textContent.trim();
            if (text.length > 20) {
              const timeEl = element.querySelector('.feed-shared-actor__sub-description, time, .update-components-actor__sub-description');
              const reactionsEl = element.querySelector('.social-details-social-counts__reactions-count, [data-test-id="reactions-count"]');
              const commentsEl = element.querySelector('.social-details-social-counts__comments, [data-test-id="comments-count"]');
              
              activities.push({
                text: text.substring(0, 300),
                time: timeEl ? timeEl.textContent.trim() : 'Unknown',
                reactions: reactionsEl ? reactionsEl.textContent.trim() : '0',
                comments: commentsEl ? commentsEl.textContent.trim() : '0'
              });
            }
          }
        }
      });
      
      if (activities.length > 0) {
        break;
      }
    }
  }
  
  if (activities.length > 0) {
    return activities.map((act, idx) => 
      `Activity ${idx + 1} (${act.time}): "${act.text}" - ${act.reactions} reactions, ${act.comments} comments`
    ).join('\n\n');
  }
  
  return 'No recent activity available';
}

function notifyError(errorMessage) {
  chrome.runtime.sendMessage({
    action: 'scrapeError',
    error: errorMessage
  }).catch(() => {});
}
