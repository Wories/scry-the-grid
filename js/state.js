export const App = {
    mode: 'play', // 'play' | 'align'
    tool: 'pan',  // 'pan' | 'reveal' | 'hide'
    name: 'New Project',

    grid: {
        type: 'pointy',
        size: 30.0,
        ratio: 1.0,
        x: 0, y: 0,
        opacity: 0.5
    },

    fog: {
        opacity: 1.0,
        revealed: new Set()
    },

    view: { x: 0, y: 0, scale: 1.0 },

    width: 1920, height: 1080, // Default canvas size until image loaded
    
    // Images
    fogImage: new Image(),
    baseImageLoaded: false,
    
    // NEW: Store the actual file data to ensure reliable saving on mobile
    baseMapBlob: null, 
    fogMapBlob: null,

    isReady: false,

    // Performance
    isDirty: false
};