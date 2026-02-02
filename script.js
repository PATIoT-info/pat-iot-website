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

// Navbar scroll effect - hide on scroll down, show on scroll up (RAF-throttled for smooth scroll)
(function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    let scrollRafPending = false;

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
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.classList.add('navbar-hidden');
                navbar.classList.remove('navbar-visible');
            } else if (currentScroll < lastScroll) {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('navbar-visible');
            }
            if (currentScroll < 50) {
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('navbar-visible');
            }
            lastScroll = currentScroll;
            scrollRafPending = false;
        });
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
        const response = await fetch('data/products.json');
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
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236b7280%22 font-family=%22Arial%22 font-size=%2214%22%3E${product.name}%3C/text%3E%3C/svg%3E';">
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
                <div class="gallery-item">
                    <img src="${item.image}" alt="${item.alt}" class="gallery-image">
                </div>
            `).join('');
            
            // Lightbox disabled - gallery images are not clickable
            // No need to reinitialize lightbox
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

// Lightbox Functionality
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
        
        console.log('Lightbox: Refreshing sources, found', galleryImages.length, 'gallery images');
        
        galleryImages.forEach((img, idx) => {
            // Try multiple ways to get the source
            const srcAttr = img.getAttribute('src');
            const srcResolved = img.src;
            
            // Prefer resolved src, fallback to attribute
            const src = srcResolved || srcAttr;
            
            console.log(`Lightbox: Image ${idx}:`, {
                'src attribute': srcAttr,
                'resolved src': srcResolved,
                'using': src
            });
            
            if (src && src.trim() && !src.includes('data:image') && src !== '' && src !== window.location.href) {
                // Use resolved URL if available, otherwise use attribute
                const finalSrc = srcResolved || src;
                imageSources.push(finalSrc);
                console.log('Lightbox: ✓ Collected image source:', finalSrc);
            } else {
                console.warn('Lightbox: ✗ Skipped invalid image source:', src);
            }
        });
        
        console.log('Lightbox: Total images collected:', imageSources.length, 'sources:', imageSources);
        updateNavButtons();
    }
    
    // Open lightbox
    function openLightbox(index) {
        // Refresh sources before opening
        refreshImageSources();
        
        console.log('Lightbox: openLightbox called with index:', index, 'sources:', imageSources);
        
        if (imageSources.length === 0) {
            console.error('Lightbox: No images available! Gallery images:', galleryImages.length);
            alert('No images available in gallery. Please check console for details.');
            return;
        }
        
        if (index < 0 || index >= imageSources.length) {
            console.error('Lightbox: Invalid index', index, 'valid range: 0-' + (imageSources.length - 1));
            return;
        }
        
        currentImageIndex = index;
        const imageSrc = imageSources[currentImageIndex];
        
        if (!imageSrc || imageSrc.trim() === '') {
            console.error('Lightbox: Empty image source at index', index);
            return;
        }
        
        console.log('Lightbox: Opening image', currentImageIndex, 'src:', imageSrc);
        
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
            console.log('Lightbox: Image onload fired!', {
                src: imageSrc,
                naturalWidth: lightboxImage.naturalWidth,
                naturalHeight: lightboxImage.naturalHeight,
                width: lightboxImage.width,
                height: lightboxImage.height,
                complete: lightboxImage.complete,
                offsetWidth: lightboxImage.offsetWidth,
                offsetHeight: lightboxImage.offsetHeight
            });
            
            // CRITICAL: Force visibility with inline styles (highest priority)
            lightboxImage.setAttribute('style', 
                'display: block !important; ' +
                'visibility: visible !important; ' +
                'opacity: 1 !important; ' +
                'width: auto !important; ' +
                'height: auto !important; ' +
                'max-width: 100% !important; ' +
                'max-height: 90vh !important; ' +
                'position: relative !important; ' +
                'z-index: 10002 !important;'
            );
            
            // Also set via style object as backup
            lightboxImage.style.cssText = 
                'display: block !important; ' +
                'visibility: visible !important; ' +
                'opacity: 1 !important; ' +
                'width: auto !important; ' +
                'height: auto !important; ' +
                'max-width: 100% !important; ' +
                'max-height: 90vh !important;';
            
            // Remove any error message if image loads successfully
            const existingError = content ? content.querySelector('.lightbox-error') : null;
            if (existingError) {
                existingError.remove();
            }
            
            // Ensure image has dimensions
            if (lightboxImage.naturalWidth === 0 || lightboxImage.naturalHeight === 0) {
                console.error('Lightbox: Image has zero dimensions!', {
                    naturalWidth: lightboxImage.naturalWidth,
                    naturalHeight: lightboxImage.naturalHeight,
                    src: imageSrc
                });
                // Don't show alert - just log
                console.warn('Image loaded but has zero dimensions. Check image file.');
            }
            
            // Force content visibility
            if (content) {
                content.setAttribute('style', 
                    'display: flex !important; ' +
                    'visibility: visible !important; ' +
                    'opacity: 1 !important; ' +
                    'max-width: 90% !important; ' +
                    'max-height: 90% !important;'
                );
            }
            
            // Force lightbox visibility
            lightbox.setAttribute('style', 
                'display: flex !important; ' +
                'opacity: 1 !important; ' +
                'visibility: visible !important;'
            );
            
            // Verify it's actually visible
            setTimeout(() => {
                const rect = lightboxImage.getBoundingClientRect();
                const computed = window.getComputedStyle(lightboxImage);
                console.log('Lightbox: Final visibility check:', {
                    boundingRect: rect,
                    computedDisplay: computed.display,
                    computedVisibility: computed.visibility,
                    computedOpacity: computed.opacity,
                    computedWidth: computed.width,
                    computedHeight: computed.height,
                    naturalWidth: lightboxImage.naturalWidth,
                    naturalHeight: lightboxImage.naturalHeight
                });
                
                if (rect.width === 0 || rect.height === 0) {
                    console.error('Lightbox: Image bounding rect is zero!', rect);
                    console.warn('Image is not visible. Check console for details.');
                    // Try to show error message
                    const errorMsg = document.createElement('div');
                    errorMsg.style.cssText = 
                        'position: absolute; ' +
                        'top: 50%; ' +
                        'left: 50%; ' +
                        'transform: translate(-50%, -50%); ' +
                        'color: white; ' +
                        'text-align: center; ' +
                        'padding: 2rem; ' +
                        'background: rgba(0, 0, 0, 0.7); ' +
                        'border-radius: 0.5rem; ' +
                        'z-index: 10003;';
                    errorMsg.innerHTML = '<p>Image not visible</p>';
                    errorMsg.className = 'lightbox-error';
                    if (content) {
                        content.appendChild(errorMsg);
                    }
                }
            }, 50);
            
            console.log('Lightbox: Image loaded successfully:', imageSrc, 'dimensions:', lightboxImage.naturalWidth, 'x', lightboxImage.naturalHeight);
        };
        
        lightboxImage.onerror = () => {
            console.error('Lightbox: Failed to load image:', imageSrc);
            
            // Show a placeholder/error message instead of alert
            lightboxImage.style.opacity = '1';
            lightboxImage.style.display = 'block';
            lightboxImage.style.visibility = 'visible';
            lightboxImage.alt = 'Image failed to load: ' + imageSrc;
            
            // Create a visual error indicator
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 
                'position: absolute; ' +
                'top: 50%; ' +
                'left: 50%; ' +
                'transform: translate(-50%, -50%); ' +
                'color: white; ' +
                'text-align: center; ' +
                'padding: 2rem; ' +
                'background: rgba(0, 0, 0, 0.7); ' +
                'border-radius: 0.5rem; ' +
                'z-index: 10003;';
            errorMsg.innerHTML = 
                '<i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>' +
                '<p style="margin: 0; font-size: 1.1rem;">Image not found</p>' +
                '<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.8;">' + 
                imageSrc.split('/').pop() + '</p>';
            
            // Remove any existing error message
            const existingError = content.querySelector('.lightbox-error');
            if (existingError) {
                existingError.remove();
            }
            
            errorMsg.className = 'lightbox-error';
            if (content) {
                content.appendChild(errorMsg);
            }
            
            // Don't show alert - just log to console
            console.warn('Lightbox: Image failed to load. Showing error message in lightbox.');
        };
        
        // Set the source - this will trigger load or error
        console.log('Lightbox: Setting image src to:', imageSrc);
        
        // Clear src first to force reload (important for same image)
        if (lightboxImage.src) {
            lightboxImage.src = '';
            // Small delay to ensure browser processes the clear
            setTimeout(() => {
                lightboxImage.src = imageSrc;
            }, 10);
        } else {
            // Set new src directly
            lightboxImage.src = imageSrc;
        }
        
        // If image is already loaded (cached), check and trigger onload
        setTimeout(() => {
            if (lightboxImage.complete && lightboxImage.naturalWidth > 0) {
                console.log('Lightbox: Image was cached, triggering onload manually');
                if (lightboxImage.onload) {
                    lightboxImage.onload();
                }
            }
        }, 50);
        
        updateCounter();
        updateNavButtons();
        
        // Debug: Check if lightbox is actually visible
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(lightbox);
            console.log('Lightbox visibility check:', {
                display: computedStyle.display,
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility,
                zIndex: computedStyle.zIndex,
                hasActiveClass: lightbox.classList.contains('active'),
                backgroundColor: computedStyle.backgroundColor
            });
            
            const imgStyle = window.getComputedStyle(lightboxImage);
            console.log('Image visibility check:', {
                display: imgStyle.display,
                opacity: imgStyle.opacity,
                visibility: imgStyle.visibility,
                width: imgStyle.width,
                height: imgStyle.height,
                maxWidth: imgStyle.maxWidth,
                maxHeight: imgStyle.maxHeight,
                src: lightboxImage.src,
                complete: lightboxImage.complete,
                naturalWidth: lightboxImage.naturalWidth,
                naturalHeight: lightboxImage.naturalHeight,
                offsetWidth: lightboxImage.offsetWidth,
                offsetHeight: lightboxImage.offsetHeight
            });
            
            const contentStyle = content ? window.getComputedStyle(content) : null;
            if (contentStyle) {
                console.log('Content visibility check:', {
                    display: contentStyle.display,
                    opacity: contentStyle.opacity,
                    visibility: contentStyle.visibility,
                    width: contentStyle.width,
                    height: contentStyle.height
                });
            }
        }, 100);
        
        // Fallback: if image doesn't load in 3 seconds, show error
        setTimeout(() => {
            if (lightboxImage.complete === false || lightboxImage.naturalWidth === 0) {
                console.error('Lightbox: Image load timeout:', imageSrc);
                lightboxImage.onerror();
            }
        }, 3000);
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

// Video Background Management and Transitions
const videoConfig = {
    // Enable/disable videos for each section
    hero: {
        enabled: true,
        videoId: 'heroVideo',
        fadeOnScroll: true
    },
    services: {
        enabled: false, // Set to true to enable video background
        videoId: 'servicesVideo',
        fadeOnScroll: true
    },
    about: {
        enabled: false, // Set to true to enable video background
        videoId: 'aboutVideo',
        fadeOnScroll: true
    },
    solutions: {
        enabled: false, // Set to true to enable video background
        videoId: 'solutionsVideo',
        fadeOnScroll: true
    }
};

// Initialize videos
function initVideos() {
    // Hero video: controlled by handleHeroVideoScroll (scroll-to-scrub)
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
        heroVideo.style.opacity = '1';
        heroVideo.style.display = 'block';
        heroVideo.muted = true;
    }

    // Section videos
    Object.keys(videoConfig).forEach(section => {
        if (section === 'hero') return;
        
        const config = videoConfig[section];
        const video = document.getElementById(config.videoId);
        
        if (video) {
            if (config.enabled) {
                video.addEventListener('loadeddata', () => {
                    video.play().catch(e => console.log('Video autoplay prevented:', e));
                });
                // Show video with fade-in
                setTimeout(() => {
                    video.classList.add('fade-in');
                }, 100);
            } else {
                video.style.display = 'none';
                const overlay = video.nextElementSibling;
                if (overlay && overlay.classList.contains('section-video-overlay')) {
                    overlay.style.display = 'none';
                }
            }
        }
    });
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
                    video.play().catch(e => console.log('Video play prevented:', e));
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

// Hero video: scroll-to-scrub with optimized performance (no lag)
function handleHeroVideoScroll() {
    const heroVideo = document.getElementById('heroVideo');
    const videoSection = document.querySelector('.hero-video-section');
    const nextSection = document.querySelector('#services');
    if (!heroVideo || !videoSection || !nextSection) {
        console.warn('Hero video scroll: Missing required elements', {
            heroVideo: !!heroVideo,
            videoSection: !!videoSection,
            nextSection: !!nextSection
        });
        return;
    }
    
    console.log('Hero video scroll: Initializing', {
        videoSrc: heroVideo.querySelector('source')?.src,
        videoReadyState: heroVideo.readyState
    });

    let sectionTop = 0;
    let pinned = false;
    let videoEnded = false;
    let accumulatedScroll = 0;
    let targetVideoTime = 0;
    let currentVideoTime = 0;
    let smoothUpdateRaf = null;
    let scrollRaf = null;
    let isFirstScroll = true;
    let lastFrameTime = 0;
    let lastScrollY = 0;
    let entryTimeout = null; // Defer first-entry work to avoid lag
    let escapeTimeout = null; // Timeout for auto-releasing pin
    let scrollDirection = 0; // 1 for down, -1 for up, 0 for none
    let lastScrollDelta = 0;
    let scrollDirectionTimeout = null; // Timeout to reset scroll direction
    let lastBackwardSeekTime = 0; // Track time for manual backward seeking
    const PIXELS_PER_SECOND = 200;
    const PLAYBACK_RATE_SCALE = 1.5; // Scale factor for playback rate based on scroll speed (increased for faster response)
    const MIN_PLAYBACK_RATE = 0.3; // Minimum playback rate for smooth playback (increased for faster)
    const MAX_PLAYBACK_RATE = 3.0; // Maximum playback rate (increased for faster)
    const LERP_SPEED = 5.5;
    const SNAP_THRESHOLD = 0.35;
    const SCROLL_LOCK_MARGIN = 60; // Only lock scroll when well inside section (reduces “whole page lag”)
    const ENTRY_DEBOUNCE_MS = 80; // Don’t run heavy work until user has been in section briefly

    heroVideo.muted = true;
    heroVideo.preload = 'auto';
    heroVideo.playsInline = true;

    // Cache sectionTop – avoid reading during scroll when possible
    function updateSectionTop() {
        if (!videoSection) return;
        const newTop = videoSection.offsetTop;
        if (Math.abs(newTop - sectionTop) > 5) {
            sectionTop = newTop;
        }
    }
    
    // Initialize sectionTop after a short delay to ensure layout is complete
    function initializeVideo() {
        updateSectionTop();
        if (sectionTop === 0) {
            // Retry if sectionTop is still 0 (layout not ready)
            setTimeout(initializeVideo, 100);
        }
    }
    
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeVideo);
    } else {
        setTimeout(initializeVideo, 100);
    }

    function releaseAndScrollNext() {
        if (videoEnded) return;
        videoEnded = true;
        pinned = false;
        scrollDirection = 0;
        lastScrollDelta = 0;
        if (scrollDirectionTimeout) {
            clearTimeout(scrollDirectionTimeout);
            scrollDirectionTimeout = null;
        }
        if (escapeTimeout) {
            clearTimeout(escapeTimeout);
            escapeTimeout = null;
        }
        if (smoothUpdateRaf) {
            cancelAnimationFrame(smoothUpdateRaf);
            smoothUpdateRaf = null;
        }
        
        // Ensure video is at the end and pause it
        if (heroVideo.readyState >= 2 && cachedDuration > 0) {
            heroVideo.currentTime = cachedDuration;
            heroVideo.playbackRate = 0; // Stop playback
            heroVideo.pause();
            console.log('Hero video: Released, paused at end');
        }
        
        // Brief pause (1 second) to show completed video, then scroll to next section
        setTimeout(() => {
            const nextTop = nextSection.offsetTop;
            window.scrollTo({ top: nextTop, behavior: 'smooth' });
        }, 1000);
    }
    
    // Escape key to release pin
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.keyCode === 27) && pinned && !videoEnded) {
            console.log('Hero video: Escape key pressed, releasing pin');
            releaseAndScrollNext();
        }
    });

    // Smooth interpolation – cache duration to reduce layout/reads
    let cachedDuration = 0;
    function smoothVideoUpdate(timestamp) {
        if (!pinned || videoEnded) {
            smoothUpdateRaf = null;
            return;
        }
        
        // Ensure video is ready for seeking
        if (heroVideo.readyState < 2) {
            smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
            return;
        }
        
        if (cachedDuration <= 0 && heroVideo.duration && isFinite(heroVideo.duration)) {
            cachedDuration = heroVideo.duration;
        }
        if (cachedDuration <= 0) {
            smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
            return;
        }
        
        const duration = cachedDuration;
        currentVideoTime = heroVideo.currentTime || 0;
        const diff = targetVideoTime - currentVideoTime;
        const absDiff = Math.abs(diff);
        
        // Play video forward/backward based on scroll direction
        // CRITICAL: Video must be playing for frames to update
        try {
            if (heroVideo.readyState >= 2) {
                // Ensure video is playing (muted)
                if (heroVideo.paused) {
                    heroVideo.play().catch(() => {});
                }
                
                // Calculate playback rate based on scroll direction and speed
                let playbackRate = 0;
                if (scrollDirection !== 0) {
                    // Calculate playback rate from scroll speed
                    // Use scroll delta magnitude to determine speed - increased sensitivity for faster response
                    const scrollSpeed = Math.min(lastScrollDelta / 25, 20); // Normalize scroll speed (max 20x, more sensitive for faster playback)
                    const baseRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, scrollSpeed * PLAYBACK_RATE_SCALE));
                    
                    // Set playback rate: positive for forward (scroll down), negative for backward (scroll up)
                    playbackRate = scrollDirection * baseRate;
                    
                    // Debug log more frequently to see what's happening
                    if (Math.random() < 0.2) { // Log 20% of the time for debugging
                        console.log('Hero video: Direction:', scrollDirection > 0 ? 'DOWN→FORWARD' : scrollDirection < 0 ? 'UP→BACKWARD' : 'STOP', 
                                    'playbackRate:', playbackRate.toFixed(2), 
                                    'currentTime:', heroVideo.currentTime.toFixed(2) + 's / ' + duration.toFixed(2) + 's',
                                    'scrollDirection:', scrollDirection,
                                    'lastScrollDelta:', lastScrollDelta);
                    }
                }
                
                // Set playback rate - handle forward and backward differently
                // For backward (scroll up), manually seek since negative playbackRate isn't reliable
                if (playbackRate < 0) {
                    // Scroll UP = Backward play: manually seek backward
                    // Ensure video is playing (required for frames to update)
                    if (heroVideo.paused) {
                        heroVideo.play().catch(() => {});
                    }
                    
                    const now = performance.now();
                    const dt = lastBackwardSeekTime > 0 ? (now - lastBackwardSeekTime) / 1000 : 0.016; // Time delta in seconds
                    const backwardStep = Math.abs(playbackRate) * dt; // Step back based on playback rate and time
                    const newTime = Math.max(0, heroVideo.currentTime - backwardStep);
                    
                    // Seek backward - this updates the frame
                    heroVideo.currentTime = newTime;
                    heroVideo.playbackRate = 0.001; // Very slow forward play to keep frames updating
                    lastBackwardSeekTime = now;
                    
                    // Debug log for backward
                    if (Math.random() < 0.15) {
                        console.log('Hero video: BACKWARD play, seeking to', newTime.toFixed(2), 's, step:', backwardStep.toFixed(3));
                    }
                } else if (playbackRate > 0) {
                    // Scroll DOWN = Forward play: use positive playbackRate
                    if (Math.abs(heroVideo.playbackRate - playbackRate) > 0.01) {
                        heroVideo.playbackRate = playbackRate;
                    }
                    lastBackwardSeekTime = 0; // Reset backward seek timer
                } else {
                    // No scrolling: stop playback
                    heroVideo.playbackRate = 0;
                    lastBackwardSeekTime = 0;
                }
                
                // If not scrolling, gradually slow down to stop (smooth deceleration)
                if (scrollDirection === 0) {
                    if (Math.abs(heroVideo.playbackRate) > 0.05) {
                        heroVideo.playbackRate *= 0.85; // Faster deceleration for quicker stop
                        if (Math.abs(heroVideo.playbackRate) < 0.05) {
                            heroVideo.playbackRate = 0;
                        }
                    }
                    // Also stop backward seeking
                    lastBackwardSeekTime = 0;
                }
                
                // Ensure video stays within bounds
                if (heroVideo.currentTime <= 0 && scrollDirection < 0) {
                    heroVideo.playbackRate = 0;
                    heroVideo.currentTime = 0;
                    scrollDirection = 0; // Stop backward scrolling at start
                } else if (heroVideo.currentTime >= duration && scrollDirection > 0) {
                    heroVideo.playbackRate = 0;
                    heroVideo.currentTime = duration;
                    scrollDirection = 0; // Stop forward scrolling at end
                }
            }
        } catch (e) {
            console.warn('Hero video: Error updating playback:', e);
        }

        // Check if video has reached the end (when playing forward)
        if (heroVideo.playbackRate > 0 && heroVideo.currentTime >= duration - 0.1) {
            // Ensure video is exactly at the end
            heroVideo.currentTime = duration;
            heroVideo.playbackRate = 0;
            // Release and scroll to next section after brief pause
            releaseAndScrollNext();
            return;
        }
        
        // Check if video has reached the beginning (when playing backward)
        if (heroVideo.playbackRate < 0 && heroVideo.currentTime <= 0.1) {
            heroVideo.currentTime = 0;
            heroVideo.playbackRate = 0;
        }

        // Continue loop
        smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
    }

    // Scroll handler – defer first-entry work to avoid “whole site lag”
    function onScroll() {
        if (scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => {
            const scrollY = window.pageYOffset;
            
            if (window.__navLinkScrollActive) {
                pinned = false;
                isFirstScroll = true;
                if (entryTimeout) clearTimeout(entryTimeout);
                entryTimeout = null;
                if (smoothUpdateRaf) {
                    cancelAnimationFrame(smoothUpdateRaf);
                    smoothUpdateRaf = null;
                }
                heroVideo.playbackRate = 1;
                heroVideo.pause();
                lastScrollY = scrollY;
                scrollRaf = null;
                return;
            }
            if (window.__userJumpedPastVideo) {
                if (scrollY < sectionTop - 30) window.__userJumpedPastVideo = false;
                pinned = false;
                if (smoothUpdateRaf) {
                    cancelAnimationFrame(smoothUpdateRaf);
                    smoothUpdateRaf = null;
                }
                heroVideo.playbackRate = 1;
                heroVideo.pause();
                lastScrollY = scrollY;
                scrollRaf = null;
                return;
            }
            // Ensure sectionTop is calculated
            if (sectionTop === 0 || Math.abs(scrollY - lastScrollY) > 80) {
                updateSectionTop();
                // If still 0, try to get it from videoSection directly
                if (sectionTop === 0 && videoSection) {
                    sectionTop = videoSection.offsetTop || videoSection.getBoundingClientRect().top + scrollY;
                }
            }
            if (scrollY < sectionTop - 30) {
                pinned = false;
                videoEnded = false;
                isFirstScroll = true;
                if (escapeTimeout) {
                    clearTimeout(escapeTimeout);
                    escapeTimeout = null;
                }
                if (entryTimeout) clearTimeout(entryTimeout);
                entryTimeout = null;
                if (smoothUpdateRaf) {
                    cancelAnimationFrame(smoothUpdateRaf);
                    smoothUpdateRaf = null;
                }
                heroVideo.playbackRate = 1;
                heroVideo.pause();
                lastScrollY = scrollY;
                scrollRaf = null;
                return;
            }
            
            // Release pin if scrolled past video section
            const videoHeight = cachedDuration > 0 ? cachedDuration * PIXELS_PER_SECOND : 2000;
            if (pinned && scrollY > sectionTop + videoHeight + 100) {
                console.log('Hero video: User scrolled past video section, releasing pin');
                releaseAndScrollNext();
                lastScrollY = scrollY;
                scrollRaf = null;
                return;
            }
            
            // Release pin if scrolled back above video section
            if (pinned && scrollY < sectionTop - 50) {
                pinned = false;
                videoEnded = false;
                if (escapeTimeout) clearTimeout(escapeTimeout);
                if (smoothUpdateRaf) {
                    cancelAnimationFrame(smoothUpdateRaf);
                    smoothUpdateRaf = null;
                }
                // Pause video and reset playback rate
                heroVideo.playbackRate = 1;
                heroVideo.pause();
                lastScrollY = scrollY;
                scrollRaf = null;
                return;
            }
            if (scrollY >= sectionTop - 10 && !videoEnded) {
                if (!pinned) {
                    // Pin if user scrolled from above (not from clicking nav link to section below)
                    const enteredFromAbove = lastScrollY <= sectionTop + 100 || lastScrollY === 0;
                    if (!enteredFromAbove) {
                        // User came from below (e.g. clicked nav link), don't pin
                        lastScrollY = scrollY;
                        scrollRaf = null;
                        return;
                    }
                    pinned = true;
                    pinStartTime = Date.now();
                    console.log('Hero video: Pinned! scrollY:', scrollY, 'sectionTop:', sectionTop, 'lastScrollY:', lastScrollY, 'readyState:', heroVideo.readyState, 'duration:', heroVideo.duration);
                    
                    // Escape mechanism: auto-release after 30 seconds if stuck
                    if (escapeTimeout) clearTimeout(escapeTimeout);
                    escapeTimeout = setTimeout(() => {
                        if (pinned && !videoEnded) {
                            console.warn('Hero video: Auto-releasing pin after timeout');
                            releaseAndScrollNext();
                        }
                    }, 30000); // 30 seconds
                    
                    accumulatedScroll = 0;
                    targetVideoTime = 0;
                    currentVideoTime = 0;
                    // Defer video work so first scroll doesn’t block – fixes “whole site lag”
                    // Initialize video immediately - ensure it's ready for seeking
                    heroVideo.muted = true;
                    heroVideo.preload = 'auto';
                    heroVideo.playsInline = true;
                    
                    // Initialize video for scrubbing - SIMPLIFIED VERSION
                    function initVideoForScrubbing() {
                        if (!pinned || videoEnded) return;
                        
                        console.log('Hero video: Initializing for scrubbing, readyState:', heroVideo.readyState);
                        
                        // Load video if needed
                        if (heroVideo.readyState < 2) {
                            console.log('Hero video: Loading video...');
                            heroVideo.load();
                        }
                        
                        // Wait for video to be ready, then start playing
                        function startScrubbing() {
                            if (!pinned || videoEnded) return;
                            
                            console.log('Hero video: Starting scrubbing, readyState:', heroVideo.readyState, 'duration:', heroVideo.duration);
                            
                            if (heroVideo.readyState >= 2 && heroVideo.duration && isFinite(heroVideo.duration)) {
                                cachedDuration = heroVideo.duration;
                                
                                // Start video playing (muted) - will be controlled by scroll direction
                                heroVideo.currentTime = 0;
                                heroVideo.playbackRate = 0; // Start paused, will be set by scroll
                                
                                // Ensure video is muted
                                heroVideo.muted = true;
                                
                                const playPromise = heroVideo.play();
                                
                                if (playPromise !== undefined) {
                                    playPromise.then(() => {
                                        console.log('Hero video: ✅ Playing for scrubbing, duration:', cachedDuration, 'currentTime:', heroVideo.currentTime, 'playbackRate:', heroVideo.playbackRate, 'paused:', heroVideo.paused, 'readyState:', heroVideo.readyState);
                                // Ensure video is visible
                                heroVideo.style.opacity = '1';
                                heroVideo.style.display = 'block';
                                heroVideo.style.visibility = 'visible';
                                        // Start update loop
                                        if (!smoothUpdateRaf) {
                                            lastFrameTime = performance.now();
                                            smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
                                        }
                                    }).catch((e) => {
                                        console.error('Hero video: ❌ Play failed:', e);
                                        // Try to start loop anyway - video might still work
                                        if (!smoothUpdateRaf) {
                                            lastFrameTime = performance.now();
                                            smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
                                        }
                                    });
                                } else {
                                    // Play promise not supported, try anyway
                                    console.log('Hero video: Play promise not supported, starting loop');
                                    if (!smoothUpdateRaf) {
                                        lastFrameTime = performance.now();
                                        smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
                                    }
                                }
                            } else {
                                // Wait for video to load
                                console.log('Hero video: Waiting for video to load...');
                                setTimeout(startScrubbing, 100);
                            }
                        }
                        
                        // Try to start immediately if ready
                        if (heroVideo.readyState >= 2 && heroVideo.duration && isFinite(heroVideo.duration)) {
                            console.log('Hero video: Video ready, starting scrubbing immediately');
                            startScrubbing();
                        } else {
                            // Wait for video events - but also check if already loaded
                            console.log('Hero video: Waiting for video events, current readyState:', heroVideo.readyState);
                            
                            // If video already has metadata but not readyState 2, wait a bit
                            if (heroVideo.readyState >= 1 && heroVideo.duration) {
                                setTimeout(() => {
                                    if (pinned && !videoEnded && heroVideo.readyState >= 2) {
                                        startScrubbing();
                                    }
                                }, 100);
                            }
                            
                            const onReady = () => {
                                console.log('Hero video: Video ready event fired, readyState:', heroVideo.readyState);
                                if (pinned && !videoEnded) {
                                    startScrubbing();
                                }
                            };
                            heroVideo.addEventListener('loadedmetadata', onReady, { once: true });
                            heroVideo.addEventListener('canplay', onReady, { once: true });
                            heroVideo.addEventListener('loadeddata', onReady, { once: true });
                            heroVideo.addEventListener('canplaythrough', onReady, { once: true });
                        }
                    }
                    
                    // Start initialization
                    initVideoForScrubbing();
                }
                
                // Lock scroll position - user stays in video section while scrolling
                // Video scrubs via wheel events (accumulatedScroll), not scroll position
                if (pinned && !videoEnded) {
                    // Lock scroll immediately when pinned - keep user in video section
                    const scrollDiff = Math.abs(scrollY - sectionTop);
                    if (scrollDiff > 1) {
                        // Force scroll back to section top
                        window.scrollTo({ top: sectionTop, behavior: 'auto' });
                    }
                }
                
                // Start smooth update loop if pinned and video is ready
                if (pinned && heroVideo.readyState >= 2 && cachedDuration > 0 && !smoothUpdateRaf && !entryTimeout) {
                    lastFrameTime = performance.now();
                    smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
                } else if (pinned && heroVideo.readyState >= 2 && !smoothUpdateRaf && !entryTimeout) {
                    // Initialize cached duration if not set
                    cachedDuration = heroVideo.duration && isFinite(heroVideo.duration) ? heroVideo.duration : 0;
                    if (cachedDuration > 0) {
                        lastFrameTime = performance.now();
                        smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
                    }
                }
            }
            
            lastScrollY = scrollY;
            scrollRaf = null;
        });
    }

    // Optimized wheel handler - scrubs video when pinned in video section
    function onWheel(e) {
        // Don't interfere with nav links or if video already ended
        if (window.__navLinkScrollActive || window.__userJumpedPastVideo || videoEnded) return;
        
        // Ensure sectionTop is calculated
        if (sectionTop === 0) {
            updateSectionTop();
            if (sectionTop === 0 && videoSection) {
                sectionTop = videoSection.offsetTop || videoSection.getBoundingClientRect().top + window.pageYOffset;
            }
        }
        
        const scrollY = window.pageYOffset;
        const atVideo = sectionTop > 0 && scrollY >= sectionTop - 20 && scrollY <= sectionTop + 2000;
        
        // Only handle wheel events when pinned and in video section
        if (!pinned || !atVideo) return;
        
        // Prevent default scroll - lock position, scrub video via wheel
        if (e.deltaY !== 0 && !videoEnded) {
            e.preventDefault();
            e.stopPropagation();
            isFirstScroll = false;
            
            // Get duration, use cached if available
            let duration = cachedDuration;
            if (duration <= 0 && heroVideo.duration && isFinite(heroVideo.duration)) {
                duration = heroVideo.duration;
                cachedDuration = duration;
            }
            if (duration <= 0) {
                // Try to load video metadata
                if (heroVideo.readyState < 2) {
                    heroVideo.load();
                }
                return;
            }
            
            // Determine scroll direction and speed
            // Scroll DOWN (deltaY > 0) = FORWARD play (positive playbackRate)
            // Scroll UP (deltaY < 0) = BACKWARD play (manual seeking backward)
            scrollDirection = e.deltaY > 0 ? 1 : (e.deltaY < 0 ? -1 : 0);
            lastScrollDelta = Math.abs(e.deltaY); // Store magnitude for speed calculation (always positive)
            
            // Debug: log scroll direction
            if (scrollDirection !== 0) {
                console.log('Hero video: Scroll', scrollDirection > 0 ? 'DOWN (forward)' : 'UP (backward)', 'deltaY:', e.deltaY, 'speed:', lastScrollDelta);
            }
            
            // Store scroll delta for playback rate calculation
            accumulatedScroll = Math.max(0, Math.min(duration * PIXELS_PER_SECOND, accumulatedScroll + e.deltaY));
            targetVideoTime = Math.max(0, Math.min(duration, accumulatedScroll / PIXELS_PER_SECOND));
            
            // Reset scroll direction after a short delay (for smooth deceleration)
            clearTimeout(scrollDirectionTimeout);
            scrollDirectionTimeout = setTimeout(() => {
                scrollDirection = 0;
                lastScrollDelta = 0;
            }, 50);
            
            // Check if video completed
            if (targetVideoTime >= duration - 0.05 && !videoEnded) {
                targetVideoTime = duration;
                accumulatedScroll = maxScroll;
                heroVideo.currentTime = duration;
                console.log('Hero video: Completed via scroll, releasing pin');
                // Video completed - release and scroll to next section
                releaseAndScrollNext();
                return;
            }
            
            // Start smooth update loop if not running (for interpolation)
            if (heroVideo.readyState >= 2 && !smoothUpdateRaf) {
                lastFrameTime = performance.now();
                smoothUpdateRaf = requestAnimationFrame(smoothVideoUpdate);
            }
        }
    }

    function onTouchMove(e) {
        if (!pinned || videoEnded) return;
        const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (videoSection.contains(target) || target === videoSection) {
            e.preventDefault();
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false }); // Need passive: false to preventDefault when pinned
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    heroVideo.addEventListener('ended', releaseAndScrollNext);

    heroVideo.addEventListener('loadedmetadata', () => {
        heroVideo.style.opacity = '1';
        updateSectionTop();
        lastScrollY = window.pageYOffset;
        
        // Cache duration when metadata loads
        if (heroVideo.duration && isFinite(heroVideo.duration)) {
            cachedDuration = heroVideo.duration;
            console.log('Hero video: ✅ Metadata loaded, duration:', cachedDuration, 'readyState:', heroVideo.readyState, 'src:', heroVideo.src || heroVideo.querySelector('source')?.src);
        } else {
            console.warn('Hero video: ⚠️ Metadata loaded but no valid duration', {
                readyState: heroVideo.readyState,
                duration: heroVideo.duration,
                src: heroVideo.src || heroVideo.querySelector('source')?.src
            });
        }
    });
    
    // Also listen for canplay to ensure video is ready
    heroVideo.addEventListener('canplay', () => {
        updateSectionTop();
        if (heroVideo.duration && isFinite(heroVideo.duration)) {
            cachedDuration = heroVideo.duration;
            console.log('Hero video: ✅ Can play, duration:', cachedDuration, 'readyState:', heroVideo.readyState);
        }
    });

    heroVideo.addEventListener('error', (e) => {
        console.error('Hero video: ❌ Failed to load:', e);
        console.error('Video error details:', {
            error: heroVideo.error,
            errorCode: heroVideo.error?.code,
            errorMessage: heroVideo.error?.message,
            networkState: heroVideo.networkState,
            readyState: heroVideo.readyState,
            src: heroVideo.src || heroVideo.querySelector('source')?.src,
            currentSrc: heroVideo.currentSrc
        });
        
        // Check if video file exists
        const videoSrc = heroVideo.src || heroVideo.querySelector('source')?.src;
        if (videoSrc) {
            console.error('Hero video: Check if file exists at:', videoSrc);
        }
    });

    // Throttle resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateSectionTop();
        }, 100);
    }, { passive: true });
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                heroVideo.style.opacity = '1';
                updateSectionTop();
                // Ensure video metadata is loaded when visible
                if (heroVideo.readyState < 2) {
                    heroVideo.load();
                }
            }
        }
    }, { threshold: 0 });
    observer.observe(videoSection);
    
    // Initialize video - ensure it loads
    heroVideo.style.opacity = '1';
    
    // Load video if needed
    if (heroVideo.readyState < 2) {
        heroVideo.load();
    }
    
    // Ensure sectionTop is calculated after layout
    setTimeout(() => {
        updateSectionTop();
        if (sectionTop === 0) {
            // Retry if still 0
            setTimeout(updateSectionTop, 200);
        }
    }, 200);
    
    // Also update on window load (after all resources loaded)
    window.addEventListener('load', () => {
        updateSectionTop();
        // Ensure video is loaded
        if (heroVideo.readyState < 2) {
            heroVideo.load();
        }
    });
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
            modeVideos.morning.play().catch(e => console.log('Video autoplay prevented:', e));
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
            modeVideos.morning.play().catch(e => console.log('Video play prevented:', e));
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
            // Always restart from beginning
            video.currentTime = 0;
            video.classList.add('fade-in', 'active', 'playing');
            video.classList.remove('fade-out');
            video.play().catch(e => console.log('Video play prevented:', e));
            
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
                    modeVideos.morning.play().catch(e => console.log('Video play prevented:', e));
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
            // Always restart from beginning
            newVideo.currentTime = 0;
            // Start fade in immediately for crossfade effect
            newVideo.classList.add('fade-in', 'active', 'playing');
            newVideo.classList.remove('fade-out');
            newVideo.play().catch(e => console.log('Video play prevented:', e));
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
        handleHeroVideoScroll();
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
        console.log('Video error:', e);
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
    if (video.id === 'heroVideo') return;
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(e => console.log('Video replay prevented:', e));
    });
});

