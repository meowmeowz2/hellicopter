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
const saveBtn = document.getElementById('save-btn');

function setMenuOpen(open) {
    menu.classList.toggle('hidden', !open);
    uiLayer.style.display = open ? 'none' : 'flex';
    state.gameStatus = open ? 'menu' : 'playing';
    continueBtn.disabled = !state.worldInitialized;
    saveBtn.disabled = !state.worldInitialized;
}

function setStatus(text) {
    statusEl.textContent = text;
}

function readSave() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveGame() {
    if (!state.worldInitialized) return;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveData()));
        setStatus('Game saved successfully.');
    } catch {
        setStatus('Save failed (storage unavailable).');
    }
}

function loadGame() {
    const saveData = readSave();
    if (!saveData) {
        setStatus('No save found.');
        return;
    }

    const ok = loadFromSaveData(saveData);
    if (ok) {
        setStatus('Save loaded. Welcome back.');
        setMenuOpen(false);
    } else {
        setStatus('Save data is invalid.');
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
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);

    if (readSave()) setStatus('Save detected. Load to continue.');
    else setStatus('No save loaded. Start a new dive.');

    setMenuOpen(true);
    window.requestAnimationFrame(gameLoop);
});
