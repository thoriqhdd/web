// script.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. Get Guest Name from URL ?to=Name
    const urlParams = new URLSearchParams(window.location.search);
    const guestNameParam = urlParams.get('to');
    const guestNameElement = document.getElementById('guest-name');
    if (guestNameParam) {
        guestNameElement.textContent = guestNameParam;
    }

    // 2. Open Invitation Logic
    const btnBuka = document.getElementById('btn-buka-undangan');
    const coverSection = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const bgVideo = document.getElementById('bg-video');
    const musicToggle = document.getElementById('music-toggle');

    // Keep cover state active on load to darken the background video
    document.body.classList.add('cover-active');
    document.body.style.overflow = 'hidden';

    // Ensure video is loaded but paused on page load so it's visible
    const showBgFrame = () => {
        if (!bgVideo) return;
        bgVideo.muted = true;
        bgVideo.pause();
        bgVideo.currentTime = 0;
    };

    if (bgVideo) {
        bgVideo.addEventListener('loadeddata', showBgFrame);
        if (bgVideo.readyState >= 2) {
            showBgFrame();
        }
    }

    btnBuka.addEventListener('click', () => {
        // Slide up cover
        coverSection.classList.add('slide-up');
        
        // Show main content and unlock scroll
        mainContent.classList.remove('hidden');
        document.body.style.overflow = 'auto';

        // Play music
        bgMusic.load();
        bgMusic.play().then(() => {
            musicToggle.classList.add('playing');
        }).catch(error => console.log("Audio play failed: ", error));
        
        // Ensure video is playing (user gesture)
        if (bgVideo) {
            bgVideo.play().catch(error => console.log("Video play failed: ", error));
        }

        // Wait for slide up animation then hide cover completely
        document.body.classList.remove('cover-active');
        setTimeout(() => {
            coverSection.style.display = 'none';
            AOS.refresh();
        }, 1000);
    });

    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.addEventListener('ended', () => {
            heroVideo.pause();
        });
    }

    // Music play/pause toggle
    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicToggle.classList.add('playing');
                }).catch(err => console.log(err));
            } else {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
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
        const speed = 25; // slower continuous movement pixels per second

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

    // 4. Countdown Timer to 20 June 2026
    const targetDate = new Date("June 20, 2026 08:00:00").getTime();
    
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
            if(attendance === 'Tidak Hadir') badgeClass = 'badge-tidak-hadir';
            if(attendance === 'Masih Ragu') badgeClass = 'badge-ragu';

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
        for(let i = 0; i < 20; i++) {
            setTimeout(createParticle, Math.random() * 5000);
        }
        setInterval(createParticle, 550);
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
