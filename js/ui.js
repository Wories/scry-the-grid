import { App } from './state.js';
import { el } from './dom.js';
import { requestRender, renderFull, renderGridOnly } from './render.js';

let _resetCameraStr = null;

export function setupUI(resetCamFunc) {
    _resetCameraStr = resetCamFunc;

    // --- 1. SETTINGS & ALIGNMENT ---
    // Safely check if the align button exists before attaching events
    if (el.inputs.alignToggle) {
        el.inputs.alignToggle.onclick = () => {
            if (App.mode === 'play') {
                setMode('align');
                toggleMenu(); // Auto close menu to see the grid
            } else {
                setMode('play');
            }
        };
    }

    // --- 2. TOOLBAR TOOLS ---
    if (el.tools.pan) el.tools.pan.onclick = () => setTool('pan');
    if (el.tools.reveal) el.tools.reveal.onclick = () => setTool('reveal');
    if (el.tools.hide) el.tools.hide.onclick = () => setTool('hide');

    // --- 3. MENUS & OVERLAYS ---
    const closeBtn = el.panels.menu.querySelector('#btn-close-menu');
    if (closeBtn) closeBtn.onclick = toggleMenu;
    
    const menuBtn = document.getElementById('btn-menu');
    if (menuBtn) menuBtn.onclick = toggleMenu;

    const resetBtn = document.getElementById('btn-reset-view');
    if (resetBtn) resetBtn.onclick = () => { if (_resetCameraStr) _resetCameraStr(); };

    if (el.panels.overlay) el.panels.overlay.onclick = toggleMenu;

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

    // --- 5. STATE UPDATES ---
    document.addEventListener('state-updated', updateUIFields);
    
    // Initial Run
    updateUIFields();
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
    ['pan', 'reveal', 'hide'].forEach(k => {
        if (el.tools[k]) el.tools[k].classList.toggle('active', k === t);
    });
}

function toggleMenu() {
    el.panels.menu.classList.toggle('open');
    el.panels.overlay.classList.toggle('visible');
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