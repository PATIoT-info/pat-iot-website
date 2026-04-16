// Mobile Navigation Toggle
(function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    if (navLinks.length > 0 && navMenu && hamburger) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
})();

// Navbar scroll effect - hide on scroll down, show on scroll up
(function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    let scrollRafPending = false;

    function showNavbar() {
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
    }

    function hideNavbar() {
        navbar.classList.add('navbar-hidden');
        navbar.classList.remove('navbar-visible');
    }

    window.addEventListener('scroll', () => {
        if (scrollRafPending) return;
        scrollRafPending = true;
        requestAnimationFrame(() => {
            if (!navbar) {
                scrollRafPending = false;
                return;
            }
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');

            // Show navbar when scrolling up or near top; hide only when scrolling down past 100px
            const scrollingDownPast100 = currentScroll > lastScroll && currentScroll > 100;
            if (scrollingDownPast100) {
                hideNavbar();
            } else {
                showNavbar();
            }
            lastScroll = currentScroll;
            scrollRafPending = false;
        });
    }, { passive: true });

    // Extra safety: if scrolling is intercepted (e.g., video scrubbing), still show navbar on upward gesture.
    window.addEventListener('wheel', (e) => {
        if (e.deltaY < 0) showNavbar();
    }, { passive: true });

    // Ensure navbar is visible on first paint.
    requestAnimationFrame(showNavbar);

    let touchStartY = null;
    window.addEventListener('touchstart', (e) => {
        if (!e.touches || !e.touches[0]) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (touchStartY == null || !e.touches || !e.touches[0]) return;
        const currentY = e.touches[0].clientY;
        // Finger moving down usually means user is trying to scroll up.
        if (currentY - touchStartY > 6) showNavbar();
    }, { passive: true });

    // Keyboard "scroll up" intent (desktop/laptops)
    window.addEventListener('keydown', (e) => {
        const keys = ['ArrowUp', 'PageUp', 'Home'];
        if (keys.includes(e.key)) showNavbar();
    }, { passive: true });
})();

// Smooth scrolling for anchor links – go directly to section; hero video must not interfere
window.__navLinkScrollActive = false;
window.__userJumpedPastVideo = false; // set when nav target is below video section
document.addEventListener('DOMContentLoaded', () => {
    try {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (!anchor) return;
            anchor.addEventListener('click', function (e) {
                try {
                    const href = this.getAttribute('href');
                    if (!href || href === '#') return;
                    const target = document.querySelector(href);
                    if (!target) return;
                    e.preventDefault();
                    window.__navLinkScrollActive = true;
                    const videoSection = document.querySelector('.hero-video-section');
                    if (videoSection && target.offsetTop > videoSection.offsetTop) {
                        window.__userJumpedPastVideo = true;
                    }
                    const offsetTop = Math.max(0, target.offsetTop - 80);
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    setTimeout(() => { window.__navLinkScrollActive = false; }, 2500);
                } catch (err) {
                    console.warn('Anchor link error:', err);
                }
            });
        });
    } catch (e) {
        console.warn('Anchor link initialization failed:', e);
    }
});

// Load and render products from JSON
async function loadProducts() {
    const productsWrapper = document.getElementById('productsScrollWrapper');
    const galleryWrapper = document.getElementById('galleryScrollWrapper');
    
    if (!productsWrapper && !galleryWrapper) return;
    
    try {
        const response = await fetch('data/products.json?v=' + Date.now());
        if (!response.ok) {
            console.warn('products.json not found, using fallback');
            return;
        }
        const data = await response.json();
        
        // Render products
        if (productsWrapper && data.products) {
            const sortedProducts = [...data.products].sort((a, b) => (a.order || 0) - (b.order || 0));
            productsWrapper.innerHTML = sortedProducts.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${encodeURI(product.image)}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236b7280%22 font-family=%22Arial%22 font-size=%2214%22%3E${product.name}%3C/text%3E%3C/svg%3E';">
                    </div>
                    <div class="product-label">${product.name}</div>
                    <p class="product-caption">${product.caption}</p>
                </div>
            `).join('');
        }
        
        // Render gallery
        if (galleryWrapper && data.gallery) {
            const sortedGallery = [...data.gallery].sort((a, b) => (a.order || 0) - (b.order || 0));
            galleryWrapper.innerHTML = sortedGallery.map(item => `
                <div class="gallery-item animate">
                    <img src="${encodeURI(item.image)}" alt="${item.alt}" class="gallery-image">
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Error loading products:', e);
    }
}

// Horizontal scroll for products section
function initProductsScroll() {
    const scrollWrapper = document.querySelector('.products-scroll-wrapper');
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    
    if (!scrollWrapper || !scrollLeftBtn || !scrollRightBtn) return;
    
    const scrollAmount = 350; // Scroll by card width + gap
    
    // Update button states
    function updateButtons() {
        const { scrollLeft, scrollWidth, clientWidth } = scrollWrapper;
        scrollLeftBtn.disabled = scrollLeft === 0;
        scrollRightBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 10;
    }
    
    // Scroll left
    scrollLeftBtn.addEventListener('click', () => {
        scrollWrapper.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Scroll right
    scrollRightBtn.addEventListener('click', () => {
        scrollWrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Update buttons on scroll
    scrollWrapper.addEventListener('scroll', updateButtons);
    
    // Initial button state
    updateButtons();
    
    // Update on resize
    window.addEventListener('resize', updateButtons);
}

// Gallery Scroll Functionality
function initGalleryScroll() {
    const galleryWrapper = document.getElementById('galleryScrollWrapper');
    const galleryLeftBtn = document.querySelector('.gallery-scroll-left');
    const galleryRightBtn = document.querySelector('.gallery-scroll-right');
    
    if (!galleryWrapper || !galleryLeftBtn || !galleryRightBtn) return;
    
    const scrollAmount = 420; // Scroll by gallery item width + gap (400px + 20px)
    
    // Update button states
    function updateGalleryButtons() {
        const { scrollLeft, scrollWidth, clientWidth } = galleryWrapper;
        galleryLeftBtn.disabled = scrollLeft === 0;
        galleryRightBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 10;
    }
    
    // Scroll left
    galleryLeftBtn.addEventListener('click', () => {
        galleryWrapper.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Scroll right
    galleryRightBtn.addEventListener('click', () => {
        galleryWrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Update buttons on scroll
    galleryWrapper.addEventListener('scroll', updateGalleryButtons);
    
    // Initial button state
    updateGalleryButtons();
    
    // Update on resize
    window.addEventListener('resize', updateGalleryButtons);
}

// Lightbox Functionality (disabled - gallery images are not clickable)
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    if (!lightbox || !lightboxImage) return;
    
    let currentImageIndex = 0;
    let imageSources = [];
    let galleryImages = [];
    
    // Collect all image sources - refresh the gallery images list
    function refreshImageSources() {
        galleryImages = Array.from(document.querySelectorAll('.gallery-image'));
        imageSources = [];

        galleryImages.forEach((img) => {
            const src = img.src || img.getAttribute('src');
            if (src && src.trim() && !src.includes('data:image') && src !== '' && src !== window.location.href) {
                imageSources.push(src);
            }
        });
        
        updateNavButtons();
    }
    
    // Open lightbox
    function openLightbox(index) {
        // Refresh sources before opening
        refreshImageSources();
        
        if (imageSources.length === 0) return;
        if (index < 0 || index >= imageSources.length) return;

        currentImageIndex = index;
        const imageSrc = imageSources[currentImageIndex];

        if (!imageSrc || imageSrc.trim() === '') return;
        
        // Show lightbox FIRST (before setting image src)
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Ensure content is visible
        const content = document.querySelector('.lightbox-content');
        if (content) {
            content.style.display = 'flex';
            content.style.visibility = 'visible';
            content.style.opacity = '1';
        }
        
        // Ensure lightbox image is visible and reset styles
        lightboxImage.style.display = 'block';
        lightboxImage.style.visibility = 'visible';
        lightboxImage.style.opacity = '0.3'; // Start with low opacity for loading state
        lightboxImage.style.width = 'auto';
        lightboxImage.style.height = 'auto';
        lightboxImage.style.maxWidth = '100%';
        lightboxImage.style.maxHeight = '90vh';
        
        // Clear previous error handlers
        lightboxImage.onload = null;
        lightboxImage.onerror = null;
        
        // Set image source with error handling
        lightboxImage.onload = () => {
            lightboxImage.style.opacity = '1';
            const existingError = content ? content.querySelector('.lightbox-error') : null;
            if (existingError) existingError.remove();
        };

        lightboxImage.onerror = () => {
            lightboxImage.style.opacity = '1';
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText =
                'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
                'color: white; text-align: center; padding: 2rem; ' +
                'background: rgba(0,0,0,0.7); border-radius: 0.5rem; z-index: 10003;';
            errorMsg.innerHTML =
                '<i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>' +
                '<p style="margin: 0; font-size: 1.1rem;">Image not found</p>';
            errorMsg.className = 'lightbox-error';
            const existingError = content ? content.querySelector('.lightbox-error') : null;
            if (existingError) existingError.remove();
            if (content) content.appendChild(errorMsg);
        };
        
        lightboxImage.src = imageSrc;

        // If cached, trigger onload manually
        setTimeout(() => {
            if (lightboxImage.complete && lightboxImage.naturalWidth > 0 && lightboxImage.onload) {
                lightboxImage.onload();
            }
        }, 50);

        updateCounter();
        updateNavButtons();
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Show previous image
    function showPrev() {
        refreshImageSources();
        if (imageSources.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + imageSources.length) % imageSources.length;
        lightboxImage.style.opacity = '0.5';
        lightboxImage.src = imageSources[currentImageIndex];
        lightboxImage.onload = () => { lightboxImage.style.opacity = '1'; };
        lightboxImage.onerror = () => { 
            console.error('Lightbox: Failed to load previous image:', imageSources[currentImageIndex]);
            lightboxImage.style.opacity = '1';
            // Show error message (same as in openLightbox)
            const content = document.querySelector('.lightbox-content');
            if (content) {
                const existingError = content.querySelector('.lightbox-error');
                if (existingError) existingError.remove();
                
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 
                    'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
                    'color: white; text-align: center; padding: 2rem; ' +
                    'background: rgba(0, 0, 0, 0.7); border-radius: 0.5rem; z-index: 10003;';
                errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i><p>Image not found</p>';
                errorMsg.className = 'lightbox-error';
                content.appendChild(errorMsg);
            }
        };
        updateCounter();
        updateNavButtons();
    }
    
    // Show next image
    function showNext() {
        refreshImageSources();
        if (imageSources.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % imageSources.length;
        lightboxImage.style.opacity = '0.5';
        lightboxImage.src = imageSources[currentImageIndex];
        lightboxImage.onload = () => { lightboxImage.style.opacity = '1'; };
        lightboxImage.onerror = () => { 
            console.error('Lightbox: Failed to load next image:', imageSources[currentImageIndex]);
            lightboxImage.style.opacity = '1';
            // Show error message (same as in openLightbox)
            const content = document.querySelector('.lightbox-content');
            if (content) {
                const existingError = content.querySelector('.lightbox-error');
                if (existingError) existingError.remove();
                
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 
                    'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
                    'color: white; text-align: center; padding: 2rem; ' +
                    'background: rgba(0, 0, 0, 0.7); border-radius: 0.5rem; z-index: 10003;';
                errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i><p>Image not found</p>';
                errorMsg.className = 'lightbox-error';
                content.appendChild(errorMsg);
            }
        };
        updateCounter();
        updateNavButtons();
    }
    
    // Update counter
    function updateCounter() {
        if (lightboxCounter && imageSources.length > 0) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${imageSources.length}`;
        }
    }
    
    // Update navigation buttons
    function updateNavButtons() {
        if (lightboxPrev && lightboxNext) {
            lightboxPrev.disabled = imageSources.length <= 1;
            lightboxNext.disabled = imageSources.length <= 1;
        }
    }
    
    // Click handlers removed - gallery images are no longer clickable
    function attachClickHandlers() {
        // Get fresh references to gallery images
        const currentImages = Array.from(document.querySelectorAll('.gallery-image'));
        
        // Remove pointer cursor and make images non-clickable
        currentImages.forEach((img) => {
            img.style.cursor = 'default';
            img.style.pointerEvents = 'none';
            // Remove any existing click handlers by cloning
            if (img.dataset.lightboxAttached === 'true') {
                const newImg = img.cloneNode(true);
                img.parentNode.replaceChild(newImg, img);
            }
        });
        
        galleryImages = currentImages;
    }
    
    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Previous button
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrev);
    }
    
    // Next button
    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNext);
    }
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrev();
        } else if (e.key === 'ArrowRight') {
            showNext();
        }
    });
    
    // Initial setup - disable click handlers
    attachClickHandlers();
    
    // Refresh when images load to ensure they're not clickable
    document.addEventListener('load', (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('gallery-image')) {
            attachClickHandlers();
        }
    }, true);
    
    // Also refresh after delays to ensure images are not clickable
    setTimeout(() => {
        attachClickHandlers();
    }, 500);
    
    setTimeout(() => {
        attachClickHandlers();
    }, 1500);
    
    // Return public API (lightbox functionality disabled)
    return {
        refresh: () => {
            attachClickHandlers();
        },
        getImageCount: () => imageSources.length
    };
}

// Initialize products scroll on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadProducts().then(() => {
            initProductsScroll();
            initGalleryScroll();
            // Lightbox disabled - gallery images are not clickable
            // initLightbox();
        });
    } catch (e) {
        console.warn('Feature initialization failed:', e);
    }
});

// Scroll animations
document.addEventListener('DOMContentLoaded', () => {
    try {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.service-card, .solution-card, .info-item, .stat-item');
        
        animateElements.forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            }
        });
    } catch (e) {
        console.warn('Scroll animation initialization failed:', e);
    }
});

// Contact form handling – opens email to marketing@patiot.in with form data
const CONTACT_EMAIL = 'marketing@patiot.in';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('name') || {}).value || '';
        const email = (document.getElementById('email') || {}).value || '';
        const phone = (document.getElementById('phone') || {}).value || '';
        const message = (document.getElementById('message') || {}).value || '';
        const subject = 'Get in touch – ' + (name || 'Website enquiry');
        const body = 'Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\nMessage:\n' + message;
        const mailto = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        window.location.href = mailto;
        alert('Your email client will open to send this message to ' + CONTACT_EMAIL + '. If it doesn\'t open, email us at ' + CONTACT_EMAIL);
        contactForm.reset();
    });
}

// Newsletter form handling – opens email to marketing@patiot.in
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value || '';
        if (email) {
            const subject = 'Newsletter subscription';
            const body = 'New newsletter sign-up: ' + email;
            const mailto = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            window.location.href = mailto;
            alert('Your email client will open to send this to ' + CONTACT_EMAIL + '. If it doesn\'t open, email us at ' + CONTACT_EMAIL);
            form.reset();
        }
    });
});

// Active navigation link highlighting
document.addEventListener('DOMContentLoaded', () => {
    try {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (sections.length === 0) return;
        
        window.addEventListener('scroll', () => {
            try {
                const scrollY = window.pageYOffset;
                
                sections.forEach(section => {
                    if (!section) return;
                    const sectionHeight = section.offsetHeight;
                    const sectionTop = section.offsetTop - 100;
                    const sectionId = section.getAttribute('id');
                    if (!sectionId) return;
                    
                    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                    
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        navLinks.forEach(link => {
                            if (link) link.classList.remove('active');
                        });
                        if (navLink) {
                            navLink.classList.add('active');
                        }
                    }
                });
            } catch (e) {
                console.warn('Navigation highlighting error:', e);
            }
        }, { passive: true });
    } catch (e) {
        console.warn('Navigation highlighting initialization failed:', e);
    }
});

// Add active class styling
(function() {
    try {
        const style = document.createElement('style');
        style.textContent = `
            .nav-link.active {
                color: var(--primary-color);
            }
            .nav-link.active::after {
                width: 100%;
            }
        `;
        if (document.head) {
            document.head.appendChild(style);
        }
    } catch (e) {
        console.warn('Style injection failed:', e);
    }
})();

// Optimized scroll handler - removed heavy parallax to reduce lag
let ticking = false;

function updateOnScroll() {
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
}, { passive: true });

// Lazy loading for images (if you add images later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Initialize hero video visibility
function initVideos() {
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
        heroVideo.style.opacity = '1';
        heroVideo.style.display = 'block';
        heroVideo.muted = true;
        heroVideo.playsInline = true;
    }
}

// Video scroll transitions
function handleVideoTransitions() {
    const sections = document.querySelectorAll('.section-with-video');
    
    sections.forEach(section => {
        const video = section.querySelector('.section-video');
        if (!video || video.style.display === 'none') return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Video enters viewport
                    video.classList.add('fade-in');
                    video.classList.remove('fade-out');
                    video.play().catch(() => {});
                } else {
                    // Video leaves viewport
                    video.classList.add('fade-out');
                    video.classList.remove('fade-in');
                    video.pause();
                }
            });
        }, {
            threshold: 0.3
        });
        
        observer.observe(section);
    });
}



// New simplified step-based hero behavior using THREE separate video files.
// Expected files (place in /videos):
//   videos/hero-video-1.mp4  – curtains
//   videos/hero-video-2.mp4  – lights on
//   videos/hero-video-3.mp4  – TV on
function initHeroVideoSteps() {
    const videoSection = document.querySelector('.hero-video-section');
    const nextSection = document.querySelector('#products');
    const heroScrubArrow = document.getElementById('heroScrubArrow');

    const heroVideos = [
        document.getElementById('heroVideo1'),
        document.getElementById('heroVideo2'),
        document.getElementById('heroVideo3')
    ];

    if (!videoSection || !nextSection || heroVideos.some(v => !v)) return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const clipDurations = [0, 0, 0];

    // Basic setup for all clips
    heroVideos.forEach((video, index) => {
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.pause();
        try {
            video.currentTime = 0;
        } catch (e) {}
        video.style.opacity = index === 0 ? '1' : '0';

        video.addEventListener('loadedmetadata', () => {
            if (video.duration && isFinite(video.duration)) {
                clipDurations[index] = video.duration;
            }
        });
    });

    function updateArrow(index, t) {
        if (!heroScrubArrow) return;
        const duration = clipDurations[index] || heroVideos[index].duration || 0;
        if (!duration) return;
        const track = heroScrubArrow.parentElement;
        if (!track) return;

        const totalClips = heroVideos.length;
        const clipProgress = Math.max(0, Math.min(1, t / duration));
        const overall = Math.max(
            0,
            Math.min(1, (index + clipProgress) / totalClips)
        );
        const trackH = track.clientHeight || 0;
        const arrowH = heroScrubArrow.offsetHeight || 0;
        const travel = Math.max(0, trackH - arrowH);
        heroScrubArrow.style.transform = `translate(-50%, ${travel * overall}px)`;
    }

    // Mobile / tablet: try autoplay; if blocked show a tap-to-play overlay and then play full sequence
    if (isTouchDevice) {
        const firstVideo = heroVideos[0];
        let mobileSequencePlaying = false;

        // Create overlay UI
        function createMobileOverlay() {
            let overlay = document.querySelector('.mobile-play-overlay');
            if (overlay) return overlay;
            overlay = document.createElement('div');
            overlay.className = 'mobile-play-overlay';
            overlay.innerHTML = '<button class=\"mobile-play-btn\" aria-label=\"Play hero videos\">Play</button>';
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.style.display = 'none';
                startMobileSequence();
            }, { passive: false });
            videoSection.appendChild(overlay);
            return overlay;
        }

        function removeMobileOverlay() {
            const overlay = document.querySelector('.mobile-play-overlay');
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }

        function startMobileSequence() {
            if (mobileSequencePlaying) return;
            mobileSequencePlaying = true;
            locked = true;
            // Play clips sequentially; do NOT add global touch/wheel preventDefault here
            playClip(0, () => {
                if (!mobileSequencePlaying) return stopMobileSequence();
                playClip(1, () => {
                    if (!mobileSequencePlaying) return stopMobileSequence();
                    playClip(2, () => {
                        mobileSequencePlaying = false;
                        locked = false;
                        stopMobileSequence();
                        // after sequence, scroll to next section gently
                        setTimeout(() => { goToNextSection(); }, 500);
                    });
                });
            });
        }

        function stopMobileSequence() {
            mobileSequencePlaying = false;
            try { heroVideos.forEach(v => { v.pause(); }); } catch (e) {}
            locked = false;
            removeMobileOverlay();
        }

        // Try to autoplay muted first
        try {
            // Ensure muted and playsInline are set
            heroVideos.forEach(v => { v.muted = true; v.playsInline = true; v.preload = 'auto'; });
            const playPromise = firstVideo.play();
            if (playPromise && playPromise.then) {
                playPromise.then(() => {
                    // autoplay succeeded; pause and start sequence so playClip can handle it
                    firstVideo.pause();
                    startMobileSequence();
                }).catch(() => {
                    // autoplay blocked — show overlay for user to tap
                    createMobileOverlay();
                });
            } else {
                // no promise, start sequence
                firstVideo.pause();
                startMobileSequence();
            }
        } catch (e) {
            createMobileOverlay();
        }

        return;
    }

    // Desktop: step-based behavior for 3 separate videos
    // Steps: 0=unlocked  1=clip0 playing  2=waiting(clip0 done)
    //        3=waiting(clip1 done)  4=waiting(clip2 done)  5=past section
    let currentStep = 0;
    let locked = false;
    let isPlaying = false;

    // Smooth cross-fade between clips via CSS transition
    heroVideos.forEach(v => { v.style.transition = 'opacity 0.25s ease'; });

    function inVideoViewport() {
        const r = videoSection.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
    }

    // True once section is close enough to the viewport top to trigger lock
    function nearVideoTop() {
        const r = videoSection.getBoundingClientRect();
        return r.top <= 180 && r.bottom > 100;
    }

    function snapToSection() {
        // Direct scrollTop assignment — instant, universally supported, no animation delay
        var top = videoSection.offsetTop;
        document.documentElement.scrollTop = top;
        document.body.scrollTop = top; // Safari fallback
    }

    function fadeToVideo(index) {
        heroVideos.forEach((v, i) => {
            v.style.opacity = i === index ? '1' : '0';
            v.style.zIndex  = i === index ? '100' : '0';
        });
    }

    function showLastFrame(index, onDone) {
        const video = heroVideos[index];
        const go = () => {
            const dur = clipDurations[index] || video.duration || 0;
            if (!dur) { if (onDone) onDone(); return; }
            video.pause();
            fadeToVideo(index);
            const apply = () => { video.pause(); updateArrow(index, dur); if (onDone) onDone(); };
            const fallback = setTimeout(apply, 150);
            video.addEventListener('seeked', function once() {
                video.removeEventListener('seeked', once);
                clearTimeout(fallback); apply();
            }, { once: true });
            try { video.currentTime = Math.max(0, dur - 0.05); } catch(e) { clearTimeout(fallback); apply(); }
        };
        if ((clipDurations[index] || video.duration) && video.readyState >= 2) go();
        else {
            video.addEventListener('canplay', go, { once: true });
            video.load();
        }
    }

    function playClip(index, onDone) {
        const video = heroVideos[index];
        isPlaying = true;
        fadeToVideo(index);

        const start = () => {
            if (video.duration && isFinite(video.duration)) clipDurations[index] = video.duration;
            try { video.currentTime = 0; } catch(e) {}
            video.play().catch(() => {});

            const onTU = () => updateArrow(index, video.currentTime || 0);
            const finish = () => {
                const d = clipDurations[index] || video.duration || 0;
                if (d) try { video.currentTime = Math.max(0, d - 0.05); } catch(e) {}
                video.pause();
                video.removeEventListener('timeupdate', onTU);
                video.removeEventListener('ended', onEnded);
                isPlaying = false;
                if (onDone) onDone();
            };
            const onEnded = finish;
            video.addEventListener('timeupdate', onTU);
            video.addEventListener('ended', onEnded);
        };

        if (video.readyState >= 2) start();
        else { video.addEventListener('canplay', start, { once: true }); video.load(); }
    }

    function playClipReverse(index, onDone, reverseMs = 900) {
        const video = heroVideos[index];
        isPlaying = true;
        fadeToVideo(index);

        const go = () => {
            const dur = clipDurations[index] || video.duration || 0;
            try { video.pause(); video.currentTime = Math.max(0, dur - 0.02); } catch(e) {}
            let last = performance.now();
            const step = (now) => {
                const dec = (dur / Math.max(1, reverseMs)) * (now - last);
                last = now;
                const t = Math.max(0, (video.currentTime || 0) - dec);
                try { video.currentTime = t; } catch(e) {}
                if (t <= 0.02) {
                    try { video.currentTime = 0; } catch(e) {}
                    video.pause(); isPlaying = false; if (onDone) onDone(); return;
                }
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        if (video.readyState >= 2) go();
        else { video.addEventListener('canplay', go, { once: true }); video.load(); }
    }

    function goToNextSection() {
        locked = false;
        window.scrollTo({ top: nextSection.offsetTop, behavior: 'smooth' });
    }

    window.addEventListener('wheel', (e) => {
        if (!inVideoViewport()) return;

        if (e.deltaY > 0) { // ── scroll DOWN ──
            // First scroll down: snap instantly + start clip 0 immediately (no intermediate "lock" step)
            if (currentStep === 0) {
                if (!nearVideoTop()) return;          // section not yet near top — let normal scroll through
                locked = true;
                snapToSection();
                currentStep = 1;
                playClip(0, () => { currentStep = 2; });
                e.preventDefault(); return;
            }
            if (currentStep === 2 && !isPlaying) {
                playClip(1, () => { currentStep = 3; });
                e.preventDefault(); return;
            }
            if (currentStep === 3 && !isPlaying) {
                playClip(2, () => { currentStep = 4; });
                e.preventDefault(); return;
            }
            if (currentStep === 4 && !isPlaying) {
                goToNextSection(); currentStep = 5;
                e.preventDefault(); return;
            }
        } else if (e.deltaY < 0) { // ── scroll UP ──
            if (currentStep === 4 && !isPlaying) {
                playClipReverse(2, () => { currentStep = 3; });
                e.preventDefault(); return;
            }
            if (currentStep === 3 && !isPlaying) {
                playClipReverse(1, () => { currentStep = 2; });
                e.preventDefault(); return;
            }
            if (currentStep === 2 && !isPlaying) {
                playClipReverse(0, () => { currentStep = 1; });
                e.preventDefault(); return;
            }
            // At step 1 (clip 0 playing or just locked) — release lock so user can scroll up freely
            if (currentStep === 1 && !isPlaying) {
                locked = false; currentStep = 0;
                return; // don't preventDefault — let the page scroll up naturally
            }
            // Scrolled past section and coming back up → snap back, show last frame
            if (currentStep >= 5 && !isPlaying) {
                locked = true; currentStep = 4;
                snapToSection();
                showLastFrame(2, () => { currentStep = 4; });
                e.preventDefault(); return;
            }
        }

        // While locked and playing, block scroll so page doesn't drift
        if (locked) e.preventDefault();
    }, { passive: false });
}

// Lazy load videos when they come into view
function lazyLoadVideos() {
    const videos = document.querySelectorAll('video[data-src]');
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                const sources = video.querySelectorAll('source[data-src]');
                
                sources.forEach(source => {
                    source.src = source.dataset.src;
                    source.removeAttribute('data-src');
                });
                
                video.load();
                videoObserver.unobserve(video);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    videos.forEach(video => {
        videoObserver.observe(video);
    });
}

// Video Mode Switching
function initVideoModes() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeVideos = {
        morning: document.getElementById('morningVideo'),
        movie: document.getElementById('movieVideo'),
        night: document.getElementById('nightVideo')
    };
    
    const videoModesSection = document.querySelector('.video-modes-section');
    
    let currentMode = 'morning'; // Default mode
    let isPlayingOtherMode = false; // Track if non-morning mode is playing
    let morningModeStarted = false; // Track if morning mode has been started
    
    // Preload all videos for smooth transitions
    function preloadVideos() {
        Object.values(modeVideos).forEach(video => {
            if (video) {
                video.preload = 'auto';
                video.load();
            }
        });
    }
    
    // Preload videos on initialization
    preloadVideos();
    
    // Function to start morning mode
    function startMorningMode() {
        if (modeVideos.morning && !morningModeStarted) {
            modeVideos.morning.classList.add('active', 'playing', 'fade-in');
            modeVideos.morning.classList.remove('fade-out');
            modeVideos.morning.play().catch(() => {});
            morningModeStarted = true;
            
            // Update active button
            modeButtons.forEach(btn => {
                if (btn.dataset.mode === 'morning') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }
    
    // Use Intersection Observer to detect when section is scrolled into view
    if (videoModesSection && modeVideos.morning) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !morningModeStarted && !isPlayingOtherMode) {
                    // Section is visible, start morning mode
                    startMorningMode();
                } else if (!entry.isIntersecting && morningModeStarted && !isPlayingOtherMode) {
                    // Section is not visible, pause morning mode
                    if (modeVideos.morning) {
                        modeVideos.morning.pause();
                        modeVideos.morning.classList.remove('active', 'playing');
                    }
                    morningModeStarted = false;
                }
            });
        }, {
            threshold: 0.3 // Start when 30% of section is visible
        });
        
        observer.observe(videoModesSection);
    }
    
    // Function to return to morning mode
    function returnToMorning() {
        const currentVideo = modeVideos[currentMode];
        if (currentVideo && currentMode !== 'morning') {
            // Smooth fade out current video
            currentVideo.classList.add('fade-out');
            currentVideo.classList.remove('fade-in', 'active', 'playing');
            
            // Wait for fade out, then pause
            setTimeout(() => {
                currentVideo.pause();
                currentVideo.currentTime = 0;
                currentVideo.classList.remove('fade-out');
            }, 1500);
        }
        
        // Smooth fade in morning video
        if (modeVideos.morning) {
            // Start fade in immediately for crossfade effect
            modeVideos.morning.classList.add('fade-in', 'active', 'playing');
            modeVideos.morning.classList.remove('fade-out');
            modeVideos.morning.play().catch(() => {});
            morningModeStarted = true;
        }
        
        // Update active button
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === 'morning') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        currentMode = 'morning';
        isPlayingOtherMode = false;
    }
    
    // Function to switch video mode
    function switchMode(mode) {
        if (!modeVideos[mode]) return;
        
        // If clicking the same button (any mode), always restart it
        if (currentMode === mode) {
            const video = modeVideos[mode];
            video.classList.add('fade-in', 'active', 'playing');
            video.classList.remove('fade-out');
            video.currentTime = 0;
            video.addEventListener('seeked', function once() {
                video.removeEventListener('seeked', once);
                video.play().catch(() => {
                    video.addEventListener('canplay', function once2() {
                        video.removeEventListener('canplay', once2);
                        video.play().catch(() => {});
                    });
                });
            });
            
            // Update button state
            modeButtons.forEach(btn => {
                if (btn.dataset.mode === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            if (mode === 'morning') {
                morningModeStarted = true;
                isPlayingOtherMode = false;
            } else {
                isPlayingOtherMode = true;
            }
            return;
        }
        
        // If clicking morning mode from another mode
        if (mode === 'morning') {
            // Fade out current video if it's not morning
            if (currentMode !== 'morning' && modeVideos[currentMode]) {
                const currentVideo = modeVideos[currentMode];
                currentVideo.classList.add('fade-out');
                currentVideo.classList.remove('fade-in', 'active', 'playing');
                currentVideo.pause();
                currentVideo.currentTime = 0;
            }
            
            // Fade in morning video and restart from beginning
            if (modeVideos.morning) {
                setTimeout(() => {
                    modeVideos.morning.currentTime = 0; // Always restart from beginning
                    modeVideos.morning.classList.add('fade-in', 'active', 'playing');
                    modeVideos.morning.classList.remove('fade-out');
                    modeVideos.morning.play().catch(() => {});
                    morningModeStarted = true;
                }, currentMode !== 'morning' ? 100 : 0);
            }
            
            // Update active button
            modeButtons.forEach(btn => {
                if (btn.dataset.mode === 'morning') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            currentMode = 'morning';
            isPlayingOtherMode = false;
            return;
        }
        
        // Smooth fade out morning video
        if (modeVideos.morning && currentMode === 'morning') {
            modeVideos.morning.classList.add('fade-out');
            modeVideos.morning.classList.remove('fade-in', 'active', 'playing');
            
            // Wait for fade out, then pause
            setTimeout(() => {
                modeVideos.morning.pause();
                modeVideos.morning.classList.remove('fade-out');
            }, 1500);
        }
        
        // If switching from another non-morning mode, fade it out first
        if (currentMode !== 'morning' && modeVideos[currentMode]) {
            const previousVideo = modeVideos[currentMode];
            previousVideo.classList.add('fade-out');
            previousVideo.classList.remove('fade-in', 'active', 'playing');
            previousVideo.pause();
            previousVideo.currentTime = 0;
        }
        
        // Smooth fade in the selected non-morning mode video
        const newVideo = modeVideos[mode];
        if (newVideo) {
            newVideo.classList.add('fade-in', 'active', 'playing');
            newVideo.classList.remove('fade-out');
            // Reset to start then play; retry via canplay if seek races with play()
            function robustPlay(vid) {
                vid.play().catch(() => {
                    vid.addEventListener('canplay', function once() {
                        vid.removeEventListener('canplay', once);
                        vid.play().catch(() => {});
                    });
                });
            }
            if (newVideo.readyState >= 2) {
                newVideo.currentTime = 0;
                newVideo.addEventListener('seeked', function once() {
                    newVideo.removeEventListener('seeked', once);
                    robustPlay(newVideo);
                });
            } else {
                newVideo.currentTime = 0;
                newVideo.addEventListener('canplay', function once() {
                    newVideo.removeEventListener('canplay', once);
                    robustPlay(newVideo);
                });
            }
        }
        
        // Update active button
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        currentMode = mode;
        isPlayingOtherMode = true;
    }
    
    // Handle video end events for all modes - hold last frame, stay visible until user presses a button
    if (modeVideos.morning) {
        modeVideos.morning.addEventListener('ended', () => {
            modeVideos.morning.pause();
            if (modeVideos.morning.duration && isFinite(modeVideos.morning.duration)) {
                modeVideos.morning.currentTime = modeVideos.morning.duration - 0.01;
            }
            modeVideos.morning.classList.add('active', 'playing', 'fade-in');
            modeVideos.morning.classList.remove('fade-out');
            isPlayingOtherMode = false;
        });
    }

    if (modeVideos.movie) {
        modeVideos.movie.addEventListener('ended', () => {
            // Pause and hold last frame - keep video visible (do not fade out)
            modeVideos.movie.pause();
            // Ensure we're on the last frame (some browsers need this)
            if (modeVideos.movie.duration && isFinite(modeVideos.movie.duration)) {
                modeVideos.movie.currentTime = modeVideos.movie.duration - 0.01;
            }
            // Keep active/playing/fade-in so video stays visible
            modeVideos.movie.classList.add('active', 'playing', 'fade-in');
            modeVideos.movie.classList.remove('fade-out');
            isPlayingOtherMode = false;
            // Keep button active since this mode's last frame is still showing
        });
    }

    if (modeVideos.night) {
        modeVideos.night.addEventListener('ended', () => {
            // Pause and hold last frame - keep video visible (do not fade out)
            modeVideos.night.pause();
            if (modeVideos.night.duration && isFinite(modeVideos.night.duration)) {
                modeVideos.night.currentTime = modeVideos.night.duration - 0.01;
            }
            modeVideos.night.classList.add('active', 'playing', 'fade-in');
            modeVideos.night.classList.remove('fade-out');
            isPlayingOtherMode = false;
        });
    }
    
    // Hide "Tap to switch mode" hint when any button is pressed
    const modeHint = document.getElementById('modeControlsHint');
    function hideModeHint() {
        if (modeHint) {
            modeHint.classList.add('mode-controls-hint-hidden');
        }
    }

    // Add click event listeners to buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModeHint();
            const mode = btn.dataset.mode;
            switchMode(mode);
        });
    });
}

// Initialize all video features
document.addEventListener('DOMContentLoaded', () => {
    try {
        initVideos();
        handleVideoTransitions();
        // Use simplified, step-based hero video behavior
        initHeroVideoSteps();
        lazyLoadVideos();
        // Removed initInteractiveVideoSpeed() for better performance
        loadProducts().then(() => {
            initProductsScroll();
            initGalleryScroll();
            // Lightbox disabled - gallery images are not clickable
            // initLightbox();
        });
        initVideoModes();
        initScrollAnimations();
        // Removed initInteractiveVideoSpeed() for better performance
    } catch (e) {
        console.warn('Video/feature initialization failed:', e);
    }
});

// Scroll Animations for Smooth Transitions
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // For staggered animations on cards
                if (entry.target.classList.contains('services-grid') || 
                    entry.target.classList.contains('products-scroll-wrapper') ||
                    entry.target.classList.contains('gallery-scroll-wrapper') ||
                    entry.target.classList.contains('warranty-info')) {
                    const cards = entry.target.querySelectorAll('.service-card, .product-card, .gallery-item, .warranty-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe section headers
    document.querySelectorAll('.section-header').forEach(header => {
        observer.observe(header);
    });

    // Observe content sections
    document.querySelectorAll('.about-content, .services-grid, .products-scroll-wrapper, .gallery-scroll-wrapper, .warranty-info').forEach(section => {
        observer.observe(section);
    });

    // Observe individual cards that are direct children
    document.querySelectorAll('.service-card, .product-card, .gallery-item, .warranty-card').forEach(card => {
        // Only observe if not inside a grid/wrapper that's already observed
        const parent = card.parentElement;
        if (!parent.classList.contains('services-grid') && 
            !parent.classList.contains('products-scroll-wrapper') &&
            !parent.classList.contains('gallery-scroll-wrapper') &&
            !parent.classList.contains('warranty-info')) {
            observer.observe(card);
        }
    });
}

// Video error handling
document.querySelectorAll('video').forEach(video => {
    video.addEventListener('error', (e) => {
        // Hide video if it fails to load
        video.style.display = 'none';
        const overlay = video.nextElementSibling;
        if (overlay && (overlay.classList.contains('section-video-overlay') || overlay.classList.contains('hero-overlay'))) {
            // Keep overlay but adjust opacity
            overlay.style.background = overlay.classList.contains('hero-overlay') 
                ? 'rgba(0, 0, 0, 0.5)' 
                : 'rgba(255, 255, 255, 0.95)';
        }
    });
    // Hero video is scroll-to-scrub; don't loop it
    // Mobile hero videos are scrub-controlled; don't loop them either
    if (video.id === 'heroVideo' || video.id === 'heroVideo1' || video.id === 'heroVideo2' || video.id === 'heroVideo3' || video.classList.contains('mobile-hero-video')) return;
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
    });
});

