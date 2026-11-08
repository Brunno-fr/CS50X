// =========================================================
// AI Declaration: Sections of this code were suggested by
// AI tools, including the Three.js particle system, GSAP
// animations, and the canvas drawing logic. All code was
// reviewed, understood, and adapted by the student.
// =========================================================
// =========================================================
// 1. THREE.JS — 3D PARTICLE SPHERE
// =========================================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bg-canvas'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Particle geometry (sphere)
const geometry = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    const radius = 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    posArray[i]     = radius * Math.sin(phi) * Math.cos(theta);
    posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    posArray[i + 2] = radius * Math.cos(phi);
}
geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);

camera.position.z = 5;

// Mouse interaction
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.y += 0.001 + (mouseX * 0.05);
    particlesMesh.rotation.x += 0.001 + (mouseY * 0.05);
    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================================================
// 2. GSAP — ENTRY ANIMATIONS & SCROLL
// =========================================================
gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {
    // Entry timeline
    const tl = gsap.timeline();
    tl.to('.eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-title', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

    // Sphere scales on scroll
    gsap.to(particlesMesh.scale, {
        scale: 2,
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
});

// =========================================================
// 3. DASHBOARD — UPDATE & NETWORK DRAWING
// =========================================================
async function updateDashboard() {
    try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        document.getElementById('nodes').textContent = data.nodes || 0;
        document.getElementById('zones').textContent = data.zones || 0;
        document.getElementById('capacity').textContent = data.capacity || 0;
        document.getElementById('utilization').textContent = data.utilization || 0;
        document.getElementById('events').textContent = data.events || 0;

        const msg = document.getElementById('statusMessage');
        if (data.utilization >= 80) {
            msg.innerHTML = '⚠️ CAPACITY EXCEEDED — AEP starting...';
            msg.style.color = '#ff6b6b';
        } else if (data.utilization >= 60) {
            msg.innerHTML = '🟡 High demand, monitoring...';
            msg.style.color = '#fcc419';
        } else {
            msg.innerHTML = '🟢 Network healthy';
            msg.style.color = '#69db7c';
        }

        drawNetwork(data);
    } catch (err) {
        console.error('❌ Dashboard update error:', err);
        document.getElementById('statusMessage').innerHTML = '⚠️ Server connection error.';
    }
}

function drawNetwork(data) {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.min(rect.width, 900);
    canvas.height = 400;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const zones = data.zones_data || [];
    const nodes = data.nodes_data || [];

    if (zones.length === 0) {
        ctx.fillStyle = '#8899bb';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No zones available', canvas.width/2, canvas.height/2);
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    zones.forEach((zone, i) => {
        const angle = (i / zones.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 60, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(30, 80, 180, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#4a7db5';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#aac8ff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Z${zone.id}`, x, y - 75);

        const zoneNodes = nodes.filter(n => n.zone_id === zone.id);
        zoneNodes.forEach((node, j) => {
            const subAngle = (j / Math.max(zoneNodes.length, 1)) * 2 * Math.PI;
            const nx = x + 40 * Math.cos(subAngle);
            const ny = y + 40 * Math.sin(subAngle);
            ctx.beginPath();
            ctx.arc(nx, ny, 12, 0, 2 * Math.PI);
            ctx.fillStyle = '#69db7c';
            ctx.fill();
            ctx.strokeStyle = '#2b8a3e';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px Arial';
            ctx.fillText(`N${node.id}`, nx, ny - 16);
        });
    });

    if (zones.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#4a7db5';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i < zones.length; i++) {
            for (let j = i+1; j < zones.length; j++) {
                const a1 = (i / zones.length) * 2 * Math.PI - Math.PI / 2;
                const a2 = (j / zones.length) * 2 * Math.PI - Math.PI / 2;
                const x1 = centerX + radius * Math.cos(a1);
                const y1 = centerY + radius * Math.sin(a1);
                const x2 = centerX + radius * Math.cos(a2);
                const y2 = centerY + radius * Math.sin(a2);
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// =========================================================
// 4. EVENTS & INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    // Auto-reset on load
    (async function resetOnLoad() {
        try {
            const res = await fetch('/api/reset', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log('🔄 System reset on load');
            await updateDashboard();
        } catch (error) {
            console.error('❌ Reset error:', error);
            document.getElementById('statusMessage').innerHTML = '⚠️ Server connection error.';
        }
    })();

    // Periodic update every 2 seconds
    setInterval(updateDashboard, 2000);

    // Increase Demand button
    document.getElementById('increaseDemand').addEventListener('click', async function() {
        try {
            await fetch('/api/increase_demand', { method: 'POST' });
            await updateDashboard();
        } catch (err) {
            console.error('❌ Demand increase error:', err);
        }
    });

    // Reset Simulation button
    document.getElementById('resetSimulation').addEventListener('click', async function() {
        try {
            const res = await fetch('/api/reset', { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log('🔄 Simulation reset manually');
            await updateDashboard();
            document.getElementById('statusMessage').innerHTML = '✅ System reset successfully!';
            document.getElementById('statusMessage').style.color = '#69db7c';
        } catch (err) {
            console.error('❌ Reset error:', err);
            document.getElementById('statusMessage').innerHTML = '⚠️ Reset failed.';
            document.getElementById('statusMessage').style.color = '#ff6b6b';
        }
    });

    // First update
    updateDashboard();
});
