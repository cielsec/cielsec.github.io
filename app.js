/**
 * CIEL SEC - Enhanced Interactive Experience
 * v2.0 - More animations, better performance, smoother transitions
 */

(() => {
  'use strict';

  // Configuration
  const CONFIG = {
    typingSpeed: 12,
    typingVariance: 4,
    cursorSmoothness: 0.15,
    parallaxIntensity: 0.06,
    animationDuration: 550,
    debounceDelay: 100
  };

  // DOM Elements cache
  const DOM = {
    body: document.body,
    hero: document.getElementById('hero'),
    hub: document.getElementById('hub'),
    enterBtn: document.getElementById('enter-btn'),
    linesEl: document.getElementById('boot-lines'),
    actions: document.getElementById('hero-actions'),
    cursorDot: document.querySelector('.cursor-dot'),
    cursorRing: document.querySelector('.cursor-ring'),
    hostInput: document.getElementById('host-input'),
    dstatImg: document.getElementById('dstat-img'),
    dstatUrl: document.getElementById('dstat-url'),
    dstatStatus: document.getElementById('dstat-status'),
    dstatRefresh: document.getElementById('dstat-refresh'),
    dstatOpen: document.getElementById('dstat-open')
  };

  // Utility functions
  const utils = {
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    random: (min, max) => Math.random() * (max - min) + min,
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    throttle: (fn, limit) => {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          fn(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    debounce: (fn, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
      };
    }
  };

  // Escape HTML to prevent XSS
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Create styled span
  const span = (cls, text) => `<span class="${cls}">${escapeHTML(text)}</span>`;

  // ==================== PARALLAX EFFECT ====================
  const initParallax = () => {
    let ticking = false;
    
    const updateParallax = () => {
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty('--scroll', `${scrollY}px`);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Initial call
    updateParallax();
  };

  // ==================== CUSTOM CURSOR ====================
  const initCursor = () => {
    if (!DOM.cursorDot || !DOM.cursorRing) return;
    if (window.matchMedia('(pointer: coarse)').matches) {
      DOM.body.classList.add('cursor-hidden');
      return;
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let isActive = true;
    let inactivityTimeout;

    const updateCursor = () => {
      if (!isActive) return;
      
      // Smooth follow for ring
      ringX += (mouseX - ringX) * CONFIG.cursorSmoothness;
      ringY += (mouseY - ringY) * CONFIG.cursorSmoothness;
      
      DOM.cursorRing.style.left = `${ringX}px`;
      DOM.cursorRing.style.top = `${ringY}px`;
      
      requestAnimationFrame(updateCursor);
    };

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      DOM.cursorDot.style.left = `${mouseX}px`;
      DOM.cursorDot.style.top = `${mouseY}px`;
      
      DOM.body.classList.remove('cursor-hidden');
      
      // Reset inactivity timer
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        DOM.body.classList.add('cursor-hidden');
      }, 3000);
    });

    // Hover states
    const addHoverListeners = () => {
      document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('button, a, summary, .hub-btn, .project-card');
        if (target) {
          DOM.body.classList.add('cursor-hover');
        }
      });

      document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('button, a, summary, .hub-btn, .project-card');
        if (target) {
          DOM.body.classList.remove('cursor-hover');
        }
      });
    };

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      isActive = document.visibilityState === 'visible';
      if (isActive) updateCursor();
    });

    addHoverListeners();
    updateCursor();
  };

  // ==================== TERMINAL BOOT SEQUENCE ====================
  const bootLines = [
    { text: `${span('term-user', '┌──(ciel)')}㉿${span('term-host', 'kali')}${span('term-user', ')-[~]')}`, delay: 0 },
    { text: `${span('term-user', '└─$')} ${span('cmd', 'whoami')}`, delay: 100 },
    { text: span('term-ok', 'ciel'), delay: 200 },
    { text: `${span('term-user', '└─$')} ${span('cmd', 'echo "conhecimento é poder"')}`, delay: 150 },
    { text: span('term-dim', 'conhecimento é poder'), delay: 200 },
    { text: `${span('term-user', '└─$')} ${span('cmd', 'echo "disciplina > ego"')}`, delay: 150 },
    { text: span('term-dim', 'disciplina > ego'), delay: 200 },
    { text: `${span('term-user', '└─$')} ${span('cmd', 'echo "método vence sorte"')}`, delay: 150 },
    { text: span('term-dim', 'método vence sorte'), delay: 200 },
    { text: `${span('term-user', '└─$')} ${span('cmd', 'init --modules panel projects tools')}`, delay: 200 },
    { text: `${span('term-ok', '[OK]')} ${span('term-dim', 'carregando módulos...')}`, delay: 300 },
    { text: `${span('term-ok', '[OK]')} ${span('term-dim', 'preparando interface...')}`, delay: 300 },
    { text: `${span('term-ok', '[OK]')} ${span('term-dim', 'pronto.')}`, delay: 400 }
  ];

  const typeLine = async (html, baseSpeed = CONFIG.typingSpeed) => {
    const line = document.createElement('div');
    line.className = 'term-line';
    DOM.linesEl.appendChild(line);

    // Extract plain text for typing effect
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent;
    
    // Build character map for styling
    const charMap = [];
    let charIndex = 0;
    
    const walkNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const char of node.textContent) {
          charMap.push({ char, className: null });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
          const startIdx = charMap.length;
          walkNodes(child);
          const endIdx = charMap.length;
          for (let i = startIdx; i < endIdx; i++) {
            charMap[i].className = node.className;
          }
        }
      }
    };
    
    walkNodes(tempDiv);

    // Type each character
    let currentHTML = '';
    let currentClass = null;
    let buffer = '';
    
    for (let i = 0; i < charMap.length; i++) {
      const { char, className } = charMap[i];
      
      // Handle class changes
      if (className !== currentClass) {
        if (buffer) {
          currentHTML += currentClass 
            ? `<span class="${currentClass}">${escapeHTML(buffer)}</span>` 
            : escapeHTML(buffer);
        }
        buffer = '';
        currentClass = className;
      }
      
      buffer += char;
      
      // Update display
      line.innerHTML = currentHTML + (currentClass 
        ? `<span class="${currentClass}">${escapeHTML(buffer)}</span>` 
        : escapeHTML(buffer));
      
      // Scroll to bottom
      DOM.linesEl.scrollTop = DOM.linesEl.scrollHeight;
      
      // Random typing speed for realism
      const speed = baseSpeed + utils.random(-CONFIG.typingVariance, CONFIG.typingVariance);
      await utils.sleep(speed);
    }
    
    // Finalize
    if (buffer) {
      currentHTML += currentClass 
        ? `<span class="${currentClass}">${escapeHTML(buffer)}</span>` 
        : escapeHTML(buffer);
    }
    line.innerHTML = currentHTML;
  };

  const boot = async () => {
    if (!DOM.linesEl) return;

    // Clear and reset
    DOM.linesEl.innerHTML = '';
    DOM.actions?.classList.add('hero-actions-hidden');
    DOM.actions?.classList.remove('hero-actions-visible');

    await utils.sleep(300);

    // Type each line
    for (const line of bootLines) {
      await typeLine(line.text, CONFIG.typingSpeed);
      await utils.sleep(line.delay);
    }

    // Show actions with delay
    await utils.sleep(300);
    DOM.actions?.classList.remove('hero-actions-hidden');
    DOM.actions?.classList.add('hero-actions-visible');
  };

  // ==================== SCREEN TRANSITIONS ====================
  const transitionTo = (from, to, callback) => {
    DOM.body.classList.add('is-wiping');

    setTimeout(() => {
      from.classList.add('is-exiting');
      from.setAttribute('aria-hidden', 'true');

      setTimeout(() => {
        from.classList.remove('is-active', 'is-exiting');
        
        to.classList.add('is-active');
        to.setAttribute('aria-hidden', 'false');
        to.focus?.();

        DOM.body.classList.remove('is-wiping');
        
        if (callback) callback();
      }, 420);
    }, 100);
  };

  const showHub = () => transitionTo(DOM.hero, DOM.hub);
  
  const showHero = () => transitionTo(DOM.hub, DOM.hero, boot);

  // ==================== TABS SYSTEM ====================
  const initTabs = () => {
    const buttons = document.querySelectorAll('.hub-btn');
    const panels = document.querySelectorAll('.hub-panel');

    const activatePanel = (panelId) => {
      // Update buttons
      buttons.forEach(btn => {
        const isActive = btn.dataset.panel === panelId;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        
        // Add ripple effect
        if (isActive) {
          btn.style.transform = 'scale(0.98)';
          setTimeout(() => btn.style.transform = '', 100);
        }
      });

      // Update panels with stagger animation
      panels.forEach((panel, index) => {
        const isActive = panel.dataset.panelId === panelId;
        
        if (isActive) {
          panel.hidden = false;
          panel.style.animationDelay = `${index * 50}ms`;
          requestAnimationFrame(() => {
            panel.classList.add('is-active');
          });
        } else {
          panel.classList.remove('is-active');
          setTimeout(() => panel.hidden = true, 300);
        }
      });
    };

    // Event delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.hub-btn');
      if (btn) activatePanel(btn.dataset.panel);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const activeBtn = document.querySelector('.hub-btn.is-active');
        if (!activeBtn) return;
        
        const buttonsArray = Array.from(buttons);
        const currentIndex = buttonsArray.indexOf(activeBtn);
        const nextIndex = e.key === 'ArrowRight' 
          ? (currentIndex + 1) % buttons.length
          : (currentIndex - 1 + buttons.length) % buttons.length;
        
        buttonsArray[nextIndex].click();
        buttonsArray[nextIndex].focus();
      }
    });
  };

  // ==================== PROJECTS DROPDOWN ====================
  const initProjects = () => {
    const loadCodeFromTemplate = (codeEl) => {
      const templateId = codeEl?.dataset?.template;
      if (!templateId) return;
      
      const template = document.getElementById(templateId);
      if (!template) return;
      
      const code = template.content.querySelector('code');
      if (!code) return;
      
      // Add syntax highlighting simulation
      let content = code.textContent || '';
      codeEl.textContent = content;
      codeEl.dataset.loaded = '1';
    };

    const closeAllDrops = (exceptKey = null) => {
      document.querySelectorAll('.project-card').forEach(card => {
        const key = card.dataset.project;
        if (exceptKey && key === exceptKey) return;
        
        card.classList.remove('is-open');
        card.style.transform = '';
        const drop = card.querySelector('.project-drop');
        if (drop) drop.setAttribute('aria-hidden', 'true');
      });
    };

    const toggleDrop = (key) => {
      const card = document.querySelector(`.project-card[data-project="${key}"]`);
      if (!card) return;

      const isOpening = !card.classList.contains('is-open');
      closeAllDrops(isOpening ? key : null);

      card.classList.toggle('is-open', isOpening);
      
      // Add subtle animation
      if (isOpening) {
        card.style.transform = 'scale(1.02)';
        setTimeout(() => card.style.transform = '', 200);
      }

      const drop = document.getElementById(`drop-${key}`);
      if (drop) {
        drop.setAttribute('aria-hidden', isOpening ? 'false' : 'true');
        
        if (isOpening) {
          const codeEl = drop.querySelector('code[data-template]');
          if (codeEl && !codeEl.dataset.loaded) {
            loadCodeFromTemplate(codeEl);
          }
          
          // Smooth scroll
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }, 100);
        }
      }
    };

    // Event delegation
    document.addEventListener('click', (e) => {
      const moreBtn = e.target.closest('.project-more');
      if (moreBtn) {
        e.preventDefault();
        e.stopPropagation();
        toggleDrop(moreBtn.dataset.projectOpen);
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.project-card')) {
        closeAllDrops();
      }
    });
  };

  // ==================== COPY FUNCTIONALITY ====================
  const initCopyButtons = () => {
    const copyToClipboard = async (text, btn) => {
      try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="term-ok">✓ COPIADO</span>';
        btn.style.borderColor = 'var(--neon)';
        btn.style.boxShadow = 'var(--shadow)';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.borderColor = '';
          btn.style.boxShadow = '';
        }, 1500);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        btn.textContent = 'COPIADO ✓';
        setTimeout(() => btn.textContent = 'COPIAR', 1500);
      }
    };

    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.copy-btn');
      if (copyBtn) {
        const selector = copyBtn.dataset.copy;
        const sourceEl = document.querySelector(selector);
        if (sourceEl) {
          copyToClipboard(sourceEl.textContent, copyBtn);
        }
      }
    });
  };

  // ==================== DSTAT INTEGRATION ====================
  const initDstat = () => {
    if (!DOM.dstatImg) return;

    const setStatus = (text, type) => {
      if (!DOM.dstatStatus) return;
      
      const colors = {
        ok: 'rgba(0, 255, 153, 0.85)',
        bad: 'rgba(255, 95, 87, 0.9)',
        warn: 'rgba(254, 188, 46, 0.95)',
        loading: 'rgba(90, 200, 250, 0.85)'
      };
      
      DOM.dstatStatus.textContent = text;
      DOM.dstatStatus.style.color = colors[type] || colors.ok;
    };

    const buildUrl = (ip) => {
      return `https://www.vedbex.com/tools/ajax/dstat/L7/graph?ip=${encodeURIComponent(ip)}&title=false`;
    };

    const loadDstat = () => {
      const host = (DOM.hostInput?.value || '').trim();
      
      if (!host) {
        setStatus('SEM HOST', 'bad');
        if (DOM.dstatUrl) DOM.dstatUrl.textContent = 'Informe um host/IP na aba Central.';
        DOM.dstatImg.removeAttribute('src');
        return;
      }

      const url = buildUrl(host);
      if (DOM.dstatUrl) DOM.dstatUrl.textContent = url;

      // Add cache buster
      const bust = `&t=${Date.now()}`;
      
      setStatus('CARREGANDO...', 'loading');
      
      DOM.dstatImg.onload = () => setStatus('ONLINE', 'ok');
      DOM.dstatImg.onerror = () => setStatus('OFFLINE', 'bad');
      DOM.dstatImg.src = url + bust;
    };

    // Event listeners
    DOM.dstatRefresh?.addEventListener('click', () => {
      DOM.dstatRefresh.style.transform = 'rotate(360deg)';
      setTimeout(() => DOM.dstatRefresh.style.transform = '', 500);
      loadDstat();
    });

    DOM.dstatOpen?.addEventListener('click', () => {
      const host = (DOM.hostInput?.value || '').trim();
      if (host) {
        window.open(buildUrl(host), '_blank', 'noopener,noreferrer');
      }
    });

    // Debounced auto-update
    const debouncedLoad = utils.debounce(loadDstat, 500);
    DOM.hostInput?.addEventListener('input', debouncedLoad);
  };

  // ==================== INTERSECTION OBSERVER ====================
  const initScrollAnimations = () => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.project-card, .hub-panel, .drop-item').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s var(--e), transform 0.6s var(--e)';
      observer.observe(el);
    });

    // Add visibility styles
    const style = document.createElement('style');
    style.textContent = `
      .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  };

  // ==================== KEYBOARD SHORTCUTS ====================
  const initKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // ESC to go back
      if (e.key === 'Escape' && DOM.hub.classList.contains('is-active')) {
        showHero();
      }
      
      // R to refresh dstat
      if (e.key === 'r' && e.ctrlKey && DOM.dstatRefresh) {
        e.preventDefault();
        DOM.dstatRefresh.click();
      }
    });
  };

  // ==================== INITIALIZATION ====================
  const init = () => {
    // Initialize all modules
    initParallax();
    initCursor();
    initTabs();
    initProjects();
    initCopyButtons();
    initDstat();
    initScrollAnimations();
    initKeyboardShortcuts();

    // Event listeners
    window.addEventListener('load', () => {
      boot();
      
      // Add loaded class for entrance animations
      DOM.body.classList.add('is-loaded');
    });

    DOM.enterBtn?.addEventListener('click', showHub);

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        DOM.body.classList.remove('is-paused');
      } else {
        DOM.body.classList.add('is-paused');
      }
    });
  };

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.CIELSEC = {
    boot,
    showHub,
    showHero,
    utils
  };
})();
