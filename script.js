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

    const videoSection = document.querySelector('.hero-video-section');

    function isOverVideoSection() {
        if (!videoSection) return false;
        const rect = videoSection.getBoundingClientRect();
        const barHeight = navbar.offsetHeight;
        return rect.top < barHeight && rect.bottom > barHeight;
    }

    function showNavbar() {
        if (isOverVideoSection()) {
            // Gone at once: a slide-out would still pass over the picture
            navbar.style.transition = 'none';
            hideNavbar();
            void navbar.offsetHeight;
            navbar.style.transition = '';
            return;
        }
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

// A failed <source> fires 'error' on the source, not on the <video>
function onVideoFail(video, cb) {
    const sources = video.querySelectorAll('source');
    (sources.length ? sources[sources.length - 1] : video).addEventListener('error', cb);
}

// Runs cb once when el comes within margin of the viewport
function whenNear(el, cb, margin = '800px') {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
            io.disconnect();
            cb();
        }
    }, { rootMargin: margin });
    io.observe(el);
}

// Images fade in once decoded (under .img-fade, polish.css keeps them transparent until .img-loaded)
function markLoadedImages() {
    document.querySelectorAll('img').forEach(img => {
        if (img.complete && img.naturalWidth) img.classList.add('img-loaded');
    });
}
document.addEventListener('load', (e) => {
    if (e.target && e.target.tagName === 'IMG') e.target.classList.add('img-loaded');
}, true);
markLoadedImages();
document.documentElement.classList.add('img-fade');
document.addEventListener('DOMContentLoaded', markLoadedImages);

// Phone site opened on a section (mobile.html#contact): content loading above it pushes it
// down after the browser's jump, so stay on it until the page settles or the visitor moves
function holdHashTarget() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target || !document.documentElement.classList.contains('site-mobile')) return;
    const align = () => target.scrollIntoView({ behavior: 'instant', block: 'start' });
    const observer = new ResizeObserver(align);
    const release = () => {
        observer.disconnect();
        ['touchstart', 'wheel', 'keydown'].forEach(type => window.removeEventListener(type, release));
    };
    ['touchstart', 'wheel', 'keydown'].forEach(type => window.addEventListener(type, release, { passive: true }));
    observer.observe(document.body);
    setTimeout(release, 6000);
}
holdHashTarget();

// Cards rendered after their grid already scrolled into view still need to reveal
function revealRenderedCards() {
    document.querySelectorAll('.services-grid.animate .service-card, .products-scroll-wrapper.animate .product-card, .gallery-scroll-wrapper.animate .gallery-item').forEach(card => {
        card.classList.add('animate');
    });
}

// Admin-entered text goes into HTML templates; a quote or < must not break the markup
function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

// Load and render products from JSON
async function loadSiteData() {
    const servicesGrid  = document.getElementById('servicesGrid');
    const clientsTrack  = document.getElementById('clientsTrack');
    if (!servicesGrid && !clientsTrack) return;
    try {
        const res  = await fetch('data/site.json?v=' + Date.now());
        const data = await res.json();
        const isMobile = document.documentElement.classList.contains('site-mobile');

        if (servicesGrid && data.services) {
            servicesGrid.innerHTML = data.services.map(s => isMobile
                ? `<div class="service-card">
                        <div class="service-thumb"><img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.name)}" loading="lazy" decoding="async" onerror="this.parentElement.style.background='#dbeafe';this.style.display='none'"></div>
                        <div><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p></div>
                   </div>`
                : `<div class="service-card">
                        <div class="service-image"><img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.name)}" loading="lazy" decoding="async" onerror="this.style.display='none'"></div>
                        <h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p>
                   </div>`
            ).join('');
        }

        if (clientsTrack && data.clients) {
            const logos = data.clients.map(c =>
                `<div class="client-logo"><img data-src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.name)}" decoding="async" onerror="this.parentElement.classList.add('placeholder')"></div>`
            ).join('');
            clientsTrack.innerHTML = logos + logos;
            // Lazy as a group: native lazy-loading would pop logos in one by one as the track moves
            whenNear(clientsTrack, () => {
                clientsTrack.querySelectorAll('img[data-src]').forEach(img => { img.src = img.dataset.src; });
            });
        }
        revealRenderedCards();
    } catch(e) { console.warn('loadSiteData failed', e); }
}

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
                        <img src="${escapeHtml(encodeURI(product.image))}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236b7280%22 font-family=%22Arial%22 font-size=%2214%22%3E${encodeURIComponent(product.name).replace(/'/g, '%27')}%3C/text%3E%3C/svg%3E';">
                    </div>
                    <div class="product-label">${escapeHtml(product.name)}</div>
                    <p class="product-caption">${escapeHtml(product.caption)}</p>
                </div>
            `).join('');
        }
        
        // Render gallery
        if (galleryWrapper && data.gallery) {
            const sortedGallery = [...data.gallery].sort((a, b) => (a.order || 0) - (b.order || 0));
            galleryWrapper.innerHTML = sortedGallery.map((item, idx) => `
                <div class="gallery-item animate" data-gallery-index="${idx}" style="cursor:pointer;">
                    <img src="${escapeHtml(encodeURI(item.image))}" alt="${escapeHtml(item.alt)}" class="gallery-image" loading="lazy" decoding="async">
                </div>
            `).join('');
            // Wire up lightbox after render
            initGalleryLightbox(galleryWrapper, sortedGallery);
        }
        revealRenderedCards();
    } catch (e) {
        console.error('Error loading products:', e);
    }
}

// ── Gallery Lightbox ──────────────────────────────────────────────────────────
function initGalleryLightbox(wrapper, images) {
    // Build lightbox DOM once
    if (!document.getElementById('galleryLightbox')) {
        const lb = document.createElement('div');
        lb.id = 'galleryLightbox';
        lb.innerHTML = `
            <div class="glb-backdrop"></div>
            <button class="glb-close" aria-label="Close"><i class="fas fa-times"></i></button>
            <button class="glb-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
            <button class="glb-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
            <div class="glb-img-wrap">
                <img class="glb-img" src="" alt="">
                <div class="glb-counter"></div>
            </div>`;
        document.body.appendChild(lb);
    }

    const lb       = document.getElementById('galleryLightbox');
    const img      = lb.querySelector('.glb-img');
    const counter  = lb.querySelector('.glb-counter');
    const btnPrev  = lb.querySelector('.glb-prev');
    const btnNext  = lb.querySelector('.glb-next');
    let current    = 0;
    let touchStartX = null;

    function show(idx) {
        current = (idx + images.length) % images.length;
        img.src = encodeURI(images[current].image);
        img.alt = images[current].alt;
        counter.textContent = (current + 1) + ' / ' + images.length;
        btnPrev.style.display = images.length > 1 ? '' : 'none';
        btnNext.style.display = images.length > 1 ? '' : 'none';
        lb.classList.add('glb-open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('glb-open');
        document.body.style.overflow = '';
        img.src = '';
    }

    // Click on gallery items
    wrapper.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => show(parseInt(item.dataset.galleryIndex, 10)));
    });

    btnPrev.addEventListener('click', () => show(current - 1));
    btnNext.addEventListener('click', () => show(current + 1));
    lb.querySelector('.glb-backdrop').addEventListener('click', close);
    lb.querySelector('.glb-close').addEventListener('click', close);

    // Keyboard
    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('glb-open')) return;
        if (e.key === 'ArrowLeft')  show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
        if (e.key === 'Escape')     close();
    });

    // Touch swipe
    lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) dx < 0 ? show(current + 1) : show(current - 1);
        touchStartX = null;
    });
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
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
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
    const scrollHint = document.getElementById('heroScrollHint');

    const forward = [1, 2, 3].map(n => document.getElementById('heroVideo' + n));
    const lastFrame = document.getElementById('heroVideo3R'); // opens on clip 3's final frame, for arriving by scrollbar
    const layers = forward.concat(lastFrame);

    if (!videoSection || !nextSection || layers.some(v => !v)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // No scroll-driven playback: show the first clip's poster and drop the scroll prompt
        forward[0].style.opacity = '1';
        if (scrollHint) scrollHint.classList.add('is-done');
        return;
    }

    const ENGAGE_RANGE = 180;    // px from aligned at which the section takes over scrolling
    const NEW_GESTURE_GAP = 120; // ms of wheel silence that means a fresh scroll, not trackpad inertia
    const STEP_COOLDOWN = 800;   // ms after a clip ends before continuous scrolling may start the next
    const CONTINUE_TRAVEL = 300; // px of continuous scrolling after a clip that means more than an inertia tail
    const QUEUE_HOLD = 120;      // ms the finished frame stays up before a scroll made during the clip runs
    const INPUT_WINDOW = 800;    // ms after input in which a page movement counts as the visitor's scrolling
    const READY_TIMEOUT = 2500;  // ms to wait for a clip that hasn't buffered before letting the page scroll

    let pos = 0;           // clips finished: 0 = before clip 1, 3 = after clip 3
    let engaged = false;   // section holds the scroll and each step plays a clip
    let isPlaying = false;
    let disabled = false;
    let gliding = false;   // the page is moving under glideTo()
    let glideFrame = 0;
    let queuedStep = false; // scroll made while a clip played, run when it ends
    let lastInputAt = 0;
    let stepEndedAt = 0;
    let recentTravel = 0;  // px of input that may still be on its way, used to catch a fast scroll in time
    let travelSinceStep = 0;
    let lastTop = videoSection.getBoundingClientRect().top;
    let shown = forward[0];

    layers.forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.pause();
        video.style.transition = 'opacity 0.12s linear';
        video.style.opacity = video === shown ? '1' : '0';
    });

    // Load the clips once the hero image is done so they don't compete with it
    const preloadClips = () => layers.forEach(video => {
        video.preload = 'auto';
        video.load();
    });
    if (document.readyState === 'complete') preloadClips();
    else window.addEventListener('load', preloadClips, { once: true });

    // Clip boundaries match, so the new layer fades in over the old one's held frame (no dip to the background)
    function show(video) {
        if (video === shown) return;
        const previous = shown;
        shown = video;
        layers.forEach(v => {
            if (v !== video && v !== previous) { v.style.opacity = '0'; v.style.zIndex = '0'; }
        });
        previous.style.zIndex = '99';
        video.style.zIndex = '100';
        video.style.opacity = '1';
        setTimeout(() => {
            if (shown !== previous) { previous.style.opacity = '0'; previous.style.zIndex = '0'; }
        }, 160);
    }

    function setPos(next) {
        pos = next;
        if (scrollHint) scrollHint.classList.toggle('is-done', pos === 3);
    }

    function release() {
        engaged = false;
        queuedStep = false;
    }

    function bypassVideoSection() {
        disabled = true;
        release();
        isPlaying = false;
        setPos(3);
        videoSection.style.display = 'none';
    }

    let failedClips = 0;
    forward.forEach(video => {
        onVideoFail(video, () => {
            failedClips++;
            if (failedClips >= 2) bypassVideoSection();
        });
    });

    // Frame by frame, so it also cuts off whatever the browser's own wheel animation still had queued
    function glideTo(element, onDone) {
        cancelAnimationFrame(glideFrame);
        const from = window.scrollY;
        const targetTop = () => element.getBoundingClientRect().top + window.scrollY;
        const duration = Math.min(550, 220 + Math.abs(targetTop() - from) * 0.5);
        const startedAt = performance.now();
        gliding = true;
        const frame = (now) => {
            const t = Math.min(1, Math.max(0, (now - startedAt) / duration));
            const eased = 1 - Math.pow(1 - t, 3);
            window.scrollTo({ top: from + (targetTop() - from) * eased, behavior: 'instant' });
            if (t < 1) { glideFrame = requestAnimationFrame(frame); return; }
            gliding = false;
            lastTop = videoSection.getBoundingClientRect().top;
            onDone();
        };
        glideFrame = requestAnimationFrame(frame);
    }

    function playLayer(video, onDone) {
        isPlaying = true;

        const start = () => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                clearTimeout(watchdog);
                video.removeEventListener('ended', finish);
                video.pause();
                show(video);
                isPlaying = false;
                stepEndedAt = performance.now();
                travelSinceStep = 0;
                onDone();
                if (engaged) runQueued();
                else syncIfOffScreen(); // the visitor left mid-clip
            };
            const watchdog = setTimeout(finish, (video.duration || 2) * 1000 + 1500);
            video.addEventListener('ended', finish);

            try { video.currentTime = 0; } catch (e) {}
            if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(() => show(video));
            else video.addEventListener('playing', () => show(video), { once: true });
            video.play().catch(finish);
        };

        if (video.readyState >= 2) { start(); return; }

        // Still buffering: never trap the visitor on a clip that isn't ready
        const onReady = () => { clearTimeout(giveUp); start(); };
        const giveUp = setTimeout(() => {
            video.removeEventListener('canplay', onReady);
            release();
            isPlaying = false;
            setPos(3);
            syncToPosition();
        }, READY_TIMEOUT);
        video.addEventListener('canplay', onReady, { once: true });
        if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
    }

    // Show the right still when the visitor got here without playing the clips (scrollbar, anchor link)
    function syncToPosition() {
        const target = pos === 3 ? lastFrame : forward[0];
        if (pos === 3 && shown === forward[2]) return;
        if (pos === 0 && shown === forward[0] && forward[0].currentTime < 0.05) return;
        try { target.currentTime = 0; } catch (e) {}
        show(target);
    }

    function syncIfOffScreen() {
        const rect = videoSection.getBoundingClientRect();
        if (rect.bottom <= 0 && pos !== 3) { setPos(3); syncToPosition(); }
        else if (rect.top >= window.innerHeight && pos !== 0) { setPos(0); syncToPosition(); }
    }

    function runQueued() {
        if (!queuedStep) return;
        queuedStep = false;
        setTimeout(() => {
            if (engaged && !isPlaying && !gliding) advance();
        }, QUEUE_HOLD);
    }

    // Plays the next clip, or moves on to the next section after the last one
    function advance() {
        if (pos < 3) {
            const clip = pos;
            playLayer(forward[clip], () => setPos(clip + 1));
            return;
        }
        release();
        glideTo(nextSection, () => {});
    }

    // Runs one scroll step. Returns true when the section consumed the input.
    function step(dir, isFreshInput) {
        if (disabled || window.__navLinkScrollActive) return false;

        // Scrolling up is always the page's own: no stop, no clips
        if (dir < 0) {
            if (gliding) { cancelAnimationFrame(glideFrame); gliding = false; }
            release();
            return false;
        }

        if (gliding) return true;

        if (!engaged) {
            const rect = videoSection.getBoundingClientRect();
            if (pos >= 3 || rect.top > ENGAGE_RANGE + recentTravel || rect.bottom <= 100) return false;
            engaged = true;
            glideTo(videoSection, () => {
                stepEndedAt = performance.now();
                travelSinceStep = 0;
                if (!isPlaying) advance();
            });
            return true;
        }

        if (isPlaying) {
            if (isFreshInput) queuedStep = true;
            return true;
        }
        if (!isFreshInput && (performance.now() - stepEndedAt < STEP_COOLDOWN || travelSinceStep < CONTINUE_TRAVEL)) return true;

        advance();
        return true;
    }

    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey || !e.deltaY) return;
        const now = performance.now();
        const isFreshInput = now - lastInputAt > NEW_GESTURE_GAP;
        const scale = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
        const travel = Math.abs(e.deltaY) * scale;
        recentTravel = (isFreshInput ? 0 : recentTravel * 0.6) + travel;
        travelSinceStep += travel;
        lastInputAt = now;
        if (step(e.deltaY > 0 ? 1 : -1, isFreshInput)) e.preventDefault();
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        const typing = e.target.closest && e.target.closest('input, textarea, select, button, a, [contenteditable]');
        if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
        let dir = 0;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
        if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
        if (!dir) return;
        lastInputAt = performance.now();
        recentTravel = e.key.startsWith('Arrow') ? 60 : window.innerHeight;
        if (e.repeat ? (dir > 0 && (engaged || gliding)) : step(dir, true)) e.preventDefault();
    });

    // Touch laptops and tablets in desktop mode: a swipe is one step
    let touchY = null;
    window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        lastInputAt = performance.now();
        recentTravel = 0;
        if (touchY === null) return;
        const dy = touchY - e.touches[0].clientY;
        if (Math.abs(dy) > 24) {
            touchY = null;
            if (step(dy > 0 ? 1 : -1, true) && e.cancelable) e.preventDefault();
        } else if ((engaged || gliding) && e.cancelable) {
            e.preventDefault();
        }
    }, { passive: false });

    // Scrollbar drags and anchor links move the page without going through step()
    let scrollQueued = false;
    window.addEventListener('scroll', () => {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(() => {
            scrollQueued = false;
            if (disabled || gliding) return;
            const rect = videoSection.getBoundingClientRect();
            const height = window.innerHeight;
            const previousTop = lastTop;
            lastTop = rect.top;
            if (window.__navLinkScrollActive) release();
            if (engaged) {
                if (Math.abs(rect.top) > height * 0.6) release();
                else if (Math.abs(rect.top) > 1) { // hold the section still against leftover scrolling
                    window.scrollTo({ top: rect.top + window.scrollY, behavior: 'instant' });
                    lastTop = 0;
                    return;
                }
            }
            if (engaged) return;
            // A scroll fast enough to slip past the wheel check still stops here
            const crossed = previousTop > 0 && rect.top <= 0;
            if (crossed && performance.now() - lastInputAt < INPUT_WINDOW && step(1, true)) return;
            syncIfOffScreen();
        });
    }, { passive: true });
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
    
    // Fetch them only as the section approaches, so they don't slow the first paint
    if (videoModesSection) whenNear(videoModesSection, preloadVideos);
    else preloadVideos();
    
    // Function to start morning mode
    function startMorningMode() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    
    // Show the morning poster straight away instead of an empty band
    if (modeVideos.morning) modeVideos.morning.classList.add('active');

    // Play the chosen mode only while the section is on screen
    if (videoModesSection && modeVideos.morning) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = modeVideos[currentMode];
                if (!video) return;
                if (!entry.isIntersecting) {
                    video.pause();
                } else if (currentMode === 'morning' && !morningModeStarted) {
                    startMorningMode();
                } else if (video.paused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    && !(video.duration && video.currentTime >= video.duration - 0.05)) {
                    // Resume, unless it already finished and is holding its last frame
                    video.play().catch(() => {});
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
    const modeHint = document.getElementById('modeControlsHint') || document.getElementById('modeHint');
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
        loadSiteData();
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
                        }, Math.min(index, 6) * 70);
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
    onVideoFail(video, () => {
        video.style.display = 'none';
        // If a mode video fails, hide its parent section so layout doesn't break
        const modeSection = video.closest('.video-modes-section');
        if (modeSection) {
            const allFailed = Array.from(modeSection.querySelectorAll('video')).every(v => v.style.display === 'none');
            if (allFailed) modeSection.style.display = 'none';
        }
    });
    // Hero video is scroll-to-scrub; don't loop it
    // Mobile hero videos are scrub-controlled; don't loop them either
    if (video.id === 'heroVideo' || video.classList.contains('hero-video-layer') || video.classList.contains('mobile-hero-video') || video.classList.contains('mode-video')) return;
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
    });
});

// About video: fetch and play only while on screen
document.addEventListener('DOMContentLoaded', () => {
    const aboutVideo = document.querySelector('.about-image-img, .about-video');
    if (!aboutVideo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) aboutVideo.play().catch(() => {});
            else aboutVideo.pause();
        });
    }, { rootMargin: '200px' }).observe(aboutVideo);
});
