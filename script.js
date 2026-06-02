// script.js
document.addEventListener("DOMContentLoaded", () => {
    // GitHub Pages SPA Trick: 404.html saves the original path, we restore it here
    // so that the URL bar shows the real URL and getGuestNameFromPath() works correctly.
    const savedSpaPath = sessionStorage.getItem('spa_redirect_path');
    if (savedSpaPath) {
        sessionStorage.removeItem('spa_redirect_path');
        window.history.replaceState(null, null, savedSpaPath);
    }

    // 1. Get Guest Name from URL path: /invitation/nama+tamu
    //    Falls back to query string ?to=Nama for backward compatibility
    const guestNameElement = document.getElementById('guest-name');

    function toTitleCase(str) {
        return str.replace(/\b\w/g, c => c.toUpperCase());
    }

    function getGuestNameFromPath() {
        const path = window.location.pathname;
        // Match anything after /invitation/ in the path
        const match = path.match(/\/invitation\/(.+)/);
        if (match && match[1]) {
            // Replace + with space, then decode %xx sequences
            const decoded = decodeURIComponent(match[1].replace(/\+/g, ' '));
            return toTitleCase(decoded.trim());
        }
        return null;
    }

    const guestFromPath = getGuestNameFromPath();
    const guestFromQuery = new URLSearchParams(window.location.search).get('to');
    const resolvedGuest = guestFromPath || guestFromQuery;

    if (resolvedGuest && guestNameElement) {
        guestNameElement.textContent = resolvedGuest;
    }

    // 2. Open Invitation Logic
    const btnBuka = document.getElementById('btn-buka-undangan');
    const coverSection = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const heroVideo = document.getElementById('hero-video');

    // Keep cover state active on load to darken the background video, lock scroll completely
    document.body.classList.add('cover-active');
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    // Auto-preload the video 2 seconds after page load so it has time to buffer.
    // This way, on slow connections the video is already partially buffered by the
    // time the user clicks "Buka Undangan".
    let videoPreloaded = false;
    const preloadVideos = () => {
        if (videoPreloaded) return;
        videoPreloaded = true;
        if (heroVideo && !heroVideo.hasAttribute('data-preloaded')) {
            heroVideo.setAttribute('poster', 'Foto Pasangan/MONO0357-Edit.webp');
            heroVideo.preload = 'auto';
            heroVideo.load();
            heroVideo.setAttribute('data-preloaded', 'true');
        }
    };

    // Start buffering automatically after 2s (page is already painted by then)
    setTimeout(preloadVideos, 2000);

    // Also trigger on user interaction as a guaranteed fallback
    btnBuka.addEventListener('mousedown', preloadVideos);
    btnBuka.addEventListener('touchstart', preloadVideos, { passive: true });

    btnBuka.addEventListener('click', () => {
        // Show loading state on button
        btnBuka.disabled = true;
        btnBuka.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuka...';

        const openInvitation = () => {
            // Slide up cover
            coverSection.classList.add('slide-up');

            // Show main content and unlock scroll
            mainContent.classList.remove('hidden');
            document.documentElement.classList.remove('scroll-locked');
            document.body.classList.remove('scroll-locked');

            // Refresh AOS immediately to recalculate coordinates of revealed elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }

            // Play music
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            }).catch(error => console.log("Audio play failed: ", error));

            // Play hero video
            if (heroVideo) {
                heroVideo.play().catch(error => console.log("Hero video play failed: ", error));
            }

            // Wait for slide up animation then hide cover completely
            document.body.classList.remove('cover-active');
            setTimeout(() => {
                coverSection.style.display = 'none';
                if (typeof AOS !== 'undefined') AOS.refresh();
            }, 1000);
        };

        if (heroVideo && heroVideo.readyState >= 3) {
            // Video has enough data buffered — open immediately
            openInvitation();
        } else if (heroVideo) {
            // Wait for video to buffer enough (canplay = enough data to start)
            // On very slow connections, apply a 4-second max timeout as fallback
            const timeout = setTimeout(openInvitation, 4000);
            heroVideo.addEventListener('canplay', () => {
                clearTimeout(timeout);
                openInvitation();
            }, { once: true });
            // Make sure video is loading
            preloadVideos();
        } else {
            openInvitation();
        }
    });

    const butterflySrc = 'Foto Background/Kupu-kupu.gif';

    // Inject butterfly-layer into every slide dynamically (if not already present in HTML)
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        if (!slide.querySelector('.butterfly-layer')) {
            const layer = document.createElement('div');
            layer.className = 'butterfly-layer hidden';
            layer.setAttribute('aria-hidden', 'true');
            // Insert at the beginning of the slide so it positions correctly
            slide.insertBefore(layer, slide.firstChild);
        }
    });

    // Inject lush floral decorations into every slide (except slide-hero)
    const floralPositions = [
        'floral-top-left', 'floral-top-right',
        'floral-bottom-left', 'floral-bottom-right',
        'floral-mid-left', 'floral-mid-right'
    ];
    slides.forEach(slide => {
        if (slide.classList.contains('slide-hero')) return; // Skip opening video slide
        if (slide.querySelector('.floral-corner')) return; // Already injected
        floralPositions.forEach(pos => {
            const flower = document.createElement('div');
            flower.className = `floral-corner ${pos}`;
            flower.setAttribute('aria-hidden', 'true');
            slide.appendChild(flower);
        });
    });

    // Helper to create a butterfly in a specific layer
    const createButterflyInLayer = (layer) => {
        if (!layer) return;

        const butterfly = document.createElement('img');
        butterfly.classList.add('butterfly');
        butterfly.src = butterflySrc;
        butterfly.alt = '';
        butterfly.setAttribute('aria-hidden', 'true');

        const vw = layer.clientWidth || window.innerWidth;
        const vh = layer.clientHeight || window.innerHeight;
        const size = Math.floor(Math.random() * 20 + 24); // elegant size
        butterfly.style.width = `${size}px`;

        // Choose a spawn edge and opposite exit edge
        const edges = ['left', 'right', 'top', 'bottom'];
        const edge = edges[Math.floor(Math.random() * edges.length)];
        let startX, startY, endX, endY;

        if (edge === 'left') {
            startX = -Math.round(size * 1.5);
            startY = Math.random() * vh;
            endX = vw + Math.round(size * 1.5);
            endY = Math.random() * vh;
        } else if (edge === 'right') {
            startX = vw + Math.round(size * 1.5);
            startY = Math.random() * vh;
            endX = -Math.round(size * 1.5);
            endY = Math.random() * vh;
        } else if (edge === 'top') {
            startX = Math.random() * vw;
            startY = -Math.round(size * 1.5);
            endX = Math.random() * vw;
            endY = vh + Math.round(size * 1.5);
        } else { // bottom
            startX = Math.random() * vw;
            startY = vh + Math.round(size * 1.5);
            endX = Math.random() * vw;
            endY = -Math.round(size * 1.5);
        }

        butterfly.style.left = `${startX}px`;
        butterfly.style.top = `${startY}px`;

        const midX = startX + (endX - startX) * (0.3 + Math.random() * 0.4) + (Math.random() * vw * 0.06 - vw * 0.03);
        const midY = startY + (endY - startY) * (0.3 + Math.random() * 0.4) + (Math.random() * vh * 0.08 - vh * 0.04);

        const duration = Math.floor(8000 + Math.random() * 10000); // smooth cinematic flight
        const delay = Math.random() * 600;

        layer.appendChild(butterfly);

        const rotate1 = (Math.random() * 40 - 20).toFixed(1);
        const rotate2 = (Math.random() * 40 - 20).toFixed(1);

        const keyframes = [
            { transform: `translate(0px, 0px) rotate(${rotate1}deg)`, opacity: 0, offset: 0 },
            { transform: `translate(${midX - startX}px, ${midY - startY}px) rotate(${(rotate1 - rotate2) / 2}deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${rotate2}deg)`, opacity: 0, offset: 1 }
        ];

        const anim = butterfly.animate(keyframes, {
            duration,
            delay,
            easing: 'cubic-bezier(0.22, 0.8, 0.25, 1)',
            fill: 'forwards'
        });

        // wing flutter using CSS animation overlay
        butterfly.style.animation = `flutter ${Math.max(3, duration / 1000)}s ease-in-out infinite`;

        anim.onfinish = () => {
            butterfly.remove();
        };
    };

    // Start/Stop butterfly spawn logic for a specific slide
    const startSlideButterflies = (slide, layer) => {
        if (!layer) return;
        layer.classList.remove('hidden');
        layer.classList.add('visible');

        // Spawn initial burst
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                if (layer.classList.contains('visible')) {
                    createButterflyInLayer(layer);
                }
            }, i * 350);
        }

        // Setup periodic spawning
        if (!slide.butterflyInterval) {
            slide.butterflyInterval = setInterval(() => {
                if (layer.classList.contains('visible')) {
                    createButterflyInLayer(layer);
                }
            }, 2500);
        }
    };

    const stopSlideButterflies = (slide, layer) => {
        if (slide.butterflyInterval) {
            clearInterval(slide.butterflyInterval);
            slide.butterflyInterval = null;
        }
        if (layer) {
            layer.classList.remove('visible');
            layer.classList.add('hidden');
            layer.innerHTML = ''; // Clean up existing elements to save memory
        }
    };

    // Control flag for opening slide video ending
    window.heroVideoEnded = false;

    // IntersectionObserver to dynamically handle butterflies based on user viewport scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // trigger when 15% of the slide is on screen
    };

    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const slide = entry.target;
            const layer = slide.querySelector('.butterfly-layer');
            if (!layer) return;

            if (entry.isIntersecting) {
                // Slide 1 (slide-hero) only spawns butterflies after the opening video ends
                if (slide.classList.contains('slide-hero')) {
                    if (window.heroVideoEnded) {
                        startSlideButterflies(slide, layer);
                    }
                } else {
                    startSlideButterflies(slide, layer);
                }
            } else {
                stopSlideButterflies(slide, layer);
            }
        });
    }, observerOptions);

    slides.forEach(slide => slideObserver.observe(slide));

    // Listen for hero video end to trigger butterflies and scroll indicator
    if (heroVideo) {
        heroVideo.addEventListener('ended', () => {
            heroVideo.pause();

            // Set flag so hero slide observer knows video has ended
            window.heroVideoEnded = true;

            // Instantly start butterflies on Slide 1
            const heroSlide = document.querySelector('.slide-hero');
            if (heroSlide) {
                const layer = heroSlide.querySelector('.butterfly-layer');
                startSlideButterflies(heroSlide, layer);
            }

            const scrollIndicator = document.getElementById('scroll-indicator');
            if (scrollIndicator) {
                scrollIndicator.classList.add('show');
            }
        });
    }

    // Hide scroll indicator on user scroll
    window.addEventListener('scroll', () => {
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (scrollIndicator && window.scrollY > 20) {
            scrollIndicator.classList.remove('show');
        }
    }, { passive: true });

    // Music play/pause (mute/unmute) toggle
    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicToggle.classList.add('playing');
                    musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                }).catch(err => console.log(err));
            } else {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
                musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
    }

    // 3. Fading Images (Slide 4)
    const fadeImages = document.querySelectorAll('.fade-img');
    let currentImageIndex = 0;

    if (fadeImages.length > 0) {
        setInterval(() => {
            fadeImages[currentImageIndex].classList.remove('active');
            currentImageIndex = (currentImageIndex + 1) % fadeImages.length;
            fadeImages[currentImageIndex].classList.add('active');
        }, 3000); // 3 seconds
    }

    // Cover slideshow on desktop
    const coverSlides = document.querySelectorAll('.cover-slideshow .slide-img');
    let coverSlideIndex = 0;
    if (coverSlides.length > 0) {
        setInterval(() => {
            coverSlides[coverSlideIndex].classList.remove('active');
            coverSlideIndex = (coverSlideIndex + 1) % coverSlides.length;
            coverSlides[coverSlideIndex].classList.add('active');
        }, 3500);
    }

    // Manual and continuous QS Ar-Rum photo slider
    const quranSlider = document.querySelector('.quran-photo-slider');
    const quranTrack = document.querySelector('.quran-photo-track');
    if (quranSlider && quranTrack) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartOffset = 0;
        let currentOffset = 0;
        let lastTimestamp = null;
        const speed = 12; // slow, beautiful, cinematic movement (12px per second)

        const clampOffset = () => {
            const totalWidth = quranTrack.scrollWidth;
            const halfWidth = totalWidth / 2;
            if (currentOffset <= -halfWidth) {
                currentOffset += halfWidth;
            }
            if (currentOffset > 0) {
                currentOffset -= halfWidth;
            }
        };

        const animate = (timestamp) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const delta = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            if (!isDragging) {
                currentOffset -= (speed * delta) / 1000;
                clampOffset();
                quranTrack.style.transform = `translateX(${currentOffset}px)`;
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        const startDrag = (clientX) => {
            isDragging = true;
            dragStartX = clientX;
            dragStartOffset = currentOffset;
            quranSlider.classList.add('dragging');
        };

        const moveDrag = (clientX) => {
            if (!isDragging) return;
            const delta = clientX - dragStartX;
            currentOffset = dragStartOffset + delta;
            clampOffset();
            quranTrack.style.transform = `translateX(${currentOffset}px)`;
        };

        const endDrag = () => {
            isDragging = false;
            quranSlider.classList.remove('dragging');
        };

        quranSlider.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            startDrag(event.clientX);
            quranSlider.setPointerCapture(event.pointerId);
        });

        quranSlider.addEventListener('pointermove', (event) => {
            moveDrag(event.clientX);
        });

        quranSlider.addEventListener('pointerup', () => endDrag());
        quranSlider.addEventListener('pointercancel', () => endDrag());
        quranSlider.addEventListener('pointerleave', () => endDrag());
    }

    // 4. Countdown Timer to 20 June 2026 08:00 WIB (UTC+7)
    const targetDate = new Date("2026-06-20T08:00:00+07:00").getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    if (daysEl) {
        setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                daysEl.textContent = days.toString().padStart(2, '0');
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minsEl.textContent = minutes.toString().padStart(2, '0');
                secsEl.textContent = seconds.toString().padStart(2, '0');
            }
        }, 1000);
    }

    // 5. Initialize AOS for Scroll Animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true, // animate only once so elements don't disappear on scroll
            offset: 60,
            duration: 900,
            easing: 'ease-out-cubic'
        });
    }

    // 6. Wishes Form Submission
    const wishesForm = document.getElementById('wishes-form');
    const wishesList = document.getElementById('wishes-list');

    if (wishesForm) {
        wishesForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('wish-name').value;
            const text = document.getElementById('wish-text').value;
            const attendance = document.getElementById('wish-attendance').value;

            let badgeClass = 'badge-hadir';
            if (attendance === 'Tidak Hadir') badgeClass = 'badge-tidak-hadir';
            if (attendance === 'Masih Ragu') badgeClass = 'badge-ragu';

            const newWish = document.createElement('div');
            newWish.classList.add('wish-item');
            newWish.innerHTML = `
                <strong>${name}</strong> <span class="badge ${badgeClass}">${attendance}</span>
                <p>${text}</p>
            `;

            // Add to top of list
            wishesList.insertBefore(newWish, wishesList.firstChild);

            // Reset form
            wishesForm.reset();
        });
    }

    // 7. Particle Generator
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + 'vw';

            // Random gold/champagne colors
            const hues = [35, 45, 50, 40];
            const hue = hues[Math.floor(Math.random() * hues.length)];
            particle.style.background = `radial-gradient(circle, hsl(${hue}, 80%, 70%) 0%, hsla(${hue}, 80%, 70%, 0) 70%)`;

            particle.style.animationDuration = Math.random() * 8 + 8 + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.3;

            const size = Math.random() * 6 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            particlesContainer.appendChild(particle);
            setTimeout(() => {
                particle.remove();
            }, 16000);
        };

        // Populate initially
        for (let i = 0; i < 20; i++) {
            setTimeout(createParticle, Math.random() * 5000);
        }
        setInterval(createParticle, 550);
    }

    // 8. Gallery Lightbox Modal
    const galleryImages = document.querySelectorAll('.gallery-grid img');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (galleryImages.length > 0 && lightbox && lightboxImg) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.classList.add('lightbox-open');
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        // Close when clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});

// Copy Rekening Function (Global)
function copyRekening(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Nomor rekening berhasil disalin: " + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
