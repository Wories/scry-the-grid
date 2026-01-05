export const el = {
    viewport: document.getElementById('viewport'),
    world: document.getElementById('world'),
    baseImg: document.getElementById('layer-base'),
    canvasFog: document.getElementById('layer-fog'),
    canvasGrid: document.getElementById('layer-grid'),

    tabs: { play: document.getElementById('tab-play'), align: document.getElementById('tab-align') },
    tools: { pan: document.getElementById('tool-pan'), reveal: document.getElementById('tool-reveal'), hide: document.getElementById('tool-hide') },
    panels: { play: document.getElementById('play-toolbar'), align: document.getElementById('align-hud'), menu: document.getElementById('settings-menu'), overlay: document.getElementById('overlay') },
    inputs: {
        name: document.getElementById('inp-project-name'),
        shape: document.getElementById('inp-shape'),
        sizeRange: document.getElementById('inp-size-range'),
        sizeNum: document.getElementById('inp-size-num'),
        ratioRange: document.getElementById('inp-ratio-range'),
        ratioNum: document.getElementById('inp-ratio-num'),
        gridOp: document.getElementById('inp-grid-op'),
        fogOp: document.getElementById('inp-fog-op')
    }
};

export const ctxFog = el.canvasFog.getContext('2d', { willReadFrequently: true });
export const ctxGrid = el.canvasGrid.getContext('2d');
