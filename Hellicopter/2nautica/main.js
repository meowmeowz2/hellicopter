import { setUiHandlers, state } from './state.js';
import { draw } from './render.js';
import {
    exitDroneControl,
    exitSeamoth,
    handleCanvasMouseDown,
    handleContextMenu,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    init,
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
    if (dt < 100) {
        update(dt);
        draw();
    }
    window.requestAnimationFrame(gameLoop);
}

state.lastTime = 0;
window.addEventListener('resize', resize);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('contextmenu', handleContextMenu);

const canvas = document.getElementById('gameCanvas');
canvas.addEventListener('mousedown', handleCanvasMouseDown);

window.exitDroneControl = exitDroneControl;
window.exitSeamoth = exitSeamoth;
window.toggleBuilderMenu = toggleBuilderMenu;

window.addEventListener('load', () => {
    init();
    window.requestAnimationFrame(gameLoop);
});
