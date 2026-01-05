import { App } from './state.js';
import { el } from './dom.js';
import { requestRender, renderFull, renderGridOnly } from './render.js';

let _resetCameraStr = null;

export function setupUI(resetCamFunc) {
    _resetCameraStr = resetCamFunc;

    // --- 1. SETTINGS & ALIGNMENT ---
    // Safely check if the align button exists before attaching events
    if (el.inputs.alignToggle) {
        el.inputs.alignToggle.onpointerdown = (e) => {
            e.preventDefault(); // Prevent focus/click
            if (App.mode === 'play') {
                setMode('align');
                toggleMenu(); // Auto close menu to see the grid
            } else {
                setMode('play');
            }
        };
    }

    // --- 2. TOOLBAR TOOLS ---
    // Use pointerdown for instant reaction
    const bindTool = (btn, tool) => {
        if (btn) btn.onpointerdown = (e) => {
            e.preventDefault();
            setTool(tool);
        };
    };
    bindTool(el.tools.pan, 'pan');
    bindTool(el.tools.reveal, 'reveal');
    bindTool(el.tools.hide, 'hide');
    bindTool(el.tools.pen, 'pen');
    bindTool(el.tools.eraser, 'eraser');

    // --- 3. MENUS & OVERLAYS ---
    const closeBtn = el.panels.menu.querySelector('#btn-close-menu');
    if (closeBtn) closeBtn.onpointerdown = toggleMenu;

    const menuBtn = document.getElementById('btn-menu');
    if (menuBtn) menuBtn.onpointerdown = toggleMenu;

    const resetBtn = document.getElementById('btn-reset-view');
    if (resetBtn) resetBtn.onpointerdown = () => { if (_resetCameraStr) _resetCameraStr(); };

    if (el.panels.overlay) el.panels.overlay.onpointerdown = toggleMenu;

    // --- 4. INPUTS ---
    // Project Name
    if (el.inputs.name) {
        el.inputs.name.oninput = (e) => { App.name = e.target.value || "New Project"; };
    }

    // Grid Shape
    if (el.inputs.shape) {
        el.inputs.shape.onchange = (e) => { App.grid.type = e.target.value; requestRender(); };
    }

    // Grid Size
    if (el.inputs.sizeRange) {
        el.inputs.sizeRange.oninput = (e) => {
            App.grid.size = parseFloat(e.target.value);
            if (el.inputs.sizeNum) el.inputs.sizeNum.value = App.grid.size;
            requestRender();
        };
    }
    if (el.inputs.sizeNum) {
        el.inputs.sizeNum.oninput = (e) => {
            let v = parseFloat(e.target.value);
            if (isNaN(v) || v < 10) v = 10;
            if (v > 300) v = 300;
            App.grid.size = v;
            if (el.inputs.sizeRange) el.inputs.sizeRange.value = v;
            requestRender();
        };
    }

    // Grid Ratio
    if (el.inputs.ratioRange) {
        el.inputs.ratioRange.oninput = (e) => {
            App.grid.ratio = parseFloat(e.target.value);
            if (el.inputs.ratioNum) el.inputs.ratioNum.value = App.grid.ratio.toFixed(2);
            requestRender();
        };
    }
    if (el.inputs.ratioNum) {
        el.inputs.ratioNum.oninput = (e) => {
            let v = parseFloat(e.target.value);
            if (isNaN(v) || v < 0.1) v = 0.5;
            if (v > 5.0) v = 2.0;
            App.grid.ratio = v;
            if (el.inputs.ratioRange) el.inputs.ratioRange.value = v;
            requestRender();
        };
    }

    // Opacities
    if (el.inputs.gridOp) el.inputs.gridOp.oninput = (e) => { App.grid.opacity = parseFloat(e.target.value); requestRender(); };
    if (el.inputs.fogOp) el.inputs.fogOp.oninput = (e) => { App.fog.opacity = parseFloat(e.target.value); requestRender(); };

    // Sub-Toolbar Slider
    if (el.inputs.subSize) {
        el.inputs.subSize.oninput = (e) => {
            const v = parseInt(e.target.value);
            if (App.tool === 'eraser') App.drawing.eraserSize = v;
            else App.drawing.penSize = v;
            updateUIFields(); // Sync active state
        };
    }

    if (el.inputs.drawClear) el.inputs.drawClear.onpointerdown = () => {
        if (confirm("Are you sure you want to clear all drawings?")) {
            const ctx = el.canvasDraw.getContext('2d');
            ctx.clearRect(0, 0, el.canvasDraw.width, el.canvasDraw.height);
        }
    };

    // Initialize Palette
    setupSubToolbar();

    // --- 5. STATE UPDATES ---
    document.addEventListener('state-updated', updateUIFields);

    // Initial Run
    updateUIFields();
}

const PALETTE = [
    '#f44336', // Red 500
    '#2196f3', // Blue 500
    '#4caf50', // Green 500
    '#ffc107', // Amber 500
    '#fafafa', // Gray 50
    '#212121'  // Gray 900
];

function setupSubToolbar() {
    el.colorSwatches.innerHTML = '';
    PALETTE.forEach(color => {
        const btn = document.createElement('div');
        btn.className = 'color-swatch';
        btn.style.backgroundColor = color;
        // Use pointerdown for rapid selection
        btn.onpointerdown = (e) => {
            e.preventDefault();
            App.drawing.color = color;
            updateUIFields();
        };
        el.colorSwatches.appendChild(btn);
    });
}

function setMode(m) {
    App.mode = m;

    if (m === 'play') {
        el.panels.play.classList.remove('hidden');
        el.panels.align.classList.remove('visible');
    } else {
        el.panels.play.classList.add('hidden');
        el.panels.align.classList.add('visible');
    }
    updateUIFields();
    requestRender();
}

function setTool(t) {
    App.tool = t;
    ['pan', 'reveal', 'hide', 'pen', 'eraser'].forEach(k => {
        if (el.tools[k]) el.tools[k].classList.toggle('active', k === t);
    });

    // Show/Hide Sub Toolbar
    if (t === 'pen' || t === 'eraser') {
        el.subToolbar.classList.add('visible');
        // Hide Color Swatches for Eraser
        el.colorSwatches.style.display = (t === 'eraser') ? 'none' : 'flex';
    } else {
        el.subToolbar.classList.remove('visible');
        // Hide cursor when not in drawing mode
        el.brushCursor.style.display = 'none';
    }

    updateUIFields();
}

function toggleMenu() {
    if (el.panels.menu) el.panels.menu.classList.toggle('open');
    if (el.panels.overlay) el.panels.overlay.classList.toggle('visible');
}

export function updateUIFields() {
    // Safely update values only if elements exist
    if (el.inputs.name) el.inputs.name.value = App.name;
    if (el.inputs.shape) el.inputs.shape.value = App.grid.type;
    if (el.inputs.sizeRange) el.inputs.sizeRange.value = App.grid.size;
    if (el.inputs.sizeNum) el.inputs.sizeNum.value = App.grid.size;
    if (el.inputs.ratioRange) el.inputs.ratioRange.value = App.grid.ratio;
    if (el.inputs.ratioNum) el.inputs.ratioNum.value = App.grid.ratio;
    if (el.inputs.gridOp) el.inputs.gridOp.value = App.grid.opacity;
    if (el.inputs.fogOp) el.inputs.fogOp.value = App.fog.opacity;

    // Drawing Sync
    const activeSize = (App.tool === 'eraser') ? App.drawing.eraserSize : App.drawing.penSize;
    if (el.inputs.subSize) el.inputs.subSize.value = activeSize;
    // Update legacy inputs if they exist (kept for compatibility or remove if desired)
    // if (el.inputs.drawColor) el.inputs.drawColor.value = App.drawing.color;

    // Update Palette Active State
    const swatches = el.colorSwatches.children;
    for (let i = 0; i < swatches.length; i++) {
        const s = swatches[i];
        s.classList.toggle('active', rgbToHex(s.style.backgroundColor) === App.drawing.color.toLowerCase() || s.style.backgroundColor === App.drawing.color);
    }

    // Update the "Unlock Grid" button text/color
    if (el.inputs.alignToggle) {
        if (App.mode === 'align') {
            el.inputs.alignToggle.innerText = "Done / Lock Grid (Return to Play)";
            el.inputs.alignToggle.style.borderColor = "#00bcd4";
            el.inputs.alignToggle.style.color = "#00bcd4";
        } else {
            el.inputs.alignToggle.innerText = "Unlock Grid (Enter Align Mode)";
            el.inputs.alignToggle.style.borderColor = "#555";
            el.inputs.alignToggle.style.color = "white";
        }
    }

    // Toggle Load/Export Buttons in Toolbar
    const btnLoad = document.getElementById('tool-load-bar');
    const btnExport = document.getElementById('btn-export-png');

    if (btnLoad && btnExport) {
        if (App.baseImageLoaded) {
            btnLoad.style.display = 'none';
            btnExport.style.display = 'flex';
        } else {
            btnLoad.style.display = 'flex';
            btnExport.style.display = 'none';
        }
    }

    requestRender();
}

// Helper to handle browser computed color string differences
function rgbToHex(col) {
    if (col.charAt(0) == 'r') {
        col = col.replace('rgb(', '').replace(')', '').split(',');
        var r = parseInt(col[0], 10).toString(16);
        var g = parseInt(col[1], 10).toString(16);
        var b = parseInt(col[2], 10).toString(16);
        r = r.length == 1 ? '0' + r : r; g = g.length == 1 ? '0' + g : g; b = b.length == 1 ? '0' + b : b;
        return '#' + r + g + b;
    }
    return col;
}