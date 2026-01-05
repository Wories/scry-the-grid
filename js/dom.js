export const el = {
    viewport: document.getElementById('viewport'),
    world: document.getElementById('world'),
    baseImg: document.getElementById('layer-base'),
    canvasFog: document.getElementById('layer-fog'),
    canvasGrid: document.getElementById('layer-grid'),
    canvasDraw: document.getElementById('layer-draw'),

    // Tools Buttons
    tools: {
        pan: document.getElementById('tool-pan'),
        reveal: document.getElementById('tool-reveal'),
        hide: document.getElementById('tool-hide'),
        pen: document.getElementById('tool-pen'),
        eraser: document.getElementById('tool-eraser')
    },

    // UI Panels
    panels: {
        play: document.getElementById('play-toolbar'),
        align: document.getElementById('align-hud'),
        menu: document.getElementById('settings-menu'),
        overlay: document.getElementById('overlay')
    },

    // Inputs
    inputs: {
        name: document.getElementById('inp-project-name'),
        alignToggle: document.getElementById('btn-align-toggle'),
        shape: document.getElementById('inp-shape'),
        sizeRange: document.getElementById('inp-size-range'),
        sizeNum: document.getElementById('inp-size-num'),
        ratioRange: document.getElementById('inp-ratio-range'),
        ratioNum: document.getElementById('inp-ratio-num'),
        gridOp: document.getElementById('inp-grid-op'),
        fogOp: document.getElementById('inp-fog-op'),
        // Drawing Inputs
        drawOp: document.getElementById('inp-draw-op'),
        drawClear: document.getElementById('btn-clear-draw'),
        // Sub Toolbar
        subSize: document.getElementById('inp-draw-size-sub')
    },

    // New UI Elements
    subToolbar: document.getElementById('sub-toolbar'),
    colorSwatches: document.getElementById('color-swatches'),
    brushCursor: document.getElementById('brush-cursor')
};

export const ctxFog = el.canvasFog.getContext('2d', { willReadFrequently: true });
export const ctxGrid = el.canvasGrid.getContext('2d');
export const ctxDraw = el.canvasDraw.getContext('2d');