import { applyGearEffects, canvas, lightCanvas, state } from './state.js';
import { renderBuildMenu, renderCrafting, showMsg, updateInventoryUI, updateUI } from './ui.js';

function resetRuntimeState() {
    state.player = {
        x: 0, y: -100, vx: 0, vy: 0, width: 20, height: 40, rotation: 0,
        baseSpeed: 0.15, speed: 0.15, friction: 0.94,
        health: 100, hunger: 100,
        o2: 45, maxO2: 45, depth: 0, legPhase: 0, equipped: null,
        isInside: false, isInObservation: false,
        activeDrone: null, activeSeamoth: null
    };
    state.camera = { x: 0, y: 0 };
    state.mouse = { x: 0, y: 0, worldX: 0, worldY: 0 };
    state.inventory = {};
    state.equipment = { tank: null, fins: null };
    state.resources = [];
    state.fish = [];
    state.stalkers = [];
    state.baseParts = [];
    state.drones = [];
    state.seamoths = [];
    state.terrainPoints = [];
    state.activeBuilding = null;
    state.dayTime = 0.5;
    state.keys = {};
    state.blueprints.forEach(bp => {
        bp.crafted = false;
    });
    document.getElementById('builder-toggle-container').style.display = 'none';
    document.getElementById('drone-hud').style.display = 'none';
    document.getElementById('moth-hud').style.display = 'none';
}

export function initNewGame() {
    resetRuntimeState();
    resize();
    for (let x = -state.worldSize.width / 2; x <= state.worldSize.width / 2; x += 60) {
        let y = state.worldSize.height - 400 + Math.sin(x * 0.001) * 300 + Math.sin(x * 0.005) * 60;
        state.terrainPoints.push({ x, y });
    }
    for (let i = 0; i < 1200; i++) {
        state.resources.push({
            x: (Math.random() - 0.5) * state.worldSize.width,
            y: Math.random() * (state.worldSize.height - 800) + 200,
            type: ['Titanium', 'Copper', 'Quartz', 'Silver', 'Gold', 'Lead'][Math.floor(Math.pow(Math.random(), 1.5) * 6)],
        });
    }
    for (let i = 0; i < 400; i++) {
        state.fish.push({
            x: (Math.random() - 0.5) * state.worldSize.width,
            y: Math.random() * state.worldSize.height,
            vx: (Math.random() - 0.5) * 2.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 5 + Math.random() * 8,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
    for (let i = 0; i < 50; i++) {
        state.stalkers.push({
            x: (Math.random() - 0.5) * state.worldSize.width,
            y: 2000 + Math.random() * (state.worldSize.height - 2500),
            vx: 0, vy: 0, rotation: 0, state: 'idle', lastAttack: 0
        });
    }
    renderCrafting();
    renderBuildMenu();
    applyGearEffects();
    updateInventoryUI();
    updateUI();
    state.worldInitialized = true;
}

export function getSaveData() {
    const blueprintState = {};
    state.blueprints.forEach(bp => {
        blueprintState[bp.id] = !!bp.crafted;
    });

    return {
        player: {
            ...state.player,
            activeDrone: null,
            activeSeamoth: null
        },
        camera: { ...state.camera },
        inventory: { ...state.inventory },
        equipment: { ...state.equipment },
        resources: state.resources,
        terrainPoints: state.terrainPoints,
        fish: state.fish,
        stalkers: state.stalkers,
        baseParts: state.baseParts,
        drones: state.drones,
        seamoths: state.seamoths,
        dayTime: state.dayTime,
        blueprints: blueprintState
    };
}

export function loadFromSaveData(saveData) {
    if (!saveData) return false;

    resetRuntimeState();
    resize();
    state.player = { ...state.player, ...(saveData.player || {}) };
    state.player.activeDrone = null;
    state.player.activeSeamoth = null;
    state.camera = { ...state.camera, ...(saveData.camera || {}) };
    state.inventory = { ...(saveData.inventory || {}) };
    state.equipment = { ...state.equipment, ...(saveData.equipment || {}) };
    state.resources = Array.isArray(saveData.resources) ? saveData.resources : [];
    state.terrainPoints = Array.isArray(saveData.terrainPoints) && saveData.terrainPoints.length > 1 ? saveData.terrainPoints : [];
    state.fish = Array.isArray(saveData.fish) ? saveData.fish : [];
    state.stalkers = Array.isArray(saveData.stalkers) ? saveData.stalkers : [];
    state.baseParts = Array.isArray(saveData.baseParts) ? saveData.baseParts : [];
    state.drones = Array.isArray(saveData.drones) ? saveData.drones : [];
    state.seamoths = Array.isArray(saveData.seamoths) ? saveData.seamoths : [];
    state.dayTime = typeof saveData.dayTime === 'number' ? saveData.dayTime : 0.5;

    if (state.terrainPoints.length < 2) {
        for (let x = -state.worldSize.width / 2; x <= state.worldSize.width / 2; x += 60) {
            let y = state.worldSize.height - 400 + Math.sin(x * 0.001) * 300 + Math.sin(x * 0.005) * 60;
            state.terrainPoints.push({ x, y });
        }
    }

    const savedBlueprints = saveData.blueprints || {};
    state.blueprints.forEach(bp => {
        bp.crafted = !!savedBlueprints[bp.id];
    });

    if (state.inventory['Habitat Builder']) {
        document.getElementById('builder-toggle-container').style.display = 'block';
    }

    applyGearEffects();
    renderCrafting();
    renderBuildMenu();
    updateInventoryUI();
    updateUI();
    state.worldInitialized = true;
    return true;
}

export function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    lightCanvas.width = canvas.width;
    lightCanvas.height = canvas.height;
}

export function handleKeyDown(e) {
    if (state.gameStatus !== 'playing') return;
    state.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'x' && state.player.activeDrone) exitDroneControl();
    if (e.key.toLowerCase() === 'e' && state.player.activeSeamoth) exitSeamoth();
}

export function handleKeyUp(e) {
    if (state.gameStatus !== 'playing') return;
    state.keys[e.key.toLowerCase()] = false;
}

export function handleMouseMove(e) {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
    state.mouse.worldX = e.clientX + state.camera.x;
    state.mouse.worldY = e.clientY + state.camera.y;
}

export function handleContextMenu(e) {
    e.preventDefault();
}

export function exitDroneControl() {
    state.player.activeDrone = null;
    document.getElementById('drone-hud').style.display = 'none';
    document.getElementById('stats-panel').style.opacity = '1';
    document.getElementById('fab-panel').style.opacity = '1';
    document.getElementById('side-gear').style.opacity = '1';
}

export function exitSeamoth() {
    const m = state.player.activeSeamoth;
    if (m.dockedId) {
        const moonpool = state.baseParts.find(bp => bp.id === m.dockedId);
        state.player.x = moonpool.x;
        state.player.y = moonpool.y;
    } else {
        state.player.x = m.x + Math.cos(m.rotation + Math.PI / 2) * 40;
        state.player.y = m.y + Math.sin(m.rotation + Math.PI / 2) * 40;
    }
    state.player.vx = 0; state.player.vy = 0;
    state.player.activeSeamoth = null;
    document.getElementById('moth-hud').style.display = 'none';
    document.getElementById('stats-panel').style.opacity = '1';
    document.getElementById('side-gear').style.opacity = '1';
    showMsg("EXITED SEAMOTH");
}

export function handleCanvasMouseDown(e) {
    if (state.gameStatus !== 'playing') return;
    const isRightClick = e.button === 2;
    if (!state.player.activeDrone && !state.player.activeSeamoth) {
        for (let moth of state.seamoths) {
            const mDist = Math.hypot(state.mouse.worldX - moth.x, state.mouse.worldY - moth.y);
            if (mDist < 50) {
                state.player.activeSeamoth = moth;
                document.getElementById('moth-hud').style.display = 'block';
                document.getElementById('stats-panel').style.opacity = '0.3';
                document.getElementById('side-gear').style.opacity = '0.3';
                showMsg("SEAMOTH SYSTEMS ONLINE");
                return;
            }
        }
        if (state.player.isInside) {
            for (let drone of state.drones) {
                const dDist = Math.hypot(state.mouse.worldX - drone.x, state.mouse.worldY - drone.y);
                if (dDist < 30) {
                    state.player.activeDrone = drone;
                    document.getElementById('drone-hud').style.display = 'block';
                    document.getElementById('stats-panel').style.opacity = '0.3';
                    document.getElementById('fab-panel').style.opacity = '0.3';
                    document.getElementById('side-gear').style.opacity = '0.3';
                    showMsg("CONTROLLING CAMERA DRONE");
                    return;
                }
            }
        }
    }

    if (isRightClick && state.player.equipped === 'Habitat Builder') {
        for (let i = state.baseParts.length - 1; i >= 0; i--) {
            const bp = state.baseParts[i];
            const dist = Math.hypot(state.mouse.worldX - bp.x, state.mouse.worldY - bp.y);
            if (dist < Math.max(bp.width, bp.height) / 1.5) {
                const originalPiece = state.habitatPieces.find(hp => hp.name === bp.name);
                if (originalPiece) {
                    Object.entries(originalPiece.cost).forEach(([res, amt]) => {
                        state.inventory[res] = (state.inventory[res] || 0) + amt;
                    });
                    if (bp.name === 'Scanner Room') {
                        state.drones = state.drones.filter(d => d.parentId !== bp.id);
                        if (state.player.activeDrone && state.player.activeDrone.parentId === bp.id) exitDroneControl();
                    }
                    state.baseParts.splice(i, 1);
                    showMsg(`DECONSTRUCTED: ${bp.name}`);
                    updateInventoryUI();
                    renderCrafting();
                    return;
                }
            }
        }
    }

    if (!state.activeBuilding && state.player.isInside) {
        for (let bp of state.baseParts) {
            if (bp.type === 'locker') {
                if (Math.hypot(state.mouse.worldX - bp.x, state.mouse.worldY - bp.y) < 30) {
                    Object.keys(state.inventory).forEach(key => {
                        if (state.items[key].type === 'resource' && key !== 'Titanium') {
                            state.inventory[key] = 0;
                        }
                    });
                    showMsg("RESOURCES SECURED IN STORAGE");
                    updateInventoryUI();
                    return;
                }
            }
        }
    }

    if (state.activeBuilding && !isRightClick) {
        const piece = state.activeBuilding;
        const canAfford = Object.keys(piece.cost).every(res => (state.inventory[res] || 0) >= piece.cost[res]);
        if (canAfford) {
            Object.entries(piece.cost).forEach(([res, amt]) => state.inventory[res] -= amt);
            const newId = Math.random().toString(36).substr(2, 9);
            state.baseParts.push({
                id: newId,
                x: state.mouse.worldX, y: state.mouse.worldY,
                name: piece.name, width: piece.width, height: piece.height, type: piece.type,
                rotation: 0,
                timer: 0
            });
            if (piece.name === 'Scanner Room') {
                state.drones.push(
                    { id: Math.random(), parentId: newId, x: state.mouse.worldX - 40, y: state.mouse.worldY + 40, vx: 0, vy: 0, rotation: 0, cargo: [] },
                    { id: Math.random(), parentId: newId, x: state.mouse.worldX + 40, y: state.mouse.worldY + 40, vx: 0, vy: 0, rotation: 0, cargo: [] }
                );
            }
            state.activeBuilding = null;
            updateInventoryUI();
            renderCrafting();
            showMsg("CONSTRUCTION COMPLETE");
        } else {
            showMsg("RESOURCES REQUIRED");
        }
    } else if (state.activeBuilding && isRightClick) {
        state.activeBuilding = null;
        showMsg("BUILDING CANCELLED");
    }
}

function isPointOnLine(px, py, x1, y1, x2, y2, thickness) {
    const L2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (L2 === 0) return false;
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / L2;
    t = Math.max(0, Math.min(1, t));
    const dist = Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    return dist < thickness;
}

export function update(dt) {
    const p = state.player;
    state.dayTime = (state.dayTime + dt / 240000) % 1;
    const activeTarget = p.activeDrone || p.activeSeamoth || p;

    let ax = 0, ay = 0;
    if (state.keys['arrowup'] || state.keys['w']) ay -= activeTarget.speed;
    if (state.keys['arrowdown'] || state.keys['s']) ay += activeTarget.speed;
    if (state.keys['arrowleft'] || state.keys['a']) ax -= activeTarget.speed;
    if (state.keys['arrowright'] || state.keys['d']) ax += activeTarget.speed;

    const isDrone = !!p.activeDrone;
    const isMoth = !!p.activeSeamoth;
    activeTarget.speed = isDrone ? 0.35 : (isMoth ? 0.6 : p.baseSpeed);

    if (!isDrone && !isMoth) {
        if (p.equipped === 'Seaglide') p.speed *= 2.5;
        else if (p.isInside) p.speed *= 0.75;
    }

    if (isMoth && activeTarget.energy <= 0) { ax = 0; ay = 0; }

    activeTarget.vx += ax; activeTarget.vy += ay;
    activeTarget.vx *= (isDrone || isMoth) ? 0.96 : p.friction;
    activeTarget.vy *= (isDrone || isMoth) ? 0.96 : p.friction;

    if (isMoth && activeTarget.dockedId) {
        if (Math.abs(ax) > 0.1 || Math.abs(ay) > 0.1) {
            activeTarget.dockedId = null;
            showMsg("SEAMOTH UNDOCKED");
        } else {
            const moonpool = state.baseParts.find(bp => bp.id === activeTarget.dockedId);
            if (moonpool) {
                activeTarget.x += (moonpool.x - activeTarget.x) * 0.1;
                activeTarget.y += (moonpool.y - activeTarget.y) * 0.1;
                activeTarget.vx = 0; activeTarget.vy = 0;
                activeTarget.rotation += (Math.PI / 2 - activeTarget.rotation) * 0.1;
            } else activeTarget.dockedId = null;
        }
    }

    activeTarget.x += activeTarget.vx; activeTarget.y += activeTarget.vy;

    const halfWidth = state.worldSize.width / 2;
    if (activeTarget.x < -halfWidth) { activeTarget.x = -halfWidth; activeTarget.vx = 0; }
    if (activeTarget.x > halfWidth) { activeTarget.x = halfWidth; activeTarget.vx = 0; }
    if (activeTarget.y < -500) activeTarget.y = -500;
    if (activeTarget.y > state.worldSize.height) activeTarget.y = state.worldSize.height;

    if (Math.abs(activeTarget.vx) > 0.1 || Math.abs(activeTarget.vy) > 0.1) {
        if (!isDrone && !isMoth) {
            const speedScale = (p.equipped === 'Seaglide' ? 0.025 : (p.isInside ? 0.01 : 0.015));
            p.legPhase += dt * speedScale;
        }
        const targetRot = Math.atan2(activeTarget.vy, activeTarget.vx);
        let diff = targetRot - activeTarget.rotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        activeTarget.rotation += diff * 0.15;
    }

    if (isMoth && !activeTarget.dockedId) {
        if (Math.abs(ax) > 0.1 || Math.abs(ay) > 0.1) activeTarget.energy = Math.max(0, activeTarget.energy - dt / 1000);
        state.baseParts.forEach(bp => {
            if (bp.type === 'moonpool' && Math.hypot(activeTarget.x - bp.x, activeTarget.y - bp.y) < 60) {
                activeTarget.dockedId = bp.id;
                showMsg("SEAMOTH DOCKED");
            }
        });
    }

    let basePower = 0;
    state.baseParts.forEach(bp => {
        if (bp.type === 'solar') {
            const isDay = state.dayTime > 0.2 && state.dayTime < 0.8;
            if (isDay) basePower += 0.5 * Math.max(0, 1 - (bp.y / 1500));
        }
        if (bp.type === 'room_lab') basePower += 0.8;
    });

    state.seamoths.forEach(m => {
        if (m.dockedId && basePower > 0.1) m.energy = Math.min(m.maxEnergy, m.energy + dt / 500);
    });

    state.drones.forEach(d => {
        if (d !== p.activeDrone) {
            d.vx *= 0.95; d.vy *= 0.95;
            d.x += d.vx; d.y += d.vy;
        }

        state.resources = state.resources.filter(r => {
            const dist = Math.hypot(d.x - r.x, d.y - r.y);
            if (dist < 40 && d.cargo.length < 5) {
                d.cargo.push(r.type);
                if (d === p.activeDrone) showMsg("DRONE CARGO ACQUIRED: " + r.type);
                return false;
            }
            return true;
        });

        const parentRoom = state.baseParts.find(bp => bp.id === d.parentId);
        if (parentRoom && d.cargo.length > 0 && Math.hypot(d.x - parentRoom.x, d.y - parentRoom.y) < 50) {
            d.cargo.forEach(item => {
                state.inventory[item] = (state.inventory[item] || 0) + 1;
            });
            showMsg(`${d.cargo.length} ITEMS TRANSFERRED FROM DRONE`);
            d.cargo = [];
            updateInventoryUI();
        }
    });

    state.stalkers.forEach(s => {
        const distToPlayer = Math.hypot(s.x - p.x, s.y - p.y);
        const distToMoth = p.activeSeamoth ? Math.hypot(s.x - p.activeSeamoth.x, s.y - p.activeSeamoth.y) : 9999;
        const predatorTarget = distToMoth < distToPlayer ? p.activeSeamoth : p;
        const dist = Math.min(distToPlayer, distToMoth);

        if (dist < 450 && !p.isInside) {
            s.state = 'hunting';
            const angle = Math.atan2(predatorTarget.y - s.y, predatorTarget.x - s.x);
            s.vx += Math.cos(angle) * 0.2;
            s.vy += Math.sin(angle) * 0.2;
            if (dist < 40 && Date.now() - s.lastAttack > 2000) {
                if (p.activeSeamoth) {
                    p.activeSeamoth.energy -= 10;
                    showMsg("SEAMOTH HULL INTEGRITY COMPROMISED");
                } else {
                    p.health -= 25;
                    showMsg("PREDATOR ATTACK");
                }
                s.lastAttack = Date.now();
                s.vx *= -5; s.vy *= -5;
            }
        } else {
            s.state = 'idle';
            s.vx += (Math.random() - 0.5) * 0.1;
            s.vy += (Math.random() - 0.5) * 0.1;
        }
        s.vx *= 0.98; s.vy *= 0.98;
        s.x += s.vx; s.y += s.vy;
        s.rotation = Math.atan2(s.vy, s.vx);
    });

    let insideAny = false;
    let insideObs = false;
    state.baseParts.forEach((bp, i) => {
        if (bp.type.startsWith('room') || bp.type === 'bubble' || bp.type === 'moonpool') {
            if (Math.abs(p.x - bp.x) < bp.width / 2 && Math.abs(p.y - bp.y) < bp.height / 2) {
                insideAny = true;
                if (bp.type === 'bubble') insideObs = true;
            }
            if (!insideAny && (bp.type.startsWith('room') || bp.type === 'moonpool')) {
                state.baseParts.forEach((bp2, j) => {
                    if (i < j && (bp2.type.startsWith('room') || bp2.type === 'moonpool')) {
                        const dist = Math.hypot(bp.x - bp2.x, bp.y - bp2.y);
                        if (dist < 300) {
                            if (isPointOnLine(p.x, p.y, bp.x, bp.y, bp2.x, bp2.y, 20)) insideAny = true;
                        }
                    }
                });
            }
        }
    });
    p.isInside = insideAny;
    p.isInObservation = insideObs;

    p.depth = Math.max(0, Math.floor(activeTarget.y / 10));
    if (p.y < 0) p.o2 = Math.min(p.maxO2, p.o2 + dt / 10);
    else if (p.isInside || p.activeSeamoth) p.o2 = Math.min(p.maxO2, p.o2 + (p.activeSeamoth || basePower > 0.1 ? dt / 8 : -dt / 2000));
    else p.o2 -= dt / 1000;

    p.hunger -= dt / 12000;
    if (p.hunger < 0) { p.hunger = 0; p.health -= dt / 200; }
    if (p.hunger > 90) p.health = Math.min(100, p.health + dt / 5000);
    if (p.o2 <= 0) { p.o2 = 0; p.health -= dt / 100; }

    if (p.health <= 0) {
        p.health = 100; p.o2 = p.maxO2; p.hunger = 100; p.x = 0; p.y = -100;
        exitDroneControl(); if (p.activeSeamoth) exitSeamoth();
        showMsg("RECONSTRUCTION COMPLETE");
    }

    if (!p.isInside && !isDrone) {
        state.resources = state.resources.filter(r => {
            const dist = Math.hypot(activeTarget.x - r.x, activeTarget.y - r.y);
            const collectRadius = isMoth ? 65 : 35;
            if (dist < collectRadius) {
                state.inventory[r.type] = (state.inventory[r.type] || 0) + 1;
                updateInventoryUI(); renderCrafting(); return false;
            }
            return true;
        });

        state.fish = state.fish.filter(f => {
            const dist = Math.hypot(activeTarget.x - f.x, activeTarget.y - f.y);
            const collectRadius = isMoth ? 65 : 30;
            if (dist < collectRadius) {
                state.inventory['Raw Fish'] = (state.inventory['Raw Fish'] || 0) + 1;
                updateInventoryUI(); renderCrafting(); return false;
            }
            return true;
        });
    }

    state.fish.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        if (f.x < -halfWidth || f.x > halfWidth) f.vx *= -1;
        if (f.y < 0 || f.y > state.worldSize.height) f.vy *= -1;
    });

    state.camera.x += (activeTarget.x - canvas.width / 2 - state.camera.x) * 0.1;
    state.camera.y += (activeTarget.y - canvas.height / 2 - state.camera.y) * 0.1;
    updateUI();
}
