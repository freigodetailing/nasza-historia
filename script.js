// script.js

let confettiFired = false;

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
            }, 1500); // 1.5s to czas przejścia wrót CSS w transition: transform 1.5s ...
        }, 2000); // 2000ms = 2 sekundy pauzy na start
    }

    // Nasłuchanie zjechania na sam dół, aby odpalić konfetti
    window.addEventListener('scroll', () => {
        // Sprawdzamy, czy użytkownik dojechał prawie na sam dół strony
        // Używamy bufora 50px (dla pewności na telefonach)
        if (!confettiFired && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            confettiFired = true; // Zabezpieczenie przed wielokrotnym odpaleniem
            setTimeout(() => {
                triggerConfetti();
            }, 1000); // Opóźnienie 1 sekundy po zjechaniu
        }
    });

    // ======== INTERAKCJA Z TORTEM - ZDMUCHIWANIE ŚWIECZEK ========
    const cake = document.getElementById('interactiveCake');
    if (cake) {
        let clickCount = 0;
        let clickTimer = null;
        let isBlownOut = false; // Zabezpieczenie przez ponownym dmuchaniem
        
        cake.addEventListener('click', () => {
            if (isBlownOut) return; // Jeśli już zgaszone, blokujemy akcje
            
            clickCount++;
            
            // Zezwalamy na pauzy góra 800ms pomiędzy puknięciami, inaczej licznik spada do 0
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 800);
            
            // Jak uderzy minimum 3 razy to magia!
            if (clickCount >= 3) {
                isBlownOut = true;
                
                // Zdmuchujemy świeczki przypinając klase nadpisującą animacje!
                const flames = cake.querySelectorAll('.candle-flame');
                flames.forEach(flame => {
                    flame.classList.add('extinguished');
                });
                
                // Chowamy instruktarz!
                const hint = cake.querySelector('.blow-hint');
                if (hint) {
                    hint.style.opacity = '0';
                }
                
                clickCount = 0; // zerujemy
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
    
    // Tworzymy aż 300 cząsteczek układających się we wspaniałą "fontannę"
    for (let i = 0; i < 300; i++) {
        particles.push({
            x: canvas.width / 2, // Wyrzut z samego środka osi X
            y: canvas.height,    // Wyrzut od samego dołu ekranu
            r: Math.random() * 8 + 3, // Rozmiar kawałków konfetti
            dx: Math.random() * 40 - 20, // Bardzo szeroki rozbryzg na boki
            dy: Math.random() * -30 - 15, // Potężny wyrzut w górę
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            decay: Math.random() * 0.015 + 0.005 // Trochę wolniejsze zanikanie
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
                p.dy += 0.5; // Grawitacja (ciągnie spowrotem w dół)
                p.life -= p.decay;
            }
        }
        
        if (!alive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}
