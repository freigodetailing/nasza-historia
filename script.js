// script.js

document.addEventListener("DOMContentLoaded", (event) => {
    // Przycisk konfetti na ostatniej kartce
    const btn = document.getElementById('confettiBtn');
    if (btn) {
        btn.addEventListener('click', triggerConfetti);
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
    
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: canvas.width / 2, 
            y: canvas.height / 2 + 100,
            r: Math.random() * 6 + 2, 
            dx: Math.random() * 15 - 7.5, 
            dy: Math.random() * -15 - 5, 
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01
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
                p.dy += 0.3; // Gravity
                p.life -= p.decay;
            }
        }
        
        if (!alive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}
