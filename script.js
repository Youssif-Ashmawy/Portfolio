// ============================================
// Image Modal Functionality
// ============================================
function openModal(imageSrc, imageAlt) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    console.log('Opening modal with:', imageSrc);
    modal.style.display = 'block';
    modalImg.src = imageSrc;
    modalImg.alt = imageAlt;
    document.body.style.overflow = 'hidden';
}

function initImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalClose = document.getElementById('modalClose');
    const projectImages = document.querySelectorAll('.project-image');

    console.log('Modal elements:', modal, modalImg, modalClose);
    console.log('Project images found:', projectImages.length);

    // Add click event to magnifying glass icons
    projectImages.forEach((container, index) => {
        const img = container.querySelector('img');
        if (!img) return;

        console.log(`Adding click listener to magnifying glass ${index}:`, img.src);
        
        // Add click event to the magnifying glass (::after pseudo-element can't be clicked directly, so we click the container)
        container.addEventListener('click', function(e) {
            // Check if click is in the top-right corner where magnifying glass appears
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const isMagnifyingGlassArea = x > rect.width - 40 && y < 40;
            
            if (isMagnifyingGlassArea) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Magnifying glass clicked!', img.src);
                modal.style.display = 'block';
                modalImg.src = img.src;
                modalImg.alt = img.alt;
                document.body.style.overflow = 'hidden';
            }
        });

        // Prevent image clicks from doing anything
        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Image click prevented');
        });

        // Set cursor styles
        container.style.cursor = 'default';
        img.style.cursor = 'default';
    });

    // Close modal when clicking X
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            console.log('Close X clicked');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }

    // Close modal when clicking outside image
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Modal backdrop clicked');
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore scrolling
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            console.log('Escape key pressed');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
}

// ============================================
// Portfolio Website - Interactive Features
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initNavigation();
    initScrollAnimations();
    initNavbarScroll();
    initSmoothScrolling();
    initImageModal();
});

// ============================================
// Navigation - Mobile Menu Toggle
// ============================================
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navLinksItems = navLinks.querySelectorAll('a');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu when clicking on a link
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });
}

// ============================================
// Navbar - Change on Scroll
// ============================================
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class for styling changes
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    });
}

// ============================================
// Smooth Scrolling for Navigation Links
// ============================================
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Scroll Reveal Animations
// ============================================
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    // Create intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Optional: Stop observing once element is visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Start observing all reveal elements
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// Parallax Effect for Background Blobs
// ============================================
function initParallaxEffect() {
    const blobs = document.querySelectorAll('.blob');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        blobs.forEach((blob, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = -(scrolled * speed);
            
            blob.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ============================================
// Typing Animation for Hero Greeting
// ============================================
function initTypingAnimation() {
    const greeting = document.querySelector('.hero-greeting');
    const originalText = greeting.textContent;
    greeting.textContent = '';
    
    let charIndex = 0;
    
    function typeChar() {
        if (charIndex < originalText.length) {
            greeting.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeChar, 50);
        }
    }
    
    // Start typing animation after page load
    setTimeout(typeChar, 500);
}

// ============================================
// Project Card Hover Effects
// ============================================
function initProjectCardEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add any additional hover effects here
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset any additional hover effects here
        });
    });
}

// ============================================
// Timeline Animation on Scroll
// ============================================
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 200);
            }
        });
    }, { threshold: 0.2 });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        timelineObserver.observe(item);
    });
}

// ============================================
// Form Validation (if contact form is added)
// ============================================
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation logic here
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            console.log('Form submitted:', data);
            // Add your form submission logic here
        });
    });
}

// ============================================
// Performance Optimization - Debounce Function
// ============================================
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

// ============================================
// Initialize all features with performance considerations
// ============================================
function initializeApp() {
    // Core features
    initNavigation();
    initScrollAnimations();
    initNavbarScroll();
    initSmoothScrolling();
    
    // Enhanced features (optional)
    if (window.innerWidth > 768) {
        initParallaxEffect();
        initTypingAnimation();
    }
    
    initProjectCardEffects();
    initTimelineAnimation();
    initFormValidation();
    
    // Performance optimization for scroll events
    const optimizedScroll = debounce(function() {
        // Any scroll-based calculations that need debouncing
    }, 16); // ~60fps
    
    window.addEventListener('scroll', optimizedScroll);
}

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', function(e) {
    console.error('Portfolio website error:', e.error);
});

// ============================================
// Initialize when DOM is ready
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ============================================
// Export functions for potential external use
// ============================================
window.PortfolioApp = {
    initNavigation,
    initScrollAnimations,
    initNavbarScroll,
    initSmoothScrolling,
    initParallaxEffect,
    initTypingAnimation,
    initProjectCardEffects,
    initTimelineAnimation,
    initFormValidation
};
