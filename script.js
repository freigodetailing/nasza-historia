// script.js

document.addEventListener("DOMContentLoaded", (event) => {
    // ======== BICIE SERCA (INTRO) ========
    const hbAudio = new Audio('galeria/Heartbeat sound effect.mp3');
    hbAudio.volume = 1.0; // głośność bicia serca
    hbAudio.preload = 'auto';

    let heartbeatInterval = null;
    const playHeartbeat = () => {
        hbAudio.currentTime = 0;
        hbAudio.play().catch(e => {
            // Po interakcji na 100% powinno zadziałać!
        });
    };

    // ======== MUZYKA W TLE ========
    const bgMusic = document.getElementById('bgMusic');
    let bgMusicStarted = false;
    
    // Uruchomienie muzyki przy pierwszej interakcji uzytkownika (aby ominac blokade autoplay)
    const initBgMusic = () => {
        if (!bgMusicStarted && bgMusic) {
            bgMusicStarted = true;
            bgMusic.volume = 0.16; // bardzo delikatnie słyszalna
            bgMusic.loop = true;   // wymuszenie zapętlenia z poziomu JS dla pewności
            bgMusic.play().then(() => {
                // jeśli wystartowała, usuwamy nasłuchiwacze
                window.removeEventListener('scroll', initBgMusic);
                window.removeEventListener('click', initBgMusic);
                window.removeEventListener('touchstart', initBgMusic);
            }).catch(e => {
                console.log("Autoplay zablokowany, wymaga interakcji:", e);
                bgMusicStarted = false;
            });
        }
    };

    window.addEventListener('scroll', initBgMusic);
    window.addEventListener('click', initBgMusic);
    window.addEventListener('touchstart', initBgMusic);

    // Logika wrót powitalnych (Intro Gates)
    const gates = document.getElementById('introGates');
    const tapText = document.querySelector('.tap-to-open');
    if (gates) {
        // Przewiń na początek w razie odświeżenia
        window.scrollTo(0, 0);
        
        const openGatesSequence = () => {
            if (gates.classList.contains('opening-started')) return;
            gates.classList.add('opening-started');

            // Ukrywamy zachętę do kliknięcia
            if (tapText) {
                tapText.style.animation = 'none'; // wyłącza pulsującą animację nadpisującą opcję opacity
                tapText.style.transition = 'opacity 0.3s ease';
                tapText.style.opacity = '0';
            }
            const audioHint = document.querySelector('.audio-hint');
            if (audioHint) {
                audioHint.style.transition = 'opacity 0.3s ease';
                audioHint.style.opacity = '0';
            }

            // ZACZYNAMY BICIE SERCA JUŻ TERAZ (teraz na 200% się powiedzie, bo mamy zgodę z kliknięcia)
            playHeartbeat();
            heartbeatInterval = setInterval(playHeartbeat, 1500);

            // Odczekujemy 2.5 sekundy kinowego napięcia, podczas których słychać mocne bicie serca
            setTimeout(() => {
                gates.classList.add('open'); // Otwierają się!
                
                // Wycisz serce gdy wrota zaczynają się rozsuwać
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                let hbFade = setInterval(() => {
                    if(hbAudio.volume > 0.05) {
                        hbAudio.volume -= 0.05;
                    } else {
                        hbAudio.pause();
                        clearInterval(hbFade);
                    }
                }, 100);

                // Po zakończeniu otwierania zdejmij blokadę na scrollowanie i schowaj wrota
                setTimeout(() => {
                    document.body.classList.remove('locked');
                    gates.style.display = 'none';
                }, 1500);
            }, 2500);
        };

        // Zamiast otwierać z automatu, wymuszamy pierwsze dotknięcie ekranu
        gates.addEventListener('click', openGatesSequence);
        gates.addEventListener('touchstart', openGatesSequence);
    }

    // ======== INTERAKCJA Z TORTEM - ZDMUCHIWANIE ŚWIECZEK ========
    const cake = document.getElementById('interactiveCake');
    if (cake) {
        let clickCount = 0;
        let clickTimer = null;
        let isBlownOut = false;
        const REQUIRED_CLICKS = 19;

        // Pula dźwięków pozwala na jednoczesne, natychmiastowe granie przy bardzo szybkim klikaniu
        const popAudioPool = [];
        for (let i = 0; i < 6; i++) {
            let aud = new Audio('galeria/Cute Pop Sound Effects.mp3');
            aud.volume = 0.16; // Ściszone zgodnie z prośbą (ok. 8%)
            aud.preload = 'auto';
            popAudioPool.push(aud);
        }
        let popIndex = 0;
        
        // Aktualizacja wskazówki żeby pokazywała 19
        const hint = document.querySelector('.blow-hint');
        const counter = document.getElementById('clickCounter');
        const counterNum = document.getElementById('clickCountNum');
        const hintsBar = document.querySelector('.cake-hints-bar');

        // Używamy opcji "pointerdown" zamiast "click". 
        // W przeciwieństwie do "click" (które uruchamia się po PODNIESIENIU palca), "pointerdown"
        // reaguje w fizycznej mikrosekundzie uderzenia (wciśnięcia), dając perfekcyjną kinetyczną synchronizację.
        cake.addEventListener('pointerdown', (e) => {
            if (isBlownOut) return;
            
            clickCount++;

            // Odtworzenie z bufora - zapewnia start w 0 ms
            const popAudio = popAudioPool[popIndex];
            popIndex = (popIndex + 1) % popAudioPool.length;
            popAudio.currentTime = 0;
            popAudio.play().catch(err => {});
            
            setTimeout(() => {
                popAudio.pause();
            }, 2000);

            
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

                // Odtwarzamy muzykę GŁÓWNIE TUTAJ bez zwłoki (przed setTimeout!), 
                // by przeglądarka zapamiętała, że jest to wywołane z bezpośredniego kliknięcia user'a.
                const audio = document.getElementById('birthdayAudio');
                
                // Zatrzymujemy muzykę w tle na rzecz głównej melodii finałowej
                if (bgMusic) bgMusic.pause();

                if (audio) {
                    audio.volume = 0.16; // Cichsze (8%), by służyło jako delikatne tło dźwiękowe
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Błąd odtwarzania audio:", e));
                }

                // Chowamy cały pasek z podpowiedziami
                if (hintsBar) hintsBar.style.opacity = '0';
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

                    // Pokazujemy kotka z przyciemnieniem tła
                    const kittenOverlay = document.getElementById('kittenOverlay');
                    if (kittenOverlay) {
                        kittenOverlay.classList.add('show');
                    }
                }, 300);
                
                clickCount = 0;
            }
        });
    }

    // Zamknięcie nakładki z kotkiem
    const closeKittenBtn = document.getElementById('closeKitten');
    const kittenOverlay = document.getElementById('kittenOverlay');
    if (closeKittenBtn && kittenOverlay) {
        closeKittenBtn.addEventListener('click', () => {
            kittenOverlay.classList.remove('show');
            const audio = document.getElementById('birthdayAudio');
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            
            // Przywracamy główną, cichą przytulną muzykę w tle
            const bgMusic = document.getElementById('bgMusic');
            if (bgMusic) {
                bgMusic.play().catch(e => console.log("Nie udało się wznowić bgMusic: ", e));
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
    const audio = document.getElementById('fireworksAudio');
    if (audio) {
        audio.volume = 0.36; // Ściszone fajerwerki (18%)
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Błąd odtwarzania fw:", e));
    }

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

        const fAudio = document.getElementById('fireworksAudio');
        if (fAudio) fAudio.pause();

        setTimeout(() => {
            cancelAnimationFrame(animationId);
            canvas.remove();
        }, 2000);
    }, 15000);
}
