import { canvas, ctx, lctx, lightCanvas, state } from './state.js';

function drawPlayer() {
    const p = state.player;
    if (p.activeSeamoth) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const legWave = Math.sin(p.legPhase) * 12;
    const bodyWave = Math.sin(p.legPhase * 0.5) * 3;
    ctx.fillStyle = state.equipment.fins ? (state.equipment.fins === 'Ultra Glide Fins' ? '#0ff' : '#333') : '#111';
    ctx.beginPath();
    ctx.moveTo(-18, -12 + legWave); ctx.lineTo(-30, -18 + legWave); ctx.lineTo(-30, -6 + legWave); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-18, 12 - legWave); ctx.lineTo(-30, 18 - legWave); ctx.lineTo(-30, 6 - legWave); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.roundRect(-15, -10 + bodyWave, 28, 20, 6); ctx.fill();
    const tN = state.equipment.tank;
    ctx.fillStyle = tN ? (tN.includes('Ultra') ? '#f00' : '#fb0') : '#444';
    ctx.beginPath(); ctx.roundRect(-12, -7 + bodyWave, 16, 14, 4); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(14, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.beginPath(); ctx.arc(16, 0, 7, -Math.PI / 2, Math.PI / 2); ctx.fill();
    if (p.equipped === 'Seaglide') {
        ctx.fillStyle = '#0a0'; ctx.beginPath(); ctx.roundRect(16, -10, 18, 20, 4); ctx.fill();
        ctx.fillStyle = '#0f8'; ctx.fillRect(18, -6, 14, 12);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(32, 0, 3, 0, Math.PI * 2); ctx.fill();
    } else if (p.equipped === 'Flashlight') {
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.roundRect(16, -4, 15, 8, 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(31, 0, 4, -Math.PI / 2, Math.PI / 2); ctx.fill();
    } else if (p.equipped === 'Habitat Builder') {
        ctx.fillStyle = '#404'; ctx.beginPath(); ctx.roundRect(16, -5, 12, 10, 2); ctx.fill();
        ctx.fillStyle = '#a0f'; ctx.fillRect(18, -3, 8, 6);
    }
    ctx.restore();
}

function drawSeamoth(m) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rotation);
    ctx.fillStyle = '#eee';
    ctx.beginPath(); ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.beginPath(); ctx.arc(15, 0, 22, -Math.PI / 2, Math.PI / 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#ccc';
    ctx.beginPath(); ctx.roundRect(-35, -20, 20, 40, 5); ctx.fill();
    ctx.fillStyle = '#f90'; ctx.beginPath(); ctx.roundRect(-32, -15, 5, 30, 2); ctx.fill();
    if (m.energy > 0) {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(38, -12, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(38, 12, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function drawStalker(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.fillStyle = '#2d5a27';
    ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(-20, -12); ctx.lineTo(-35, 0); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1e3d1a';
    ctx.beginPath(); ctx.moveTo(-35, 0); ctx.lineTo(-50, -15); ctx.lineTo(-50, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = s.state === 'hunting' ? '#f00' : '#8f0';
    ctx.beginPath(); ctx.arc(28, -5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(28, 5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawDrone(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rotation);
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.roundRect(-12, -10, 24, 20, 4); ctx.fill();
    ctx.strokeStyle = '#0ff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    const propRot = Date.now() * 0.02;
    [-8, 8].forEach(py => {
        ctx.save(); ctx.translate(-10, py); ctx.rotate(propRot);
        ctx.fillRect(-6, -1, 12, 2); ctx.restore();
    });
    if (d.cargo.length > 0) {
        const itemColor = state.items[d.cargo[0]].color;
        ctx.fillStyle = itemColor;
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

export function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

    const isPlayerInside = state.player.isInside && !state.player.activeDrone && !state.player.activeSeamoth;
    const isInsideObs = state.player.isInObservation;

    if (!isPlayerInside || isInsideObs) {
        const skyGrad = ctx.createLinearGradient(0, -600, 0, 0);
        skyGrad.addColorStop(0, '#87ceeb'); skyGrad.addColorStop(1, '#e0f7ff');
        ctx.fillStyle = skyGrad; ctx.fillRect(-state.worldSize.width / 2, -600, state.worldSize.width, 600);

        const seaGrad = ctx.createLinearGradient(0, 0, 0, state.worldSize.height);
        seaGrad.addColorStop(0, '#1166bb'); seaGrad.addColorStop(0.1, '#004488'); seaGrad.addColorStop(1, '#000408');
        ctx.fillStyle = seaGrad; ctx.fillRect(-state.worldSize.width / 2, 0, state.worldSize.width, state.worldSize.height);

        if (state.terrainPoints.length > 1) {
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.moveTo(state.terrainPoints[0].x, state.worldSize.height);
            state.terrainPoints.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(state.terrainPoints[state.terrainPoints.length - 1].x, state.worldSize.height); ctx.fill();
        }

        state.fish.forEach(f => {
            ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(Math.atan2(f.vy, f.vx));
            ctx.fillStyle = f.color; ctx.beginPath(); ctx.ellipse(0, 0, f.size, f.size / 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
        state.resources.forEach(r => {
            ctx.fillStyle = state.items[r.type]?.color || '#fff';
            ctx.beginPath(); ctx.arc(r.x, r.y, 6, 0, Math.PI * 2); ctx.fill();
        });
        state.stalkers.forEach(drawStalker);
    } else {
        ctx.fillStyle = '#050a10'; ctx.fillRect(state.camera.x, state.camera.y, canvas.width, canvas.height);
    }

    ctx.lineWidth = 40; ctx.strokeStyle = '#2c3e50';
    state.baseParts.forEach((bp, i) => {
        if (bp.type.startsWith('room') || bp.type === 'moonpool') {
            state.baseParts.forEach((bp2, j) => {
                if (i < j && (bp2.type.startsWith('room') || bp2.type === 'moonpool')) {
                    const dist = Math.hypot(bp.x - bp2.x, bp.y - bp2.y);
                    if (dist < 300) {
                        ctx.beginPath(); ctx.moveTo(bp.x, bp.y); ctx.lineTo(bp2.x, bp2.y); ctx.stroke();
                        ctx.save(); ctx.lineWidth = 32; ctx.strokeStyle = '#1e242e'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'; ctx.stroke(); ctx.restore();
                    }
                }
            });
        }
    });

    state.baseParts.forEach(bp => {
        ctx.lineWidth = 3; ctx.strokeStyle = '#0ff'; ctx.fillStyle = '#1e242e';
        const dist = Math.hypot(state.mouse.worldX - bp.x, state.mouse.worldY - bp.y);
        if (state.player.equipped === 'Habitat Builder' && dist < Math.max(bp.width, bp.height) / 1.5) {
            ctx.shadowBlur = 10; ctx.shadowColor = '#f0f'; ctx.strokeStyle = '#f0f';
        }
        if (bp.type === 'room_lab') {
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.roundRect(bp.x - bp.width / 2, bp.y - bp.height / 2, bp.width, bp.height, 12); ctx.fill();
            ctx.fillStyle = 'rgba(0, 255, 100, 0.2)'; ctx.beginPath(); ctx.arc(bp.x, bp.y, 35, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f5';
            const pulse = Math.sin(Date.now() * 0.005) * 5;
            ctx.shadowBlur = 15 + pulse; ctx.shadowColor = '#0f5'; ctx.beginPath(); ctx.arc(bp.x, bp.y, 10 + pulse / 2, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0; ctx.strokeStyle = '#444'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(bp.x - 35, bp.y); ctx.lineTo(bp.x + 35, bp.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bp.x, bp.y - 35); ctx.lineTo(bp.x, bp.y + 35); ctx.stroke();
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(bp.x - bp.width / 2, bp.y - bp.height / 2, bp.width, bp.height, 12); ctx.stroke();
        } else if (bp.type === 'room' || bp.type === 'room_special') {
            ctx.beginPath(); ctx.roundRect(bp.x - bp.width / 2, bp.y - bp.height / 2, bp.width, bp.height, bp.name.includes('Multi') ? 40 : 8); ctx.fill(); ctx.stroke();
        } else if (bp.type === 'moonpool') {
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(bp.x - bp.width / 2, bp.y - bp.height / 2, bp.width, bp.height, 15); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.05)'; ctx.fillRect(bp.x - 50, bp.y - 60, 100, 120);
        } else if (bp.type === 'bubble') {
            ctx.fillStyle = 'rgba(20, 60, 100, 0.4)'; ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.width / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.roundRect(bp.x - bp.width / 2, bp.y - bp.height / 2, bp.width, bp.height, 4); ctx.fill(); ctx.stroke();
        }
        ctx.shadowBlur = 0;
    });

    state.seamoths.forEach(drawSeamoth);
    state.drones.forEach(drawDrone);
    if (state.activeBuilding) {
        ctx.globalAlpha = 0.5;
        const b = state.activeBuilding;
        ctx.fillStyle = '#0ff'; ctx.beginPath(); ctx.roundRect(state.mouse.worldX - b.width / 2, state.mouse.worldY - b.height / 2, b.width, b.height, 8); ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    drawPlayer();
    ctx.restore();

    if (state.player.activeDrone || state.player.activeSeamoth) {
        ctx.strokeStyle = state.player.activeSeamoth ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 255, 255, 0.2)'; ctx.lineWidth = 1;
        for (let i = 0; i < canvas.height; i += 4) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }
    }

    const depthAlpha = Math.min(0.9, state.player.depth / 800);
    const timeFactor = Math.sin(state.dayTime * Math.PI * 2);
    const dayAlpha = Math.max(0, 0.4 - timeFactor * 0.4);
    const finalOverlayAlpha = Math.max(dayAlpha, depthAlpha);
    if (finalOverlayAlpha > 0.05) {
        lctx.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
        lctx.fillStyle = `rgba(0, 0, 15, ${finalOverlayAlpha})`;
        lctx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);
        lctx.save();
        lctx.translate(-state.camera.x, -state.camera.y);
        lctx.globalCompositeOperation = 'destination-out';
        const lightTarget = state.player.activeDrone || state.player.activeSeamoth || state.player;
        const radius = 450;
        const grad = lctx.createRadialGradient(lightTarget.x, lightTarget.y, 10, lightTarget.x, lightTarget.y, radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        lctx.fillStyle = grad; lctx.beginPath(); lctx.arc(lightTarget.x, lightTarget.y, radius, 0, Math.PI * 2); lctx.fill();
        state.baseParts.forEach(bp => {
            if (bp.type === 'light' || bp.type === 'room_lab' || bp.type === 'solar') {
                const r = 200;
                const g = lctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, r);
                g.addColorStop(0, 'rgba(255, 255, 255, 1)'); g.addColorStop(1, 'rgba(255, 255, 255, 0)');
                lctx.fillStyle = g; lctx.beginPath(); lctx.arc(bp.x, bp.y, r, 0, Math.PI * 2); lctx.fill();
            }
        });
        lctx.restore();
        ctx.drawImage(lightCanvas, 0, 0);
    }
}
