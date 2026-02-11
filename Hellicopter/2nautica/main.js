import { SAVE_KEY, setUiHandlers, state } from './state.js';
import { draw } from './render.js';
import {
    exitDroneControl,
    exitSeamoth,
    getSaveData,
    handleCanvasMouseDown,
    handleContextMenu,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    initNewGame,
    loadFromSaveData,
    resize,
    update
} from './gameplay.js';
import { renderCrafting, showMsg, toggleBuilderMenu, updateInventoryUI } from './ui.js';

setUiHandlers({
    updateInventoryUI,
    renderCrafting,
    showMsg
});

function gameLoop(timestamp) {
    const dt = timestamp - state.lastTime;
    state.lastTime = timestamp;
    if (dt < 100 && state.gameStatus === 'playing' && state.worldInitialized) {
        update(dt);
        draw();
    }
    window.requestAnimationFrame(gameLoop);
}

const uiLayer = document.getElementById('ui-layer');
const menu = document.getElementById('main-menu');
const statusEl = document.getElementById('save-status');
const continueBtn = document.getElementById('continue-btn');
const saveSlotButtons = [...document.querySelectorAll('.slot-save-btn')];
const loadSlotButtons = [...document.querySelectorAll('.slot-load-btn')];

const getSlotKey = (slot) => `${SAVE_KEY}-slot-${slot}`;

function setMenuOpen(open) {
    menu.classList.toggle('hidden', !open);
    uiLayer.style.display = open ? 'none' : 'flex';
    state.gameStatus = open ? 'menu' : 'playing';
    continueBtn.disabled = !state.worldInitialized;
    saveSlotButtons.forEach(btn => { btn.disabled = !state.worldInitialized; });
    loadSlotButtons.forEach(btn => {
        btn.disabled = !readSave(btn.dataset.slot);
    });
}

function setStatus(text) {
    statusEl.textContent = text;
}

function readSave(slot = '1') {
    try {
        const raw = localStorage.getItem(getSlotKey(slot));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveGame(slot) {
    if (!state.worldInitialized) return;
    try {
        localStorage.setItem(getSlotKey(slot), JSON.stringify(getSaveData()));
        setStatus(`Saved to slot ${slot}.`);
        setMenuOpen(true);
    } catch {
        setStatus('Save failed (storage unavailable).');
    }
}

function loadGame(slot) {
    const saveData = readSave(slot);
    if (!saveData) {
        setStatus(`Slot ${slot} is empty.`);
        return;
    }

    const ok = loadFromSaveData(saveData);
    if (ok) {
        setStatus(`Loaded slot ${slot}. Welcome back.`);
        setMenuOpen(false);
    } else {
        setStatus(`Slot ${slot} data is invalid.`);
    }
}

function startNewGame() {
    initNewGame();
    setStatus('New game started.');
    setMenuOpen(false);
}

state.lastTime = 0;
window.addEventListener('resize', resize);
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (state.worldInitialized) setMenuOpen(state.gameStatus === 'playing');
        return;
    }
    handleKeyDown(e);
});
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('contextmenu', handleContextMenu);

const canvas = document.getElementById('gameCanvas');
canvas.addEventListener('mousedown', handleCanvasMouseDown);

window.exitDroneControl = exitDroneControl;
window.exitSeamoth = exitSeamoth;
window.toggleBuilderMenu = toggleBuilderMenu;

window.addEventListener('load', () => {
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('continue-btn').addEventListener('click', () => setMenuOpen(false));
    saveSlotButtons.forEach(btn => btn.addEventListener('click', () => saveGame(btn.dataset.slot)));
    loadSlotButtons.forEach(btn => btn.addEventListener('click', () => loadGame(btn.dataset.slot)));

    const hasAnySave = loadSlotButtons.some(btn => !!readSave(btn.dataset.slot));
    if (hasAnySave) setStatus('Saves detected. Choose a slot to load.');
    else setStatus('No save loaded. Start a new dive.');

    setMenuOpen(true);
    window.requestAnimationFrame(gameLoop);
});
