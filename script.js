// script.js

document.addEventListener("DOMContentLoaded", (event) => {
    // Logika wrót powitalnych (Intro Gates)
    const gates = document.getElementById('introGates');
    if (gates) {
        // Przewiń na początek w razie odświeżenia
        window.scrollTo(0, 0);
        
        // Po 2 sekundach otwórz wrota
        setTimeout(() => {
            gates.classList.add('open');
            
            // Po zakończeniu otwierania zdejmij blokadę na scrollowanie i schowaj wrota
            setTimeout(() => {
                document.body.classList.remove('locked');
                gates.style.display = 'none';
            }, 1500);
        }, 2000);
    }

    // ======== INTERAKCJA Z TORTEM - ZDMUCHIWANIE ŚWIECZEK ========
    const cake = document.getElementById('interactiveCake');
    if (cake) {
        let clickCount = 0;
        let clickTimer = null;
        let isBlownOut = false;
        const REQUIRED_CLICKS = 19;
        
        // Aktualizacja wskazówki żeby pokazywała 19
        const hint = cake.querySelector('.blow-hint');
        const counter = document.getElementById('clickCounter');
        const counterNum = document.getElementById('clickCountNum');

        cake.addEventListener('click', () => {
            if (isBlownOut) return;
            
            clickCount++;
            
            // Aktualizuj licznik
            if (counterNum) counterNum.textContent = clickCount;
            if (counter) {
                counter.classList.remove('num-pop');
                void counter.offsetWidth;
                counter.classList.add('num-pop');
                counter.addEventListener('animationend', () => counter.classList.remove('num-pop'), { once: true });
            }
            
            // Animacja pop-bounce przy każdym kliknięciu
            cake.classList.remove('popping');
            void cake.offsetWidth; // wymuszeń reflow — pozwala odświeżyć animację nawet po szybkim klikaniu
            cake.classList.add('popping');
            cake.addEventListener('animationend', () => cake.classList.remove('popping'), { once: true });

            // Reset licznika po przerwie 800ms
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
                if (counterNum) counterNum.textContent = '0';
            }, 800);
            
            // Po 19 kliknięciach: fajerwerki + 3x konfetti co 5 sekund!
            if (clickCount >= REQUIRED_CLICKS) {
                isBlownOut = true;

                // Chowamy licznik
                if (counter) counter.style.opacity = '0';

                // Gasimy świeczki
                const flames = cake.querySelectorAll('.candle-flame');
                flames.forEach(flame => flame.classList.add('extinguished'));
                
                // Chowamy instruktarz!
                if (hint) hint.style.opacity = '0';

                // Start show po 300ms
                setTimeout(() => {
                    triggerFireworks();                          // fajerwerki przez 15s
                    triggerConfetti();                           // 0s  — pierwsze konfetti
                    setTimeout(() => triggerConfetti(), 5000);  // 5s  — drugie konfetti
                    setTimeout(() => triggerConfetti(), 10000); // 10s — trzecie konfetti
                }, 300);
                
                clickCount = 0;
            }
        });
    }
});

// Funkcja rysująca konfetti
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];
    
    for (let i = 0; i < 300; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height,
            r: Math.random() * 8 + 3,
            dx: Math.random() * 40 - 20,
            dy: Math.random() * -30 - 15,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            decay: Math.random() * 0.015 + 0.005
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let alive = false;
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            if (p.life > 0) {
                alive = true;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                p.dy += 0.5;
                p.life -= p.decay;
            }
        }
        if (!alive) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    animate();
}

// Funkcja rysująca fajerwerki przez 15 sekund
function triggerFireworks() {
    const canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10000';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#ff5252','#ff4081','#e040fb','#7c4dff','#536dfe','#448aff','#40c4ff','#18ffff','#64ffda','#69f0ae','#b2ff59','#eeff41','#ffff00','#ffd740','#ffab40','#ff6e40'];

    let fireworksInterval;
    let animationId;
    let stopGenerating = false;

    function createExplosion(x, y) {
        const particleCount = 50 + Math.random() * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color, alpha: 1,
                decay: 0.015 + Math.random() * 0.02,
                isRocket: false
            });
        }
    }

    function launchFirework() {
        if (stopGenerating) return;
        const startX = canvas.width * 0.1 + Math.random() * (canvas.width * 0.8);
        const startY = canvas.height;
        const targetY = canvas.height * 0.1 + Math.random() * canvas.height * 0.4;
        const targetX = startX + (Math.random() - 0.5) * 200;
        const speed = 10 + Math.random() * 5;
        const angle = Math.atan2(targetY - startY, targetX - startX);
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            targetY, color, alpha: 1, isRocket: true
        });
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.isRocket ? 3 : 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.isRocket) {
                if (p.vy >= 0 || p.y <= p.targetY) {
                    createExplosion(p.x, p.y);
                    particles.splice(i, 1);
                }
            } else {
                p.vy += 0.1;
                p.alpha -= p.decay;
                if (p.alpha <= 0) particles.splice(i, 1);
            }
        }
        ctx.globalAlpha = 1;
    }

    animate();

    // Rakieta co 300ms
    fireworksInterval = setInterval(launchFirework, 300);

    // Stop po 15 sekundach
    setTimeout(() => {
        stopGenerating = true;
        clearInterval(fireworksInterval);
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            canvas.remove();
        }, 2000);
    }, 15000);
}
