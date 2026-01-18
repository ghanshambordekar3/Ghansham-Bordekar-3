// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 2500); // Increased timeout for the new animation
});

// Reveal on Scroll
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

reveals.forEach(reveal => revealObserver.observe(reveal));

// Store the last scroll position
let lastScrollTop = 0;

// Function to re-trigger reveal animations
function triggerRevealAnimations() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate scroll distance
    const scrollDistance = Math.abs(scrollTop - lastScrollTop);

    // Define a threshold for significant scroll distance
    const scrollThreshold = 50; // Adjust this value as needed

    // Only re-trigger if scrolling down and the scroll distance is significant
    if (scrollDistance > scrollThreshold) {
        reveals.forEach(el => {
            el.classList.remove('active');
            revealObserver.observe(el); // Re-observe the element
        });
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
}
// Enhanced Mobile Smooth Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            triggerRevealAnimations();

            // Enhanced smooth scrolling for mobile
            const isMobile = window.innerWidth <= 1024;
            if (isMobile) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            } else {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Logo Particle Animation (optional) - guarded in case element was removed
const logoCanvas = document.getElementById('logo-canvas');
if (logoCanvas && logoCanvas.getContext) {
    const logoCtx = logoCanvas.getContext('2d');

    let logoParticles = [];
    const logoText = 'GB';
    const logoMouse = {
        x: null,
        y: null,
        radius: 50 // Area of effect for the cursor on the logo
    };

    logoCanvas.addEventListener('mousemove', (e) => {
        const rect = logoCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        // Adjust mouse coordinates for canvas scaling and DPR
        logoMouse.x = (e.clientX - rect.left) * dpr;
        logoMouse.y = (e.clientY - rect.top) * dpr;
    });

    logoCanvas.addEventListener('mouseleave', () => {
        logoMouse.x = null;
        logoMouse.y = null;
    });

    function setCanvasSize() {
        const dpr = window.devicePixelRatio || 1;
        logoCanvas.width = 80 * dpr;
        logoCanvas.height = 40 * dpr;
        logoCanvas.style.width = '80px';
        logoCanvas.style.height = '40px';
        logoCtx.scale(dpr, dpr);
        logoCtx.fillStyle = getCssVariable('--text-primary');
        logoCtx.font = 'bold 26px Inter';
        logoCtx.textAlign = 'center';
        logoCtx.textBaseline = 'middle';
    }

    class LogoParticle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 10;
            this.y = y + (Math.random() - 0.5) * 10;
            this.baseX = x;
            this.baseY = y;
            this.density = (Math.random() * 30) + 1;
            this.size = 1;
            this.color = getCssVariable('--text-primary');
        }

        draw() {
            logoCtx.fillStyle = this.color;
            logoCtx.beginPath();
            logoCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            logoCtx.closePath();
            logoCtx.fill();
        }

        update() {
            // Repulsion from cursor
            if (logoMouse.x !== null) {
                let dx_mouse = this.x - logoMouse.x;
                let dy_mouse = this.y - logoMouse.y;
                let distance = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
                if (distance < logoMouse.radius) {
                    const forceDirectionX = dx_mouse / distance;
                    const forceDirectionY = dy_mouse / distance;
                    const force = (logoMouse.radius - distance) / logoMouse.radius;
                    const directionX = forceDirectionX * force * 3; // Push strength
                    const directionY = forceDirectionY * force * 3;
                    this.x += directionX;
                    this.y += directionY;
                }
            }

            // Attraction to base position (gravity)
            let dx_base = this.baseX - this.x;
            let dy_base = this.baseY - this.y;
            this.x += dx_base / this.density;
            this.y += dy_base / this.density;
        }
    }

    function initLogoParticles() {
        logoParticles = [];
        logoCtx.fillText(logoText, logoCanvas.width / 4, logoCanvas.height / 4);
        const textCoordinates = logoCtx.getImageData(0, 0, logoCanvas.width, logoCanvas.height);
        logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);

        for (let y = 0; y < textCoordinates.height; y += 2) {
            for (let x = 0; x < textCoordinates.width; x += 2) {
                if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                    logoParticles.push(new LogoParticle(x, y));
                }
            }
        }
    }

    function animateLogo() {
        logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
        for (let i = 0; i < logoParticles.length; i++) {
            logoParticles[i].update();
            logoParticles[i].draw();
        }
        requestAnimationFrame(animateLogo);
    }

    setCanvasSize();
    initLogoParticles();
    animateLogo();
}

// Hero Title Particle Animation
const heroTitleCanvas = document.getElementById('hero-title-canvas');
const heroTitleCtx = heroTitleCanvas.getContext('2d');
let heroTitleParticles = [];
const heroTitleText = heroTitleCanvas.dataset.text;

const heroTitleMouse = {
    x: null,
    y: null,
    radius: 100
};

heroTitleCanvas.addEventListener('mousemove', (e) => {
    const rect = heroTitleCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    heroTitleMouse.x = (e.clientX - rect.left) * dpr;
    heroTitleMouse.y = (e.clientY - rect.top) * dpr;
});

heroTitleCanvas.addEventListener('mouseleave', () => {
    heroTitleMouse.x = null;
    heroTitleMouse.y = null;
});

function getHeroFontSize() {
    const vw = window.innerWidth;
    // This logic mimics the clamp() function in CSS: clamp(3rem, 8vw, 6rem)
    const baseSize = 12; // Assuming 1rem = 16px
    const minSize = 3 * baseSize;
    const maxSize = 6 * baseSize;
    const preferredSize = vw * 0.08;
    return Math.max(minSize, Math.min(preferredSize, maxSize));
}

function getHeroTitleLines() {
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        const parts = heroTitleText.split(' ');
        if (parts.length > 1) {
            return [parts[0], parts.slice(1).join(' ')];
        }
    }
    return [heroTitleText];
}

function setHeroTitleCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const fontSize = getHeroFontSize();
    const lines = getHeroTitleLines();
    heroTitleCanvas.style.fontSize = `${fontSize}px`;

    const isMobile = window.innerWidth <= 1024;
    const letterSpacing = isMobile ? '2px' : '-2px';

    heroTitleCtx.font = `900 ${fontSize}px Inter`;
    heroTitleCtx.letterSpacing = letterSpacing;

    const textMetrics = heroTitleCtx.measureText(lines.reduce((a, b) => a.length > b.length ? a : b, ''));
    const padding = 20; // Add some padding to prevent clipping
    const lineHeight = fontSize * 1.2;
    const mobilePadding = 40; // 20px on each side

    const canvasWidth = isMobile ? window.innerWidth - mobilePadding : textMetrics.width + padding;

    heroTitleCanvas.width = canvasWidth * dpr;
    heroTitleCanvas.height = (lineHeight * lines.length) * dpr;
    heroTitleCanvas.style.width = `${canvasWidth}px`;
    heroTitleCanvas.style.height = `${(lineHeight * lines.length)}px`;

    heroTitleCtx.scale(dpr, dpr);
    // Re-apply font settings after scaling
    heroTitleCtx.font = `900 ${fontSize}px Inter`;
    heroTitleCtx.letterSpacing = letterSpacing;
}

function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

class HeroTitleParticle {
    constructor(x, y) {
        this.x = Math.random() * heroTitleCanvas.width / (window.devicePixelRatio || 1);
        this.y = 0;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 40) + 5;
        this.size = 1.5;
        this.color = getCssVariable('--text-primary');
    }

    draw() {
        heroTitleCtx.fillStyle = this.color; // Use the color from the constructor
        heroTitleCtx.beginPath();
        heroTitleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        heroTitleCtx.closePath();
        heroTitleCtx.fill();
    }

    update() {
        if (heroTitleMouse.x !== null) {
            let dx_mouse = this.x - heroTitleMouse.x / (window.devicePixelRatio || 1);
            let dy_mouse = this.y - heroTitleMouse.y / (window.devicePixelRatio || 1);
            let distance = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
            if (distance < heroTitleMouse.radius) {
                const force = (heroTitleMouse.radius - distance) / heroTitleMouse.radius;
                this.x += (dx_mouse / distance) * force * 3;
                this.y += (dy_mouse / distance) * force * 3;
            }
        }

        let dx_base = this.baseX - this.x;
        let dy_base = this.baseY - this.y;
        this.x += dx_base / this.density;
        this.y += dy_base / this.density;
    }
}

function initHeroTitleParticles() {
    heroTitleParticles = [];
    const fontSize = getHeroFontSize();
    const lines = getHeroTitleLines();
    const lineHeight = fontSize * 1.2;

    const isMobile = window.innerWidth <= 1024;
    const letterSpacing = isMobile ? '2px' : '-2px';

    heroTitleCtx.fillStyle = getCssVariable('--text-primary');
    heroTitleCtx.font = `900 ${fontSize}px Inter`;
    heroTitleCtx.textAlign = 'center';
    heroTitleCtx.textBaseline = 'top';
    heroTitleCtx.letterSpacing = letterSpacing;

    const canvasWidth = heroTitleCanvas.width / (window.devicePixelRatio || 1);
    lines.forEach((line, i) => heroTitleCtx.fillText(line, canvasWidth / 2, i * lineHeight));

    const textCoordinates = heroTitleCtx.getImageData(0, 0, heroTitleCanvas.width, heroTitleCanvas.height);
    heroTitleCtx.clearRect(0, 0, heroTitleCanvas.width, heroTitleCanvas.height);

    const dpr = window.devicePixelRatio || 1;

    for (let y = 0; y < textCoordinates.height; y += 4) { // Increased step for performance
        for (let x = 0; x < textCoordinates.width; x += 4) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                heroTitleParticles.push(new HeroTitleParticle(x / dpr, y / dpr));
            }
        }
    }
}

function animateHeroTitle() {
    heroTitleCtx.clearRect(0, 0, heroTitleCanvas.width, heroTitleCanvas.height);
    for (let i = 0; i < heroTitleParticles.length; i++) {
        heroTitleParticles[i].update();
        heroTitleParticles[i].draw();
    }
    requestAnimationFrame(animateHeroTitle);
}

// Mobile Navigation
const hamburger = document.querySelector('.hamburger-menu');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

document.fonts.ready.then(() => {
    setHeroTitleCanvasSize();
    initHeroTitleParticles();
    animateHeroTitle();
});

hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Enhanced Mobile Navigation with Smooth Scrolling
mobileNavLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        mobileNav.classList.remove('active');
        hamburger.classList.remove('active');

        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            triggerRevealAnimations();
            
            // Enhanced mobile smooth scrolling with delay
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 300);
        }
    });
});

// Re-trigger reveal animations on scroll
window.addEventListener('scroll', () => {
    triggerRevealAnimations();
});

// Nav-logo click: show short coding/typing animation (2-5s)
(() => {
    const logo = document.getElementById('nav-logo');
    const bubble = document.getElementById('nav-code');
    const content = document.getElementById('nav-code-content');
    if (!logo || !bubble || !content) return;

    let animRunning = false;
    const sampleCode = [
        "// init...",
        "const app = createApp();",
        "await app.start();",
    ];

    function typeText(lines, speed = 20, totalDuration = 2500) {
        content.textContent = '';
        let all = lines.join('\n');
        let i = 0;
        animRunning = true;
        bubble.classList.add('show');
        bubble.setAttribute('aria-hidden', 'false');

        const charInterval = setInterval(() => {
            content.textContent = all.slice(0, i);
            i++;
            if (i > all.length) {
                clearInterval(charInterval);
            }
        }, speed);

        // ensure bubble hides after totalDuration
        setTimeout(() => {
            clearInterval(charInterval);
            bubble.classList.remove('show');
            bubble.setAttribute('aria-hidden', 'true');
            animRunning = false;
            // clear text shortly after hide
            setTimeout(() => { content.textContent = ''; }, 200);
        }, totalDuration);
    }

    logo.addEventListener('click', (e) => {
        // ignore while animation runs
        if (animRunning) return;
        // choose a random duration between 2000ms and 4500ms
        const duration = 2000 + Math.floor(Math.random() * 2500);
        typeText(sampleCode, 16, duration);
    });
})();

// Parallax Effect on Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroTitle = document.getElementById('hero-title-canvas');
    const isMobile = window.innerWidth <= 768;
    const fadeOutDistance = isMobile ? window.innerHeight / 2 : 500;
    if (heroTitle) {
        // Move the title up at a different speed than the scroll for a depth effect
        heroTitle.style.transform = `translateY(${scrolled * 0.4}px)`;
        heroTitle.style.opacity = 1 - scrolled / fadeOutDistance;
    }
});

// Centralized interaction using a single currentExpanded tracker to avoid race conditions
const projectCards = Array.from(document.querySelectorAll('.project-card'));
let currentExpanded = null;

function setExpanded(card) {
    const grid = document.querySelector('.projects-grid');
    if (currentExpanded === card) return;
    if (currentExpanded) currentExpanded.classList.remove('expanded');
    currentExpanded = card;
    if (currentExpanded) {
        currentExpanded.classList.add('expanded');
        if (grid) grid.classList.add('has-expanded');
    } else {
        if (grid) grid.classList.remove('has-expanded');
    }
}

function clearExpanded() {
    const grid = document.querySelector('.projects-grid');
    if (currentExpanded) {
        currentExpanded.classList.remove('expanded');
        currentExpanded = null;
        if (grid) grid.classList.remove('has-expanded');
    }
}

projectCards.forEach(card => {
    if (!card.hasAttribute('tabindex')) card.tabIndex = 0;

    // Pointer-based expand/collapse to avoid neighbor expansion on hover
    card.addEventListener('pointerenter', (e) => setExpanded(card));

    card.addEventListener('pointerleave', (e) => {
        const to = e.relatedTarget;
        if (!to || !to.closest || to.closest('.project-card') !== card) {
            if (currentExpanded === card) clearExpanded();
        }
    });

    card.addEventListener('focus', () => setExpanded(card));
    card.addEventListener('blur', () => {
        if (currentExpanded === card) clearExpanded();
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (currentExpanded === card) clearExpanded(); else setExpanded(card);
        }
        if (e.key === 'Escape') {
            clearExpanded();
            card.blur();
        }
    });

    card.addEventListener('touchstart', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        e.stopPropagation();
        if (currentExpanded === card) clearExpanded(); else setExpanded(card);
    }, { passive: true });
});

// project-number controls (match pointer behavior)
document.querySelectorAll('.project-number').forEach(num => {
    const parent = num.closest('.project-card');
    if (!parent) return;
    num.addEventListener('pointerenter', (e) => setExpanded(parent));
    num.addEventListener('pointerleave', (e) => {
        const to = e.relatedTarget;
        if (!to || !to.closest || to.closest('.project-card') !== parent) {
            if (currentExpanded === parent) clearExpanded();
        }
    });
    num.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (currentExpanded === parent) clearExpanded(); else setExpanded(parent);
    }, { passive: true });
});

// collapse on outside interaction
document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.project-card')) clearExpanded();
});

// Console Message
console.log('%cGhansham Bordekar', 'font-size: 24px; font-weight: bold; color: #e8e8e8;');
console.log('%cBuilding systems that matter.', 'font-size: 14px; color: #a8a8a8;');

// Tech icon name reveal on click
document.querySelectorAll('.tech-icon-item').forEach(icon => {
    icon.addEventListener('click', function () {
        // Hide any other currently visible name tags
        document.querySelectorAll('.tech-name.show').forEach(visibleName => {
            if (visibleName !== this.querySelector('.tech-name')) {
                visibleName.classList.remove('show');
            }
        });

        const nameTag = this.querySelector('.tech-name');
        if (nameTag) {
            // Toggle the 'show' class
            nameTag.classList.toggle('show');

            // If the tag is now shown, set a timeout to hide it
            if (nameTag.classList.contains('show')) {
                setTimeout(() => nameTag.classList.remove('show'), 2000);
            }
        }
    });
});

// Add typing effect to hero subtitle
const heroSubtitle = document.querySelector('.hero-subtitle');
const originalText = heroSubtitle.textContent;
heroSubtitle.textContent = '';

setTimeout(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < originalText.length) {
            heroSubtitle.textContent += originalText.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, 50);
}, 1500);

// Magnetic effect on project cards (use pointer events for better overlap handling)
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        const title = card.querySelector('.project-title');
        if (title) {
            title.style.transform = `translate(${deltaX * 10}px, ${deltaY * 10}px)`;
        }
    });

    card.addEventListener('pointerleave', () => {
        const title = card.querySelector('.project-title');
        if (title) {
            title.style.transform = 'translate(0, 0)';
        }
    });
});

// Add ripple effect on click
document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            .project-title {
                transition: transform 0.3s ease;
            }
        `;
document.head.appendChild(rippleStyle);

let resizeTimeout;

window.addEventListener('resize', () => {
    // Debounce resize event to avoid performance issues
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setHeroTitleCanvasSize();
        setCanvasSize(); // For logo
        initHeroTitleParticles();
        initLogoParticles();
    }, 250);
});

// Dynamic Background Animation
const bgCanvas = document.getElementById('background-canvas');
const bgCtx = bgCanvas.getContext('2d');

// --- Combined Background Animation State ---

// For Cursor Trail
let bgParticles = [];
const bgMouse = {
    x: undefined,
    y: undefined,
};

// For Animated Waves
let waves = [];

// --- Particle Class for Cursor Trail ---
class BgParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = getCssVariable('--text-secondary');
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.05;
    }

    draw() {
        bgCtx.fillStyle = this.color;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

// --- Wave Class for Wave Animation ---
class Wave {
    constructor(y, amplitude, length, speed, color) {
        this.y = y;
        this.amplitude = amplitude;
        this.length = length;
        this.speed = speed;
        this.color = color;
        this.offset = Math.random() * Math.PI * 2;
    }

    update() {
        this.offset += this.speed;
    }
}

// --- Initialization and Sizing ---
function setBgCanvasSize() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    initWaves(); // Re-initialize waves on resize
}

function initWaves() {
    waves = [];
    const accentColor = getCssVariable('--accent-gray');
    const secondaryColor = getCssVariable('--text-secondary');

    // Define the properties for each wave layer
    waves.push(new Wave(bgCanvas.height / 1.5, 40, 0.01, 0.005, `${accentColor}4D`)); // ~30% opacity
    waves.push(new Wave(bgCanvas.height / 1.6, 50, 0.008, 0.007, `${secondaryColor}33`)); // ~20% opacity
    waves.push(new Wave(bgCanvas.height / 1.7, 60, 0.006, 0.009, `${accentColor}1A`)); // ~10% opacity
}

// --- Drawing and Animation Functions ---
function handleParticles() {
    for (let i = 0; i < bgParticles.length; i++) {
        bgParticles[i].update();
        bgParticles[i].draw();
        if (bgParticles[i].size <= 0.1) {
            bgParticles.splice(i, 1);
            i--;
        }
    }
}

function drawWaves() {
    waves.forEach(wave => {
        wave.update();
        bgCtx.beginPath();
        bgCtx.moveTo(0, bgCanvas.height);
        for (let x = 0; x < bgCanvas.width; x++) {
            // Use a sine wave for the flowing effect, with another sine to make the amplitude pulse
            const y = wave.y + Math.sin(x * wave.length + wave.offset) * wave.amplitude * Math.sin(wave.offset);
            bgCtx.lineTo(x, y);
        }
        bgCtx.lineTo(bgCanvas.width, bgCanvas.height);
        bgCtx.fillStyle = wave.color;
        bgCtx.fill();
    });
}

function animateBackground() {
    const bgColor = getCssVariable('--bg-primary');
    bgCtx.fillStyle = `${bgColor}1A`; // Use hex alpha for ~10% opacity for a trailing effect
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    drawWaves();        // Draw the waves first, so they are in the background
    handleParticles();  // Draw the cursor particles on top

    requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setBgCanvasSize();
        // Re-initialize other canvases
        setHeroTitleCanvasSize();
        bgParticles = []; // Clear particles on resize
        setCanvasSize(); // For logo
        initHeroTitleParticles();
        initLogoParticles();
    }, 250);
});

// --- Event Listeners and Initial Calls ---

window.addEventListener('mousemove', (e) => {
    // Create a small burst of particles on move for the cursor trail
    for (let i = 0; i < 2; i++) {
        bgParticles.push(new BgParticle(e.x, e.y));
    }
});

// Initial setup
setBgCanvasSize();
initWaves();
animateBackground(); // Start the combined animation loop

// Ensure certificate links open in a new tab (extra safety for some mobile browsers)
document.querySelectorAll('.certificate-link').forEach(a => {
    try {
        if (!a.target || a.target !== '_blank') a.target = '_blank';
    } catch (e) {
        // ignore if element removed
    }
});