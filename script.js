/**
 * ROSHDY MOHAMED — PERSONAL PORTFOLIO INTERACTIVITY
 * High-performance, zero-dependency vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. DYNAMIC HERO CANVAS (Particle Mesh & Constellation)
  // ==========================================================================
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.baseColor = Math.random() > 0.4 ? 'rgba(56, 189, 248,' : 'rgba(168, 85, 247,';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 2.5;
            this.y -= forceDirectionY * force * 2.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.baseColor} 0.7)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    let animationFrameId;
    let isHeroVisible = true;

    // Observe hero visibility to conserve CPU
    const heroSection = document.getElementById('hero');
    const heroObserver = new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0].isIntersecting;
        if (isHeroVisible && !animationFrameId) {
          render();
        }
      },
      { threshold: 0.1 }
    );
    if (heroSection) heroObserver.observe(heroSection);

    function connectParticles() {
      const maxDistance = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.hypot(dx, dy);

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function render() {
      if (!isHeroVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(render);
    }

    initParticles();
    render();
  }

  // ==========================================================================
  // 2. SPOTLIGHT CARD MOUSE TRACKING
  // ==========================================================================
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ==========================================================================
  // 3. NAVBAR SCROLL EFFECT & ACTIVE SECTION HIGHLIGHTING
  // ==========================================================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateTimelineProgress();
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  // ==========================================================================
  // 4. TIMELINE SCROLL PROGRESS TRACKER
  // ==========================================================================
  const timelineProgress = document.getElementById('timelineProgress');
  const journeySection = document.getElementById('journey');

  function updateTimelineProgress() {
    if (!journeySection || !timelineProgress) return;
    const rect = journeySection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight && rect.bottom >= 0) {
      const totalDist = rect.height + windowHeight;
      const currentScroll = windowHeight - rect.top;
      const percent = Math.min(Math.max((currentScroll / totalDist) * 100, 0), 100);
      timelineProgress.style.height = `${percent}%`;
    }
  }

  // ==========================================================================
  // 5. MOBILE DRAWER NAVIGATION
  // ==========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ==========================================================================
  // 6. SCROLL REVEAL ANIMATIONS
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ==========================================================================
  // 7. TOAST NOTIFICATION UTILITY
  // ==========================================================================
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimeout;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Copy Email Button
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailLink = document.getElementById('emailLink');

  if (copyEmailBtn && emailLink) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = emailLink.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        showToast(`Copied to clipboard: ${email}`);
      } catch (err) {
        showToast('Email address ready to copy.');
      }
    });
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 8. INTERACTIVE ROSHDY BANK CLI SIMULATOR
  // ==========================================================================
  const terminalModal = document.getElementById('terminalModal');
  const openTerminalModalBtn = document.getElementById('openTerminalModalBtn');
  const terminalPillTrigger = document.getElementById('terminalPillTrigger');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalBottomBtn = document.getElementById('closeModalBottomBtn');
  const modalTermForm = document.getElementById('modalTermForm');
  const modalTermInput = document.getElementById('modalTermInput');
  const modalTermOutput = document.getElementById('modalTermOutput');

  // Simulated Banking Engine State
  const bankState = {
    accountNumber: 1042,
    ownerName: 'Roshdy Mohamed',
    balance: 1500.0,
    history: [
      'Account initialized with $1000.00',
      'Deposit confirmed: +$500.00 via ATM'
    ]
  };

  function appendTerminalLine(text, className = 'output') {
    if (!modalTermOutput) return;
    const p = document.createElement('p');
    p.className = `term-line ${className}`;
    p.innerHTML = text;
    modalTermOutput.appendChild(p);
    modalTermOutput.scrollTop = modalTermOutput.scrollHeight;
  }

  function handleBankCommand(cmd) {
    const raw = cmd.trim();
    if (!raw) return;

    appendTerminalLine(`<span class="term-cyan">roshdy_bank&gt;</span> ${raw}`, 'prompt');
    const parts = raw.split(' ').filter(Boolean);
    const action = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (action) {
      case 'help':
        appendTerminalLine('Available C++ simulation commands:');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">balance</span> - Check your current account balance');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">deposit &lt;amount&gt;</span> - Deposit funds to your account');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">withdraw &lt;amount&gt;</span> - Withdraw funds from account');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">transfer &lt;recipient&gt; &lt;amount&gt;</span> - Send money to account');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">search &lt;accNumber&gt;</span> - Search account record in fstream');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">history</span> - Display transaction history log');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">clear</span> - Clear terminal display');
        appendTerminalLine('&nbsp;&nbsp;<span class="term-cyan">exit</span> - Close terminal simulation');
        break;

      case 'balance':
        appendTerminalLine(`Account: #${bankState.accountNumber} [${bankState.ownerName}]`, 'info');
        appendTerminalLine(`Current Balance: <span class="term-green">$${bankState.balance.toFixed(2)}</span>`, 'success');
        break;

      case 'deposit':
        const depAmt = parseFloat(arg1);
        if (isNaN(depAmt) || depAmt <= 0) {
          appendTerminalLine('Error: Invalid deposit amount. Usage: deposit 250', 'term-line');
        } else {
          bankState.balance += depAmt;
          const logMsg = `Deposited +$${depAmt.toFixed(2)}`;
          bankState.history.push(logMsg);
          appendTerminalLine(`✓ Successfully deposited $${depAmt.toFixed(2)}.`, 'success');
          appendTerminalLine(`New balance: $${bankState.balance.toFixed(2)} [Persisted to accounts.dat]`, 'output');
        }
        break;

      case 'withdraw':
        const withAmt = parseFloat(arg1);
        if (isNaN(withAmt) || withAmt <= 0) {
          appendTerminalLine('Error: Invalid withdrawal amount. Usage: withdraw 100', 'term-line');
        } else if (withAmt > bankState.balance) {
          appendTerminalLine(`Transaction Rejected: Insufficient funds. Balance is $${bankState.balance.toFixed(2)}`, 'output');
        } else {
          bankState.balance -= withAmt;
          const logMsg = `Withdrawn -$${withAmt.toFixed(2)}`;
          bankState.history.push(logMsg);
          appendTerminalLine(`✓ Withdrew $${withAmt.toFixed(2)}.`, 'success');
          appendTerminalLine(`Remaining balance: $${bankState.balance.toFixed(2)} [Persisted to accounts.dat]`, 'output');
        }
        break;

      case 'transfer':
        const recipient = arg1;
        const transAmt = parseFloat(arg2);
        if (!recipient || isNaN(transAmt) || transAmt <= 0) {
          appendTerminalLine('Error: Invalid transfer arguments. Usage: transfer Alex 300', 'term-line');
        } else if (transAmt > bankState.balance) {
          appendTerminalLine(`Transfer Failed: Insufficient funds. Balance is $${bankState.balance.toFixed(2)}`, 'output');
        } else {
          bankState.balance -= transAmt;
          const logMsg = `Transferred -$${transAmt.toFixed(2)} to ${recipient}`;
          bankState.history.push(logMsg);
          appendTerminalLine(`✓ Successfully transferred $${transAmt.toFixed(2)} to ${recipient}.`, 'success');
          appendTerminalLine(`Updated balance: $${bankState.balance.toFixed(2)} [Logged to transactions.dat]`, 'output');
        }
        break;

      case 'search':
        const accTarget = arg1 || '1042';
        appendTerminalLine(`Searching persistent file records for account #${accTarget}...`, 'info');
        if (accTarget === '1042') {
          appendTerminalLine(`✓ Found Match: Account #1042 | Owner: Roshdy Mohamed | Status: Active`, 'success');
        } else {
          appendTerminalLine(`Account #${accTarget} indexed. Simulating lookup: Active record verified.`, 'output');
        }
        break;

      case 'history':
        appendTerminalLine(`--- TRANSACTION AUDIT LOG (#${bankState.accountNumber}) ---`, 'info');
        bankState.history.forEach((h, idx) => {
          appendTerminalLine(`[${idx + 1}] ${h}`, 'output');
        });
        break;

      case 'clear':
        modalTermOutput.innerHTML = '';
        appendTerminalLine('Terminal screen cleared.', 'info');
        break;

      case 'exit':
        closeTerminalModal();
        break;

      default:
        appendTerminalLine(`Command not recognized: '${action}'. Type <span class="term-cyan">help</span> for command list.`, 'output');
    }
  }

  function openTerminalModal() {
    if (!terminalModal) return;
    terminalModal.classList.add('open');
    terminalModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (modalTermInput) modalTermInput.focus();
    }, 150);
  }

  function closeTerminalModal() {
    if (!terminalModal) return;
    terminalModal.classList.remove('open');
    terminalModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openTerminalModalBtn) openTerminalModalBtn.addEventListener('click', openTerminalModal);
  if (terminalPillTrigger) terminalPillTrigger.addEventListener('click', openTerminalModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeTerminalModal);
  if (closeModalBottomBtn) closeModalBottomBtn.addEventListener('click', closeTerminalModal);

  if (modalTermForm) {
    modalTermForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!modalTermInput) return;
      handleBankCommand(modalTermInput.value);
      modalTermInput.value = '';
    });
  }

  // ==========================================================================
  // 9. ARCHITECTURE INSPECTOR MODAL
  // ==========================================================================
  const architectureModal = document.getElementById('architectureModal');
  const viewArchitectureBtn = document.getElementById('viewArchitectureBtn');
  const closeArchModalBtn = document.getElementById('closeArchModalBtn');
  const closeArchModalBottomBtn = document.getElementById('closeArchModalBottomBtn');

  function openArchModal() {
    if (!architectureModal) return;
    architectureModal.classList.add('open');
    architectureModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeArchModal() {
    if (!architectureModal) return;
    architectureModal.classList.remove('open');
    architectureModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (viewArchitectureBtn) viewArchitectureBtn.addEventListener('click', openArchModal);
  if (closeArchModalBtn) closeArchModalBtn.addEventListener('click', closeArchModal);
  if (closeArchModalBottomBtn) closeArchModalBottomBtn.addEventListener('click', closeArchModal);

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTerminalModal();
      closeArchModal();
    }
  });

  [terminalModal, architectureModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeTerminalModal();
          closeArchModal();
        }
      });
    }
  });

  // ==========================================================================
  // 10. CONTACT FORM SUBMISSION
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName')?.value || 'Friend';
      showToast(`Thank you, ${name}! Your message has been sent.`);
      contactForm.reset();
    });
  }
});
