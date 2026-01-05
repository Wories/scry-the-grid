import { App } from './state.js';
import { el } from './dom.js';
import { renderLoop, renderFull, requestRender, updateTransform, resizeWorld } from './render.js';
import { setupEventListeners } from './input.js';
import { setupUI, updateUIFields } from './ui.js';
import { setupIO } from './io.js';

function init() {
    App.width = window.innerWidth;
    App.height = window.innerHeight;

    resizeWorld(App.width, App.height);
    App.isReady = true;

    centerCamera();

    setupEventListeners();
    setupUI(centerCamera); // Pass centerCamera to UI to avoid circular dependency
    setupIO(centerCamera);

    // Start Loop
    requestAnimationFrame(renderLoop);
}

export function centerCamera() {
    const vw = el.viewport.clientWidth;
    const vh = el.viewport.clientHeight;
    const scale = Math.min(vw / App.width, vh / App.height, 1) * 0.9;
    App.view.scale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    App.view.x = (vw - App.width * App.view.scale) / 2;
    App.view.y = (vh - App.height * App.view.scale) / 2;
    updateTransform();
}

// Export for other modules if needed (via window or explicit export)
// Since this is the entry point, we start init
init();

// Expose internal helpers for IO module to use via events or shared exports
export { updateUIFields };
