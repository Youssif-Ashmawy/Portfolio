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
// Neural Network Animation
// ============================================
function initNeuralNetwork() {
    console.log('Initializing Neural Network...');
    const svg = document.getElementById('neuralNetwork');
    const connectionsGroup = document.getElementById('connections');
    const nodesGroup = document.getElementById('nodes');
    
    if (!svg) {
        console.error('Neural network SVG not found!');
        return;
    }
    
    console.log('Neural network elements found, starting step-by-step animation...');
    
    // Clear everything
    nodesGroup.innerHTML = '';
    connectionsGroup.innerHTML = '';
    
    // Neural network structure - expanded with more layers and wider spacing
    const networkLayers = [
        { nodeCount: 4, x: 50, type: 'input' },   // Layer 1: Input
        { nodeCount: 8, x: 150, type: 'hidden' }, // Layer 2: Hidden
        { nodeCount: 10, x: 250, type: 'hidden' }, // Layer 3: Hidden
        { nodeCount: 12, x: 350, type: 'hidden' }, // Layer 4: Hidden
        { nodeCount: 10, x: 450, type: 'hidden' }, // Layer 5: Hidden
        { nodeCount: 8, x: 550, type: 'hidden' }, // Layer 6: Hidden
        { nodeCount: 4, x: 650, type: 'output' } // Layer 7: Output
    ];
    
    let allNodes = [];
    
    // Step 1: Draw first layer (4 nodes)
    setTimeout(() => {
        console.log('Step 1: Drawing Layer 1 (4 nodes)');
        drawLayer(0, networkLayers, allNodes, nodesGroup, () => {
            // Step 2: Draw second layer (8 nodes)
            setTimeout(() => {
                console.log('Step 2: Drawing Layer 2 (8 nodes)');
                drawLayer(1, networkLayers, allNodes, nodesGroup, () => {
                    // Step 3: Add connections from layer 1 to layer 2
                    setTimeout(() => {
                        console.log('Step 3: Adding connections Layer 1 -> Layer 2');
                        addConnections(0, 1, allNodes, connectionsGroup, () => {
                            // Step 4: Draw third layer (10 nodes)
                            setTimeout(() => {
                                console.log('Step 4: Drawing Layer 3 (10 nodes)');
                                drawLayer(2, networkLayers, allNodes, nodesGroup, () => {
                                    // Step 5: Add connections from layer 2 to layer 3
                                    setTimeout(() => {
                                        console.log('Step 5: Adding connections Layer 2 -> Layer 3');
                                        addConnections(1, 2, allNodes, connectionsGroup, () => {
                                            // Step 6: Draw fourth layer (12 nodes)
                                            setTimeout(() => {
                                                console.log('Step 6: Drawing Layer 4 (12 nodes)');
                                                drawLayer(3, networkLayers, allNodes, nodesGroup, () => {
                                                    // Step 7: Add connections from layer 3 to layer 4
                                                    setTimeout(() => {
                                                        console.log('Step 7: Adding connections Layer 3 -> Layer 4');
                                                        addConnections(2, 3, allNodes, connectionsGroup, () => {
                                                            // Step 8: Draw fifth layer (10 nodes)
                                                            setTimeout(() => {
                                                                console.log('Step 8: Drawing Layer 5 (10 nodes)');
                                                                drawLayer(4, networkLayers, allNodes, nodesGroup, () => {
                                                                    // Step 9: Add connections from layer 4 to layer 5
                                                                    setTimeout(() => {
                                                                        console.log('Step 9: Adding connections Layer 4 -> Layer 5');
                                                                        addConnections(3, 4, allNodes, connectionsGroup, () => {
                                                                            // Step 10: Draw sixth layer (8 nodes)
                                                                            setTimeout(() => {
                                                                                console.log('Step 10: Drawing Layer 6 (8 nodes)');
                                                                                drawLayer(5, networkLayers, allNodes, nodesGroup, () => {
                                                                                    // Step 11: Add connections from layer 5 to layer 6
                                                                                    setTimeout(() => {
                                                                                        console.log('Step 11: Adding connections Layer 5 -> Layer 6');
                                                                                        addConnections(4, 5, allNodes, connectionsGroup, () => {
                                                                                            // Step 12: Draw seventh layer (4 nodes)
                                                                                            setTimeout(() => {
                                                                                                console.log('Step 12: Drawing Layer 7 (4 nodes)');
                                                                                                drawLayer(6, networkLayers, allNodes, nodesGroup, () => {
                                                                                                    // Step 13: Add connections from layer 6 to layer 7
                                                                                                    setTimeout(() => {
                                                                                                        console.log('Step 13: Adding connections Layer 6 -> Layer 7');
                                                                                                        addConnections(5, 6, allNodes, connectionsGroup, () => {
                                                                                                            // Step 14: Start data flow
                                                                                                            setTimeout(() => {
                                                                                                                console.log('Step 14: Starting data flow animation');
                                                                                                                startDataFlow();
                                                                                                            }, 500);
                                                                                                        });
                                                                                                    }, 500);
                                                                                                });
                                                                                            }, 500);
                                                                                        });
                                                                                    }, 500);
                                                                                });
                                                                            }, 500);
                                                                        });
                                                                    }, 500);
                                                                });
                                                            }, 500);
                                                        });
                                                    }, 500);
                                                });
                                            }, 500);
                                        });
                                    }, 500);
                                });
                            }, 500);
                        });
                    }, 500);
                });
            }, 500);
        });
    }, 500);
    
    function drawLayer(layerIndex, networkLayers, allNodes, nodesGroup, callback) {
        const layer = networkLayers[layerIndex];
        
        for (let nodeIndex = 0; nodeIndex < layer.nodeCount; nodeIndex++) {
            let y;
            if (layer.nodeCount === 1) {
                y = 200;
            } else {
                y = 50 + (nodeIndex * (300 / (layer.nodeCount - 1)));
            }
            
            const node = {
                id: `node-${layerIndex}-${nodeIndex}`,
                x: layer.x,
                y: y,
                layer: layerIndex,
                type: layer.type
            };
            allNodes.push(node);
            
            setTimeout(() => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('id', node.id);
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y);
                circle.setAttribute('r', '0');
                circle.setAttribute('class', `neural-node ${node.type}`);
                circle.style.opacity = '0';
                nodesGroup.appendChild(circle);
                
                // Simple animation with bigger nodes
                circle.style.transition = 'r 0.4s ease-out, opacity 0.4s ease-out';
                circle.setAttribute('r', '8');
                circle.style.opacity = '1';
                
                console.log(`✓ Node ${node.id} at (${node.x}, ${node.y})`);
                
                // Call callback when last node is drawn
                if (nodeIndex === layer.nodeCount - 1) {
                    setTimeout(callback, 400);
                }
            }, nodeIndex * 100);
        }
    }
    
    function addConnections(fromLayer, toLayer, allNodes, connectionsGroup, callback) {
        const sourceNodes = allNodes.filter(n => n.layer === fromLayer);
        const targetNodes = allNodes.filter(n => n.layer === toLayer);
        let connectionCount = 0;
        
        sourceNodes.forEach(sourceNode => {
            targetNodes.forEach(targetNode => {
                setTimeout(() => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', sourceNode.x);
                    line.setAttribute('y1', sourceNode.y);
                    line.setAttribute('x2', targetNode.x);
                    line.setAttribute('y2', targetNode.y);
                    line.setAttribute('class', 'neural-connection');
                    line.style.opacity = '0.4';
                    connectionsGroup.appendChild(line);
                    
                    connectionCount++;
                    console.log(`✓ Connection ${connectionCount}: ${sourceNode.id} -> ${targetNode.id}`);
                    
                    // Call callback when last connection is added
                    const totalConnections = sourceNodes.length * targetNodes.length;
                    if (connectionCount === totalConnections) {
                        setTimeout(callback, 200);
                    }
                }, connectionCount * 20);
            });
        });
    }
    
    function startDataFlow() {
        // Data flow animation removed - network stays static after building
        console.log('Data flow animation disabled');
    }
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
    initNeuralNetwork();
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
    
    function typeChar() {
        if (isTyping) {
            if (charIndex < originalText.length) {
                greeting.textContent += originalText.charAt(charIndex);
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
                greeting.textContent = originalText.substring(0, charIndex - 1);
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
