// Portfolio Website JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Navigation functionality
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Mobile menu toggle
  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  // Close mobile menu when clicking on links
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
    });
  });

  // Navbar scroll behavior
  let lastScrollTop = 0;
  window.addEventListener("scroll", function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add scrolled class for styling
    if (scrollTop > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    lastScrollTop = scrollTop;
  });

  // Active navigation link highlighting
  function updateActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => link.classList.remove("active"));
        if (navLink) {
          navLink.classList.add("active");
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink(); // Initial call

  // Particle animation in hero section
  function createParticles() {
    const particlesContainer = document.getElementById("particles");
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Random size between 2-6px
      const size = Math.random() * 4 + 2;
      particle.style.width = size + "px";
      particle.style.height = size + "px";

      // Random position
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";

      // Random animation delay
      particle.style.animationDelay = Math.random() * 6 + "s";

      // Random animation duration
      particle.style.animationDuration = Math.random() * 3 + 3 + "s";

      particlesContainer.appendChild(particle);
    }
  }

  createParticles();

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";

        // Special handling for skill bars
        if (entry.target.classList.contains("skills-list")) {
          animateSkillBars();
        }
      }
    });
  }, observerOptions);

  // Elements to animate on scroll
  const animatedElements = document.querySelectorAll(
    ".section-title, .about-text, .about-stats, .timeline-item, .project-card, .skills-list, .activity-card, .contact-content"
  );

  animatedElements.forEach((el) => {
    // Set initial state
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    observer.observe(el);
  });

  // Skill bars animation
  function animateSkillBars() {
    const skillBars = document.querySelectorAll(".skill-progress");

    skillBars.forEach((bar, index) => {
      const level = bar.getAttribute("data-level");
      setTimeout(() => {
        bar.style.width = level + "%";
      }, index * 100);
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 70; // Account for navbar height
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  // Contact form handling
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    const statusEl = document.getElementById("formStatus");
    const APPS_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbzZyMt0RMttKx05YQTyDFshYWBBUA9lAukex-IKg-ccjnaQieQjWUNciwgIecXUAe7N/exec"; // Google Apps Script endpoint

    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get("name");
      const email = formData.get("email");
      const subject = formData.get("subject");
      const message = formData.get("message");

      if (!name || !email || !subject || !message) {
        showNotification("Please fill in all fields.", "error");
        updateStatus("Please fill in all fields.", "error");
        return;
      }
      if (!isValidEmail(email)) {
        showNotification("Please enter a valid email address.", "error");
        updateStatus("Invalid email address.", "error");
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      updateStatus("Sending your message...", "info");

      try {
        const payload = {
          name,
          email,
          subject,
          message,
          timestamp: new Date().toISOString(),
        };

        const response = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", // Apps Script web app can respond but we ignore body to avoid CORS issues
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        showNotification(
          "Thank you for your message! I'll get back to you soon.",
          "success"
        );
        updateStatus("Message sent successfully ✅", "success");
        contactForm.reset();
      } catch (err) {
        console.error("Form submission error:", err);
        showNotification(
          "There was an error sending your message. Please try again later.",
          "error"
        );
        updateStatus("Error sending message. Try again.", "error");
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });

    function updateStatus(msg, type) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.style.color =
        type === "success"
          ? "var(--color-success)"
          : type === "error"
          ? "var(--color-error)"
          : "var(--color-text-secondary)";
    }
  }

  // Email validation helper
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Notification system
  function showNotification(message, type = "info") {
    // Remove existing notification
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--color-surface);
            color: var(--color-text);
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            border-left: 4px solid var(--color-${
              type === "success"
                ? "success"
                : type === "error"
                ? "error"
                : "info"
            });
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 350px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 10);

    // Close button
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: 0;
            margin-left: auto;
        `;

    closeBtn.addEventListener("click", () => {
      removeNotification(notification);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification);
    }, 5000);
  }

  function removeNotification(notification) {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Typing animation for hero tagline
  function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = "";

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  // Initialize typing animation after page load
  setTimeout(() => {
    const taglineElement = document.querySelector(".hero-tagline");
    if (taglineElement) {
      const taglineText = taglineElement.textContent;
      typeWriter(taglineElement, taglineText, 50);
    }
  }, 1000);

  // Parallax effect for hero section
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector(".hero-background");
    if (heroBackground) {
      heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });

  // Project cards hover effect enhancement
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Timeline items stagger animation
  const timelineItems = document.querySelectorAll(".timeline-item");
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateX(0)";
          }, index * 200);
        }
      });
    },
    { threshold: 0.2 }
  );

  timelineItems.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform =
      index % 2 === 0 ? "translateX(-50px)" : "translateX(50px)";
    item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    timelineObserver.observe(item);
  });

  // Add loading states and micro-interactions
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Ripple effect
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add ripple animation keyframes
  const style = document.createElement("style");
  style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .particle {
            pointer-events: none;
        }
        
        .notification {
            font-family: var(--font-family-base);
        }
    `;
  document.head.appendChild(style);

  // Performance optimization: Debounce scroll events
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Apply debouncing to scroll-heavy functions
  const debouncedScrollHandler = debounce(() => {
    updateActiveLink();
  }, 10);

  window.addEventListener("scroll", debouncedScrollHandler);

  // Add subtle animations to stat cards
  const statCards = document.querySelectorAll(".stat-card");
  statCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  console.log("Portfolio website initialized successfully! 🚀");
});
