# Scry The Grid 👁️🗺️

> *Interactive Fog of War for Tabletop RPGs*

**Scry The Grid** is a lightweight, web-based tool designed for Game Masters. It allows you to upload a dungeon map, overlay a customizable grid, and interactively reveal "Fog of War" tiles during play.

Built for touchscreens and casting to a TV/Monitor, it runs entirely in the browser with no backend required.

## ✨ Features

* **🌫️ Interactive Fog of War:** Paint to reveal or hide areas of the map in real-time.
* **📐 Flexible Grids:** Supports **Hex (Pointy)**, **Hex (Flat)**, and **Square** grids.
* **🤏 Touch First:** Optimized for tablets with pinch-to-zoom and two-finger grid resizing.
* **🖼️ Image Alignment:** Dedicated "Align Mode" to perfectly match the grid to your imported map image.
* **💾 Save & Load:** Save your campaign progress as a `.hfog` file (bundled images + reveal state) to resume later.
* **📷 Export:** Snapshot your current view (with fog state) to a `.webp` image for sharing.
* **🔒 Offline Capable:** Runs locally; your maps stay on your device.

## 🚀 Getting Started

Since this project uses ES Modules, you need a local server to run it (to avoid CORS errors with file imports).

### Quick Start (Node.js)

1.  Clone the repository:
    ```bash
    git clone [https://github.com/wories/scry-the-grid.git](https://github.com/wories/scry-the-grid.git)
    cd scry-the-grid
    ```
2.  Install dependencies (optional, for the included server):
    ```bash
    npm install
    ```
3.  Start the app:
    ```bash
    npm start
    ```
4.  Open your browser to `http://localhost:3000`.

### No Install Method
You can also run this by serving the folder using any static site server (like Python's `http.server` or the "Live Server" extension for VS Code).

## 🎮 Controls

### Play Mode
* **1-Finger Drag:** Pan the map (if using Pan tool) or Paint Fog (if using Reveal/Hide tools).
* **2-Finger Pinch:** Zoom in/out.
* **Mouse Wheel:** Zoom in/out.

### Align Mode (Grid Setup)
* **1-Finger Drag:** Move the grid independent of the map image.
* **2-Finger Pinch:** Scale the grid size (hex/square size).

## 🛠️ How to Use

1.  **Load a Map:** Click the Folder icon (Top Bar) or go to Settings > Maps to upload a base image.
2.  **Align Grid:** Switch to the **"Align Grid"** tab. Drag the grid to line it up with your map's walls. Adjust the *Size* and *Ratio* sliders until it fits perfectly.
3.  **Play:** Switch back to **"Play"** mode.
4.  **Reveal:** Select the **Eye Icon** (Reveal Tool) and drag over the map to clear the fog.
5.  **Save:** Click the **Save Icon** to download a `.hfog` file containing your map and current fog state.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created by Wories - 2026*
