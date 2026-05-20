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

    // Keep cover state active on load to darken the background video
    document.body.classList.add('cover-active');

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
        bgMusic.play().catch(error => console.log("Audio play failed: ", error));
        
        // Ensure video is playing (user gesture)
        if (bgVideo) {
            bgVideo.play().catch(error => console.log("Video play failed: ", error));
        }

        // Wait for slide up animation then hide cover completely
        document.body.classList.remove('cover-active');
        setTimeout(() => {
            coverSection.style.display = 'none';
        }, 1000);
    });

    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.addEventListener('ended', () => {
            heroVideo.pause();
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
        const speed = 6; // pixels per second, slow movement

        const updateTrack = (offset) => {
            currentOffset = offset;
            quranTrack.style.transform = `translateX(${currentOffset}px)`;
        };

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

    // 5. Scroll Reveal Animation
    const reveals = document.querySelectorAll('.slide .content-box');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    
    // Add reveal class initially
    reveals.forEach(r => r.classList.add('reveal'));
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

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
