import { App } from './state.js';
import { el, ctxDraw } from './dom.js';
import { getGridIndex } from './math.js';
import { requestRender, renderPatch, updateTransform, renderGridOnly, renderFull } from './render.js';

const Input = {
    pointers: new Map(),
    startView: null, startGrid: null,
    startDist: 0, startCenter: null,
    lastDrawPos: null, // [x, y] for drawing interpolation

    // Helpers
    getCenter: () => {
        let x = 0, y = 0, c = 0;
        for (let p of Input.pointers.values()) { x += p.x; y += p.y; c++; }
        return { x: x / c, y: y / c };
    },
    getDist: () => {
        const p = Array.from(Input.pointers.values());
        return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    },
    toWorld: (sx, sy) => {
        const rect = el.viewport.getBoundingClientRect();
        const vx = sx - rect.left; const vy = sy - rect.top;
        return {
            x: (vx - App.view.x) / App.view.scale,
            y: (vy - App.view.y) / App.view.scale
        };
    }
};

export function setupEventListeners() {
    el.viewport.addEventListener('pointerdown', e => {
        e.preventDefault();
        el.viewport.setPointerCapture(e.pointerId);
        Input.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });

        Input.startView = { ...App.view };
        Input.startGrid = { ...App.grid };

        // INSTANT PAINT / DRAW START
        if (App.mode === 'play' && Input.pointers.size === 1) {
            if (App.tool === 'reveal' || App.tool === 'hide') {
                performHit(e.clientX, e.clientY);
            } else if (App.tool === 'pen' || App.tool === 'eraser') {
                const w = Input.toWorld(e.clientX, e.clientY);
                Input.lastDrawPos = [w.x, w.y];

                // Configure Context
                ctxDraw.lineCap = 'round';
                ctxDraw.lineJoin = 'round';

                // Use correct size based on tool
                const size = (App.tool === 'eraser') ? App.drawing.eraserSize : App.drawing.penSize;
                ctxDraw.lineWidth = size;

                if (App.tool === 'eraser') {
                    ctxDraw.globalCompositeOperation = 'destination-out';
                } else {
                    ctxDraw.globalCompositeOperation = 'source-over';
                    ctxDraw.strokeStyle = App.drawing.color;
                    ctxDraw.globalAlpha = App.drawing.opacity;
                }

                ctxDraw.beginPath();
                ctxDraw.moveTo(w.x, w.y);
                ctxDraw.lineTo(w.x, w.y); // Dot
                ctxDraw.stroke();

                // Update Cursor immediately for feedback
                updateCursor(e.clientX, e.clientY, size);
            }
        }

        // PINCH INIT
        if (Input.pointers.size === 2) {
            Input.startDist = Input.getDist();
            Input.startCenter = Input.getCenter();
            Input.startView = { ...App.view };
            Input.startGrid = { ...App.grid };
        }
    });

    el.viewport.addEventListener('pointermove', e => {
        if (!Input.pointers.has(e.pointerId)) return;
        e.preventDefault();

        const p = Input.pointers.get(e.pointerId);
        p.x = e.clientX; p.y = e.clientY;
        Input.pointers.set(e.pointerId, p);

        if (Input.pointers.size === 1) {
            const dx = p.x - p.startX;
            const dy = p.y - p.startY;

            if (App.mode === 'play') {
                if (App.tool === 'pan') {
                    App.view.x = Input.startView.x + dx;
                    App.view.y = Input.startView.y + dy;
                    updateTransform();
                } else if (App.tool === 'reveal' || App.tool === 'hide') {
                    // Drag Paint Fog
                    performHit(p.x, p.y);
                } else if (App.tool === 'pen' || App.tool === 'eraser') {
                    // Drag Draw
                    const w = Input.toWorld(e.clientX, e.clientY);

                    if (Input.lastDrawPos) {
                        ctxDraw.beginPath();
                        ctxDraw.moveTo(Input.lastDrawPos[0], Input.lastDrawPos[1]);
                        ctxDraw.lineTo(w.x, w.y);
                        ctxDraw.stroke();
                    }
                    Input.lastDrawPos = [w.x, w.y];
                }
            } else {
                // Align: Pan Grid
                App.grid.x = Input.startGrid.x + (dx / App.view.scale);
                App.grid.y = Input.startGrid.y + (dy / App.view.scale);
                requestRender();
            }
        } else if (Input.pointers.size === 2) {
            const currDist = Input.getDist();
            const currCenter = Input.getCenter();
            const scale = (Input.startDist > 0) ? currDist / Input.startDist : 1;
            handlePinch(scale, Input.startCenter, currCenter);
        }

        // Always update cursor hover position if pen/eraser active
        if (App.tool === 'pen' || App.tool === 'eraser') {
            const size = (App.tool === 'eraser') ? App.drawing.eraserSize : App.drawing.penSize;
            updateCursor(e.clientX, e.clientY, size);
        } else {
            el.brushCursor.style.display = 'none';
        }
    });

    el.viewport.addEventListener('pointerup', e => {
        Input.pointers.delete(e.pointerId);
        el.viewport.releasePointerCapture(e.pointerId);
        if (Input.pointers.size === 1) {
            const rem = Input.pointers.values().next().value;
            rem.startX = rem.x; rem.startY = rem.y;
            Input.startView = { ...App.view };
            Input.startGrid = { ...App.grid };
        }

        Input.lastDrawPos = null; // Reset draw state

        if (App.mode === 'align') renderFull();
    });

    el.viewport.addEventListener('wheel', e => {
        e.preventDefault();
        const factor = 1 + (Math.sign(e.deltaY) * -0.1);
        const center = { x: e.clientX, y: e.clientY };
        Input.startView = { ...App.view };
        Input.startGrid = { ...App.grid };
        handlePinch(factor, center, center);
    }, { passive: false });
}


function handlePinch(factor, startC, currC) {
    if (App.mode === 'play' && App.tool === 'pan') {
        let ns = Input.startView.scale * factor;
        if (!Number.isFinite(ns)) ns = 1;
        ns = Math.max(0.05, Math.min(ns, 20));

        const rect = el.viewport.getBoundingClientRect();

        // Calculate offsets relative to viewport top-left
        const mx_start = startC.x - rect.left;
        const my_start = startC.y - rect.top;

        const mx_curr = currC.x - rect.left; // usually same as start for mouse wheel
        const my_curr = currC.y - rect.top;

        // Formula: NewPos = Mouse - (MouseInWorld * NewScale)
        // Or essentially: we want the WorldPoint under the mouse to remain at the same ScreenPoint.
        // WorldPoint = (Mouse - ViewPos) / Scale
        // NewViewPos = Mouse - (WorldPoint * NewScale)

        // Derived from Input.startView:
        const worldX = (mx_start - Input.startView.x) / Input.startView.scale;
        const worldY = (my_start - Input.startView.y) / Input.startView.scale;

        App.view.x = mx_curr - (worldX * ns);
        App.view.y = my_curr - (worldY * ns);
        App.view.scale = ns;

        updateTransform();
    } else if (App.mode === 'align') {
        let ns = Input.startGrid.size * factor;
        ns = Math.max(10, Math.min(ns, 300));
        App.grid.size = ns;

        // Sync UI (Needs manual sync or event dispatch ideally, but accessing DOM directly for now)
        // Ideally UI info should be observed state, but for this refactor we'll just update logic
        // We will expose a sync helper in UI if needed, but for now we rely on the render loop visual
        // Actually, we must update the UI inputs otherwise they desync.
        // We'll dispatch a custom event or just update el directly since we imported it.
        el.inputs.sizeRange.value = ns;
        el.inputs.sizeNum.value = ns.toFixed(1);

        requestRender();
    }
}

function performHit(clientX, clientY) {
    const coords = Input.toWorld(clientX, clientY);
    if (coords.x < 0 || coords.y < 0 || coords.x > App.width || coords.y > App.height) return;

    const idx = getGridIndex(coords.x, coords.y);
    const key = `${idx.c},${idx.r}`;

    let changed = false;
    if (App.tool === 'reveal') {
        if (!App.fog.revealed.has(key)) {
            App.fog.revealed.add(key);
            requestRender();
            changed = true;
        }
    } else if (App.tool === 'hide') {
        if (App.fog.revealed.has(key)) {
            App.fog.revealed.delete(key);
            requestRender();
            changed = true;
        }
    }
}

function updateCursor(x, y, size) {
    el.brushCursor.style.display = 'block';
    el.brushCursor.style.left = x + 'px';
    el.brushCursor.style.top = y + 'px';
    const screenW = size * App.view.scale;
    el.brushCursor.style.width = screenW + 'px';
    el.brushCursor.style.height = screenW + 'px';
}
