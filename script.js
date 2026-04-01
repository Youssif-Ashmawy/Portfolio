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
// Enhanced Background Interactions
// ============================================

// Create floating particles
function createParticles() {
    const particleField = document.getElementById('particleField');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particleField.appendChild(particle);
    }
}

// Mouse glow effect
function initMouseGlow() {
    const mouseGlow = document.getElementById('mouseGlow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateGlow() {
        // Smooth following effect
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        
        mouseGlow.style.left = glowX + 'px';
        mouseGlow.style.top = glowY + 'px';
        mouseGlow.style.opacity = '1';
        
        requestAnimationFrame(animateGlow);
    }
    
    animateGlow();
    
    // Hide glow when mouse leaves window
    document.addEventListener('mouseleave', () => {
        mouseGlow.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        mouseGlow.style.opacity = '1';
    });
}

// Enhanced blob parallax with mouse interaction
function initEnhancedBlobParallax() {
    const blobs = document.querySelectorAll('.blob');
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    });
    
    function animateBlobs() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;
        
        blobs.forEach((blob, index) => {
            const speed = 0.5 + (index * 0.3);
            const xOffset = currentX * speed * 50;
            const yOffset = currentY * speed * 50;
            
            blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
        
        requestAnimationFrame(animateBlobs);
    }
    
    animateBlobs();
}

// Dynamic gradient orb positioning
function initGradientOrb() {
    const orb = document.querySelector('.gradient-orb');
    let scrollY = 0;
    let targetY = 0;
    
    window.addEventListener('scroll', () => {
        targetY = window.scrollY * 0.3;
    });
    
    function animateOrb() {
        scrollY += (targetY - scrollY) * 0.1;
        orb.style.transform = `translateY(${scrollY}px)`;
        requestAnimationFrame(animateOrb);
    }
    
    animateOrb();
}

// Initialize all enhanced background features
function initEnhancedBackground() {
    createParticles();
    initMouseGlow();
    initEnhancedBlobParallax();
    initGradientOrb();
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
    initEnhancedBackground();
    // initNeuralNetwork(); // Neural network removed
});

// ============================================
// Navigation Functions
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
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
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
// Scroll Reveal Animations - Repeat on every entry
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
                // Force animation restart by removing and re-adding the class
                entry.target.classList.remove('visible');
                // Small delay to ensure the class removal is processed
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 10);
            } else {
                // Remove visible class when element leaves viewport
                entry.target.classList.remove('visible');
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
// Continuous Typing Animation for Hero Greeting
// ============================================
function initTypingAnimation() {
    const greeting = document.querySelector('.hero-greeting');
    const originalText = greeting.textContent;
    greeting.textContent = '';
    
    let charIndex = 0;
    let isTyping = true;
    
    // Create a span wrapper to prevent layout shifts
    const typingContainer = document.createElement('span');
    typingContainer.style.display = 'inline-block';
    typingContainer.style.height = '1.5em';
    typingContainer.style.lineHeight = '1.5';
    typingContainer.style.overflow = 'hidden';
    typingContainer.style.verticalAlign = 'bottom';
    
    // Clear greeting and add the container
    greeting.innerHTML = '';
    greeting.appendChild(typingContainer);
    
    function typeChar() {
        if (isTyping) {
            if (charIndex < originalText.length) {
                typingContainer.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, 50);
            } else {
                // Finished typing, wait before deleting
                isTyping = false;
                setTimeout(deleteChar, 2000); // Wait 2 seconds before deleting
            }
        }
    }
    
    function deleteChar() {
        if (!isTyping) {
            if (charIndex > 0) {
                typingContainer.textContent = originalText.substring(0, charIndex - 1);
                charIndex--;
                setTimeout(deleteChar, 30); // Faster deletion
            } else {
                // Finished deleting, start typing again
                isTyping = true;
                setTimeout(typeChar, 500); // Wait 0.5 seconds before typing again
            }
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
// Timeline Animation on Scroll - Repeat on every entry
// ============================================
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Force animation restart
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateX(-30px)';
                
                // Small delay to ensure the reset is processed
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, 100);
            } else {
                // Reset animation when element leaves viewport
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateX(-30px)';
            }
        });
    }, { threshold: 0.2 });
    
    // Set initial state and start observing
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
// Chat Interface Functionality
// ============================================

class ChatInterface {
    constructor() {
        this.chatContainer = document.getElementById('chatContainer');
        this.chatBody = document.getElementById('chatBody');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatSend = document.getElementById('chatSend');
        this.chatToggleIcon = document.getElementById('chatToggleIcon');
        this.chatClose = document.getElementById('chatClose');
        this.chatNotification = document.getElementById('chatNotification');
        this.chatStatus = document.getElementById('chatStatus');
        this.statusText = document.getElementById('statusText');
        this.resizeHandle = document.getElementById('resizeHandle');
        
        // Determine API URL based on current environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // When running locally, use port 8000 for API
            this.apiUrl = window.location.protocol + '//' + window.location.hostname + ':8000';
        } else {
            // In production, the CI/CD pipeline replaces __BACKEND_URL__ with
            // the real Render backend URL via the BACKEND_URL GitHub secret.
            this.apiUrl = '__BACKEND_URL__';
        }
        
        this.isTyping = false;
        this.isOpen = false;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        if (!this.chatContainer) return;
        
        // Event listeners
        this.chatSend.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Toggle icon click
        this.chatToggleIcon.addEventListener('click', () => this.toggleChat());
        
        // Close button
        this.chatClose.addEventListener('click', () => this.closeChat());
        
        // Drag functionality
        this.initDragFunctionality();
        
        // Resize functionality
        this.initResizeFunctionality();
        
        // Check server status on load
        this.checkServerStatus();
        
        // Auto-resize input
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 100) + 'px';
        });
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.chatContainer.style.display = 'flex';
        this.isOpen = true;
        
        // Hide notification dot
        this.chatNotification.classList.remove('show');
        
        // Focus input when opening
        setTimeout(() => {
            this.chatInput.focus();
        }, 300);
    }
    
    closeChat() {
        this.chatContainer.style.display = 'none';
        this.isOpen = false;
    }
    
    initDragFunctionality() {
        const chatHeader = this.chatContainer.querySelector('.chat-header');
        
        chatHeader.addEventListener('mousedown', (e) => {
            if (e.target.closest('.chat-controls') || e.target === this.resizeHandle) return;
            
            this.isDragging = true;
            const rect = this.chatContainer.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            
            document.addEventListener('mousemove', this.handleDrag);
            document.addEventListener('mouseup', this.stopDrag);
            
            e.preventDefault();
        });
    }
    
    handleDrag = (e) => {
        if (!this.isDragging) return;
        
        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;
        
        // Boundary constraints
        const maxX = window.innerWidth - this.chatContainer.offsetWidth;
        const maxY = window.innerHeight - this.chatContainer.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        this.chatContainer.style.right = 'auto';
        this.chatContainer.style.top = constrainedY + 'px';
        this.chatContainer.style.left = constrainedX + 'px';
    };
    
    stopDrag = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    };
    
    initResizeFunctionality() {
        this.resizeHandle.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = this.chatContainer.offsetWidth;
            const startHeight = this.chatContainer.offsetHeight;
            
            const handleResize = (e) => {
                if (!this.isResizing) return;
                
                const newWidth = startWidth + (e.clientX - startX);
                const newHeight = startHeight + (e.clientY - startY);
                
                // Apply constraints
                const constrainedWidth = Math.max(300, Math.min(newWidth, 600));
                const constrainedHeight = Math.max(400, Math.min(newHeight, 800));
                
                this.chatContainer.style.width = constrainedWidth + 'px';
                this.chatContainer.style.height = constrainedHeight + 'px';
            };
            
            const stopResize = () => {
                this.isResizing = false;
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
            };
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
            
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            if (response.ok) {
                const data = await response.json();
                this.updateStatus('Ready', 'normal');
                if (!data.ollama_available) {
                    this.updateStatus('Ollama not available - using fallback responses', 'warning');
                }
            } else {
                this.updateStatus('Server unavailable', 'error');
            }
        } catch (error) {
            this.updateStatus('Cannot connect to server', 'error');
        }
    }
    
    updateStatus(text, type = 'normal') {
        this.statusText.textContent = text;
        this.chatStatus.className = 'chat-status';
        
        if (type === 'typing') {
            this.chatStatus.classList.add('typing');
        } else if (type === 'error') {
            this.chatStatus.classList.add('error');
        }
    }
    
    addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        if (isUser) {
            messageContent.textContent = content;
        } else {
            messageContent.innerHTML = content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, true);
        
        // Clear input
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        
        // Show typing status
        this.isTyping = true;
        this.updateStatus('Thinking...', 'typing');
        this.chatSend.disabled = true;
        this.chatInput.disabled = true;
        
        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    model: 'llama3.2'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Add bot response
            this.addMessage(data.response);
            
            // Update status
            this.updateStatus('Ready', 'normal');
            
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Add error message
            this.addMessage('Sorry, I encountered an error. Please make sure the server is running on localhost:8000.');
            
            // Update status
            this.updateStatus('Error - Check server connection', 'error');
        } finally {
            this.isTyping = false;
            this.chatSend.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }
}

function initChatInterface() {
    new ChatInterface();
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
    initEnhancedBackground();
    initParallaxEffect();
    initTypingAnimation();
    initProjectCardEffects();
    initTimelineAnimation();
    initFormValidation();
    
    // Chat interface
    initChatInterface();
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
