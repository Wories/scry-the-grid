import { App } from './state.js';
import { el } from './dom.js';
import { renderFull, resizeWorld } from './render.js';

export function setupIO(centerCameraFunc) {
    const centerCamera = centerCameraFunc;

    // Reset Button
    document.getElementById('btn-reset').onclick = () => {
        if (confirm('Clear all revealed areas?')) {
            App.fog.revealed.clear();
            renderFull();
        }
    };

    // Save Project (.hfog)
    document.getElementById('btn-save').onclick = async () => {
        const zip = new JSZip();

        // 1. Data
        const data = {
            name: App.name,
            grid: App.grid,
            revealed: Array.from(App.fog.revealed)
        };
        zip.file("data.json", JSON.stringify(data));

        // 2. Images
        if (el.baseImg.naturalWidth > 0 && el.baseImg.src) {
            try {
                const blob = await fetch(el.baseImg.src).then(r => r.blob());
                zip.file("base.png", blob);
            } catch (e) { console.error(e); }
        }
        if (App.fogImage.naturalWidth > 0 && App.fogImage.src) {
            try {
                const blob = await fetch(App.fogImage.src).then(r => r.blob());
                zip.file("fog.png", blob);
            } catch (e) { console.error(e); }
        }

        // 3. Generate
        const content = await zip.generateAsync({ type: "blob" });

        // Smart Save (File System Access API)
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${App.name}.hfog`,
                    types: [{ description: 'HexFog Project', accept: { 'application/zip': ['.hfog'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                return;
            } catch (err) {
                // User cancelled or error
                return;
            }
        }

        // Fallback Download
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${App.name}.hfog`;
        a.click();
    };

    // Export Image (WebP)
    document.getElementById('btn-export-png').onclick = () => {
        const c = document.createElement('canvas');
        c.width = App.width;
        c.height = App.height;
        const ctx = c.getContext('2d');

        // 1. Base
        if (App.baseImageLoaded && el.baseImg.src && el.baseImg.naturalWidth > 0) {
            ctx.drawImage(el.baseImg, 0, 0, App.width, App.height);
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, c.width, c.height);
        }

        // 2. Fog
        ctx.drawImage(el.canvasFog, 0, 0);

        // 3. Grid
        ctx.drawImage(el.canvasGrid, 0, 0);

        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `${App.name}_${ts}.webp`;

        c.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        }, 'image/webp', 0.9);
    };

    // Load Project
    document.getElementById('file-load').onchange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.name.endsWith('.hfog') || f.name.endsWith('.zip')) {
            loadZipProject(f);
        } else {
            loadJsonProject(f);
        }
        e.target.value = '';
    };

    // Image Inputs
    document.getElementById('file-base').onchange = (e) => {
        const f = e.target.files[0];
        if (f) {
            const url = URL.createObjectURL(f);
            el.baseImg.onload = () => {
                resizeWorld(el.baseImg.naturalWidth, el.baseImg.naturalHeight);
                centerCamera();
                renderFull();
            };
            el.baseImg.src = url;
            App.baseImageLoaded = true;
        }
        e.target.value = '';
    };

    document.getElementById('file-fog').onchange = (e) => {
        const f = e.target.files[0];
        if (f) {
            const url = URL.createObjectURL(f);
            App.fogImage.onload = () => renderFull();
            App.fogImage.src = url;
        }
        e.target.value = '';
    };
}

function loadJsonProject(f) {
    const r = new FileReader();
    r.onload = (evt) => {
        try {
            const d = JSON.parse(evt.target.result);
            applyState(d);
            alert('JSON Project Loaded');
        } catch (err) { alert('Error loading JSON'); }
    };
    r.readAsText(f);
}

async function loadZipProject(f) {
    try {
        const zip = await JSZip.loadAsync(f);

        // Data
        if (zip.file("data.json")) {
            const text = await zip.file("data.json").async("string");
            applyState(JSON.parse(text));
        }

        // Base
        if (zip.file("base.png")) {
            const blob = await zip.file("base.png").async("blob");
            el.baseImg.src = URL.createObjectURL(blob);
            el.baseImg.onload = () => {
                resizeWorld(el.baseImg.naturalWidth, el.baseImg.naturalHeight);
                renderFull();
            };
            App.baseImageLoaded = true;
        }

        // Fog
        if (zip.file("fog.png")) {
            const blob = await zip.file("fog.png").async("blob");
            App.fogImage.src = URL.createObjectURL(blob);
            App.fogImage.onload = () => renderFull();
        }

        alert('Project Loaded');
    } catch (err) {
        console.error(err);
        alert('Error loading .hfog');
    }
}

function applyState(d) {
    if (d.name) App.name = d.name;
    if (d.grid) Object.assign(App.grid, d.grid);
    if (App.grid.ratio === undefined) App.grid.ratio = 1.0;
    if (d.revealed) App.fog.revealed = new Set(d.revealed);

    // Dispatch update event
    document.dispatchEvent(new CustomEvent('state-updated'));
}
