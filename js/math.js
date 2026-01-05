import { App } from './state.js';

// Convert World Pixel (x,y) -> Grid Index {c, r}
export function getGridIndex(x, y) {
    const s = App.grid.size;
    const r = App.grid.ratio;

    // Normalize space by reversing offsets and aspect ratio
    const px = (x - App.grid.x) / r; // Scale X down to normalized square/hex space
    const py = y - App.grid.y;

    if (App.grid.type === 'square') {
        const col = Math.round(px / (2 * s));
        const row = Math.round(py / (2 * s));
        return { c: col, r: row };
    }

    // Hex Math
    let q, hexR;
    if (App.grid.type === 'pointy') {
        q = (Math.sqrt(3) / 3 * px - 1 / 3 * py) / s;
        hexR = (2 / 3 * py) / s;
    } else { // Flat
        q = (2 / 3 * px) / s;
        hexR = (-1 / 3 * px + Math.sqrt(3) / 3 * py) / s;
    }
    return axialRound(q, hexR);
}

function axialRound(q, r) {
    const s = -q - r;
    let rx = Math.round(q);
    let ry = Math.round(r);
    let rz = Math.round(s);

    const x_diff = Math.abs(rx - q);
    const y_diff = Math.abs(ry - r);
    const z_diff = Math.abs(rz - s);

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry - rz;
    } else if (y_diff > z_diff) {
        ry = -rx - rz;
    } else {
        rz = -rx - ry;
    }
    return cubeToOffset(rx, ry);
}

function cubeToOffset(q, r) {
    if (App.grid.type === 'pointy') { // Odd-R
        const col = q + (r - (r & 1)) / 2;
        const row = r;
        return { c: col, r: row };
    } else { // Odd-Q
        const col = q;
        const row = r + (q - (q & 1)) / 2;
        return { c: col, r: row };
    }
}

// Draw Helpers
export function getCellCenter(c, r) {
    let cx = 0, cy = 0;
    const s = App.grid.size;

    if (App.grid.type === 'pointy') {
        const w = Math.sqrt(3) * s;
        const h = 2 * s;
        cx = (c * w) + ((Math.abs(r) % 2 === 1) ? w / 2 : 0);
        cy = (r * h * 0.75);
    } else if (App.grid.type === 'flat') {
        const w = 2 * s;
        const h = Math.sqrt(3) * s;
        cx = (c * w * 0.75);
        cy = (r * h) + ((Math.abs(c) % 2 === 1) ? h / 2 : 0);
    } else { // Square
        cx = c * (2 * s);
        cy = r * (2 * s);
    }

    // Apply aspect ratio and offset
    return {
        x: (cx * App.grid.ratio) + App.grid.x, // Scale X
        y: cy + App.grid.y
    };
}

export function drawCellShape(context, x, y, size) {
    const ratio = App.grid.ratio;

    if (App.grid.type === 'square') {
        // Center rectangle properly with ratio
        context.rect(x - (size * ratio), y - size, size * 2 * ratio, size * 2);
    } else {
        const startAngle = (App.grid.type === 'pointy') ? 30 : 0;

        // Calculate first point manually to apply ratio
        let angle = Math.PI / 180 * startAngle;
        context.moveTo(x + (size * Math.cos(angle) * ratio), y + size * Math.sin(angle));

        for (let i = 1; i <= 6; i++) {
            angle = Math.PI / 180 * (60 * i + startAngle);
            context.lineTo(x + (size * Math.cos(angle) * ratio), y + size * Math.sin(angle));
        }
        context.closePath();
    }
}
