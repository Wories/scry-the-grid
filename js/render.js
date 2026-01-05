import { App } from './state.js';
import { el, ctxFog, ctxGrid } from './dom.js';
import { getCellCenter, drawCellShape } from './math.js';

export function requestRender() {
    App.isDirty = true;
}

export function renderLoop() {
    if (App.isDirty) {
        renderFull();
        App.isDirty = false;
    }
    requestAnimationFrame(renderLoop);
}

export function renderFull() {
    if (!App.isReady) return;

    // 1. Fog Layer
    ctxFog.clearRect(0, 0, App.width, App.height);
    ctxFog.save();
    ctxFog.globalAlpha = App.fog.opacity;
    ctxFog.globalCompositeOperation = 'source-over';

    if (App.fogImage.src && App.fogImage.complete && App.fogImage.naturalWidth > 0) {
        ctxFog.drawImage(App.fogImage, 0, 0, App.width, App.height);
    } else {
        // Default Fog Color (dimmed to show base map)
        ctxFog.fillStyle = 'rgba(20, 20, 20, 0.7)';
        ctxFog.fillRect(0, 0, App.width, App.height);
    }
    ctxFog.restore();

    // 2. Punch Holes
    if (App.fog.revealed.size > 0) {
        ctxFog.save();
        ctxFog.globalCompositeOperation = 'destination-out';
        ctxFog.fillStyle = '#000';
        ctxFog.beginPath();
        App.fog.revealed.forEach(key => {
            const [c, r] = key.split(',').map(Number);
            const center = getCellCenter(c, r);
            drawCellShape(ctxFog, center.x, center.y, App.grid.size + 1);
        });
        ctxFog.fill();
        ctxFog.restore();
    }

    // 3. Grid Layer
    renderGridOnly();
}

export function renderGridOnly() {
    ctxGrid.clearRect(0, 0, App.width, App.height);
    const gridOp = App.mode === 'align' ? 0.9 : App.grid.opacity;

    if (gridOp > 0) {
        ctxGrid.save();
        ctxGrid.lineWidth = App.mode === 'align' ? 2 : 1.5;
        ctxGrid.strokeStyle = App.mode === 'align' ? '#00e5ff' : `rgba(255, 0, 0, ${gridOp})`;
        ctxGrid.beginPath();

        const s = App.grid.size;
        const factor = (App.grid.type === 'square') ? 2 : 1.5;
        const cols = Math.ceil(App.width / (factor * s)) + 2;
        const rows = Math.ceil(App.height / (factor * s)) + 2;

        for (let r = -2; r < rows; r++) {
            for (let c = -2; c < cols; c++) {
                const center = getCellCenter(c, r);
                drawCellShape(ctxGrid, center.x, center.y, s - 0.5);
            }
        }
        ctxGrid.stroke();
        ctxGrid.restore();
    }
}

export function renderPatch(c, r, isRevealing) {
    if (isRevealing) {
        ctxFog.save();
        ctxFog.globalCompositeOperation = 'destination-out';
        ctxFog.fillStyle = '#000';
        ctxFog.beginPath();
        const center = getCellCenter(c, r);
        drawCellShape(ctxFog, center.x, center.y, App.grid.size + 1);
        ctxFog.fill();
        ctxFog.restore();
    } else {
        renderFull(); // Removing hole requires redraw
    }
}


export function updateTransform() {
    el.world.style.transform = `translate(${App.view.x}px, ${App.view.y}px) scale(${App.view.scale})`;
}

export function resizeWorld(w, h) {
    App.width = w;
    App.height = h;
    el.world.style.width = w + 'px';
    el.world.style.height = h + 'px';
    el.canvasFog.width = w;
    el.canvasFog.height = h;
    el.canvasGrid.width = w;
    el.canvasGrid.height = h;
    requestRender();
}
