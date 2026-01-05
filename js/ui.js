import { App } from './state.js';
import { el } from './dom.js';
import { requestRender, renderFull, renderGridOnly } from './render.js';
// import { resetCamera } from './main.js'; // Removed to fix circular dep and undefined export

// To solve circular ref from main->ui->main:
// We will assign resetCamera later or pass it in setupUI

let _resetCameraStr = null;

export function setupUI(resetCamFunc) {
    _resetCameraStr = resetCamFunc;

    // Tabs
    el.tabs.play.onclick = () => setMode('play');
    el.tabs.align.onclick = () => setMode('align');

    // Tools
    el.tools.pan.onclick = () => setTool('pan');
    el.tools.reveal.onclick = () => setTool('reveal');
    el.tools.hide.onclick = () => setTool('hide');

    // Menu
    el.panels.menu.querySelector('#btn-close-menu').onclick = toggleMenu;
    document.getElementById('btn-menu').onclick = toggleMenu;
    document.getElementById('btn-reset-view').onclick = () => { if (_resetCameraStr) _resetCameraStr(); };
    el.panels.overlay.onclick = toggleMenu;

    // Inputs
    el.inputs.shape.onchange = (e) => { App.grid.type = e.target.value; requestRender(); };

    el.inputs.sizeRange.oninput = (e) => {
        App.grid.size = parseFloat(e.target.value);
        el.inputs.sizeNum.value = App.grid.size;
        requestRender();
    };

    el.inputs.sizeNum.oninput = (e) => {
        let v = parseFloat(e.target.value);
        if (isNaN(v) || v < 10) v = 10;
        if (v > 300) v = 300;
        App.grid.size = v;
        el.inputs.sizeRange.value = v;
        requestRender();
    };

    el.inputs.ratioRange.oninput = (e) => {
        App.grid.ratio = parseFloat(e.target.value);
        el.inputs.ratioNum.value = App.grid.ratio.toFixed(2);
        requestRender();
    };

    el.inputs.ratioNum.oninput = (e) => {
        let v = parseFloat(e.target.value);
        if (isNaN(v) || v < 0.1) v = 0.5;
        if (v > 5.0) v = 2.0;
        App.grid.ratio = v;
        el.inputs.ratioRange.value = v;
        requestRender();
    };

    el.inputs.gridOp.oninput = (e) => { App.grid.opacity = parseFloat(e.target.value); requestRender(); };
    el.inputs.fogOp.oninput = (e) => { App.fog.opacity = parseFloat(e.target.value); requestRender(); };

    // Listen for external state updates (e.g. from IO)
    document.addEventListener('state-updated', updateUIFields);
}

function setMode(m) {
    App.mode = m;
    el.tabs.play.classList.toggle('active', m === 'play');
    el.tabs.align.classList.toggle('active', m === 'align');

    if (m === 'play') {
        el.panels.play.classList.remove('hidden');
        el.panels.align.classList.remove('visible');
    } else {
        el.panels.play.classList.add('hidden');
        el.panels.align.classList.add('visible');
    }
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
    el.inputs.name.value = App.name;
    el.inputs.shape.value = App.grid.type;
    el.inputs.sizeRange.value = App.grid.size;
    el.inputs.sizeNum.value = App.grid.size;
    el.inputs.ratioRange.value = App.grid.ratio;
    el.inputs.ratioNum.value = App.grid.ratio;
    el.inputs.gridOp.value = App.grid.opacity;
    requestRender();
}
