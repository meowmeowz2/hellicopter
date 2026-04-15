import { builderMenu, msgEl, state } from './state.js';

export function showMsg(text) {
    msgEl.innerText = text;
    msgEl.style.opacity = 1;
    setTimeout(() => msgEl.style.opacity = 0, 2000);
}

export function toggleBuilderMenu() {
    builderMenu.style.display = (builderMenu.style.display === 'block') ? 'none' : 'block';
    if (builderMenu.style.display === 'block') {
        state.player.equipped = 'Habitat Builder';
        updateInventoryUI();
    }
}

export function selectBuildPiece(piece) {
    state.activeBuilding = piece;
    builderMenu.style.display = 'none';
    showMsg(`PLACING: ${piece.name.toUpperCase()}`);
}

export function eatItem(itemName) {
    if (state.inventory[itemName] > 0) {
        state.inventory[itemName]--;
        state.player.hunger = Math.min(100, state.player.hunger + (state.items[itemName].nutrition || 20));
        showMsg("VITALS STABILIZED");
        updateInventoryUI();
    }
}

export function updateUI() {
    document.getElementById('health-bar').style.width = state.player.health + '%';
    document.getElementById('health-val').innerText = Math.ceil(state.player.health);
    document.getElementById('hunger-bar').style.width = state.player.hunger + '%';
    document.getElementById('hunger-val').innerText = Math.ceil(state.player.hunger);
    document.getElementById('o2-bar').style.width = (state.player.o2 / state.player.maxO2 * 100) + '%';
    document.getElementById('o2-val').innerText = Math.ceil(state.player.o2) + 's';
    document.getElementById('depth-indicator').innerText = state.player.isInside && !state.player.activeDrone ? "HABITAT" : `DEPTH: ${state.player.depth}m`;

    if (state.player.activeDrone) {
        const drone = state.player.activeDrone;
        const cargoText = drone.cargo.length > 0 ? drone.cargo.join(", ") : "EMPTY";
        document.getElementById('drone-cargo').innerText = `CARGO (${drone.cargo.length}/5): ${cargoText}`;
        const parent = state.baseParts.find(bp => bp.id === drone.parentId);
        if (parent) {
            const dist = Math.floor(Math.hypot(drone.x - parent.x, drone.y - parent.y) / 10);
            document.getElementById('drone-status').innerText = `DIST: ${dist}m / LINK STABLE`;
        }
    }
    if (state.player.activeSeamoth) {
        const m = state.player.activeSeamoth;
        document.getElementById('moth-energy').innerText = `ENERGY: ${Math.ceil(m.energy)}%`;
        document.getElementById('moth-status').innerText = m.dockedId ? "DOCKED & CHARGING" : (m.energy < 20 ? "LOW POWER WARNING" : "COLLECTION ACTIVE");
    }
}

export function updateInventoryUI() {
    const invEl = document.getElementById('inventory');
    invEl.innerHTML = '';
    Object.keys(state.inventory).forEach(key => {
        if (state.inventory[key] > 0 && state.items[key].type !== 'tool') {
            const item = state.items[key] || { color: '#fff', symbol: '?', type: 'misc' };
            const slot = document.createElement('div');
            slot.className = `inventory-slot ${item.type === 'food' ? 'edible' : ''}`;
            slot.innerHTML = `<span style="color:${item.color}">${item.symbol}</span><span class="absolute bottom-0 right-1 text-[10px] font-bold">${state.inventory[key]}</span>`;
            if (item.type === 'food') slot.onclick = () => eatItem(key);
            invEl.appendChild(slot);
        }
    });
    const equipEl = document.getElementById('equipment-panel');
    equipEl.innerHTML = '';
    ['tank', 'fins'].forEach(st => {
        const itemName = state.equipment[st];
        const slot = document.createElement('div');
        if (itemName) {
            const item = state.items[itemName];
            slot.className = 'inventory-slot equipped';
            slot.innerHTML = `<span style="color:${item.color}">${item.symbol}</span><div class="equip-label">${itemName}</div>`;
        } else {
            slot.className = 'inventory-slot opacity-20';
            slot.innerHTML = `<span class="text-[10px]">${st.toUpperCase()}</span>`;
        }
        equipEl.appendChild(slot);
    });
    const toolEl = document.getElementById('tools-panel');
    toolEl.innerHTML = '';
    ['Seaglide', 'Flashlight', 'Habitat Builder'].forEach(tool => {
        if (state.inventory[tool]) {
            const slot = document.createElement('div');
            slot.className = `inventory-slot ${state.player.equipped === tool ? 'equipped' : ''}`;
            slot.innerHTML = `<span style="color:${state.items[tool].color}">${state.items[tool].symbol}</span><div class="equip-label">${tool}</div>`;
            slot.onclick = () => { state.player.equipped = (state.player.equipped === tool ? null : tool); updateInventoryUI(); };
            toolEl.appendChild(slot);
        }
    });
}

export function renderCrafting() {
    const list = document.getElementById('crafting-list');
    list.innerHTML = '';
    state.blueprints.forEach(bp => {
        if (bp.crafted && !bp.repeat) return;
        const canAfford = Object.keys(bp.cost).every(res => (state.inventory[res] || 0) >= bp.cost[res]);
        const btn = document.createElement('button');
        btn.className = 'crafting-btn p-2 rounded flex flex-col';
        btn.disabled = !canAfford;
        const costs = Object.entries(bp.cost).map(([r,a]) => `${a}${state.items[r]?.symbol || r}`).join(' ');
        btn.innerHTML = `<div class="font-bold">${bp.name}</div><div class="text-[9px] opacity-70">Cost: ${costs}</div>`;
        btn.onclick = () => {
            Object.entries(bp.cost).forEach(([res, amt]) => state.inventory[res] -= amt);
            bp.crafted = true; bp.effect(); updateInventoryUI(); renderCrafting();
            showMsg(`FABRICATED: ${bp.name}`);
        };
        list.appendChild(btn);
    });
}

export function renderBuildMenu() {
    const list = document.getElementById('build-options');
    list.innerHTML = '';
    state.habitatPieces.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'crafting-btn p-2 rounded text-[11px]';
        let costStr = Object.entries(p.cost).map(([res, amt]) => `${amt}${state.items[res]?.symbol || res}`).join(' ');
        btn.innerHTML = `<div class="font-bold text-cyan-200">${p.name}</div><div class="opacity-70 text-[9px]">${costStr}</div>`;
        btn.onclick = () => selectBuildPiece(p);
        list.appendChild(btn);
    });
}
