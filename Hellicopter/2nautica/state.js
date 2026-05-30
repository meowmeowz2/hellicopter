export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const lightCanvas = document.createElement('canvas');
export const lctx = lightCanvas.getContext('2d');
export const msgEl = document.getElementById('msg');
export const builderMenu = document.getElementById('builder-menu');

const uiHandlers = {
    updateInventoryUI: () => {},
    renderCrafting: () => {},
    showMsg: () => {}
};

export const setUiHandlers = (handlers) => {
    Object.assign(uiHandlers, handlers);
};

export const state = {
    gameStatus: 'menu',
    worldInitialized: false,
    player: {
        x: 0, y: -100, vx: 0, vy: 0, width: 20, height: 40, rotation: 0,
        baseSpeed: 0.15, speed: 0.15, friction: 0.94,
        health: 100, hunger: 100,
        o2: 45, maxO2: 45, depth: 0, legPhase: 0, equipped: null,
        isInside: false, isInObservation: false,
        activeDrone: null, activeSeamoth: null
    },
    camera: { x: 0, y: 0 },
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0 },
    inventory: {},
    equipment: { tank: null, fins: null },
    resources: [],
    fish: [],
    stalkers: [],
    baseParts: [],
    drones: [],
    seamoths: [],
    terrainPoints: [],
    lastTime: 0,
    keys: {},
    worldSize: { width: 15000, height: 8000 },
    activeBuilding: null,
    dayTime: 0.5,
    items: {
        'Titanium': { color: '#889', symbol: 'Ti', type: 'resource' },
        'Copper': { color: '#b87333', symbol: 'Cu', type: 'resource' },
        'Quartz': { color: '#eef', symbol: 'Qz', type: 'resource' },
        'Gold': { color: '#ffd700', symbol: 'Au', type: 'resource' },
        'Silver': { color: '#c0c0c0', symbol: 'Ag', type: 'resource' },
        'Lead': { color: '#4d5d53', symbol: 'Pb', type: 'resource' },
        'Raw Fish': { color: '#4af', symbol: '><>', type: 'resource' },
        'Cooked Fish': { color: '#fb0', symbol: '♨', type: 'food', nutrition: 35 },
        'Nutrient Block': { color: '#ff9', symbol: '■', type: 'food', nutrition: 75 },
        'Standard Tank': { color: '#fb0', symbol: 'O2', type: 'gear', slot: 'tank', o2: 90 },
        'High Capacity Tank': { color: '#f50', symbol: 'O2+', type: 'gear', slot: 'tank', o2: 180 },
        'Ultra High Capacity Tank': { color: '#f00', symbol: 'O2!', type: 'gear', slot: 'tank', o2: 360 },
        'Fins': { color: '#333', symbol: 'F', type: 'gear', slot: 'fins', speed: 0.22 },
        'Ultra Glide Fins': { color: '#0ff', symbol: 'F+', type: 'gear', slot: 'fins', speed: 0.32 },
        'Seaglide': { color: '#0f8', symbol: 'SG', type: 'tool' },
        'Flashlight': { color: '#ff0', symbol: 'FL', type: 'tool' },
        'Habitat Builder': { color: '#a0f', symbol: 'HB', type: 'tool' },
        'Seamoth': { color: '#fff', symbol: 'SM', type: 'vehicle' }
    },
    blueprints: [
        { id: 'cook', name: 'Cook Fish', cost: { 'Raw Fish': 1 }, crafted: false, repeat: true, effect: () => { state.inventory['Cooked Fish'] = (state.inventory['Cooked Fish'] || 0) + 1; } },
        { id: 'nutrient', name: 'Nutrient Block', cost: { 'Raw Fish': 2, 'Gold': 1 }, crafted: false, repeat: true, effect: () => { state.inventory['Nutrient Block'] = (state.inventory['Nutrient Block'] || 0) + 1; } },
        { id: 'tank1', name: 'Standard Tank', cost: { 'Titanium': 2 }, crafted: false, effect: () => { state.equipment.tank = 'Standard Tank'; applyGearEffects(); } },
        { id: 'tank2', name: 'High Capacity Tank', cost: { 'Titanium': 4, 'Quartz': 2, 'Silver': 1 }, crafted: false, unlock: 'tank1', effect: () => { state.equipment.tank = 'High Capacity Tank'; applyGearEffects(); } },
        { id: 'tank3', name: 'Ultra High Tank', cost: { 'Titanium': 6, 'Quartz': 4, 'Gold': 1 }, crafted: false, unlock: 'tank2', effect: () => { state.equipment.tank = 'Ultra High Capacity Tank'; applyGearEffects(); } },
        { id: 'fins1', name: 'Fins', cost: { 'Titanium': 1, 'Copper': 1 }, crafted: false, effect: () => { state.equipment.fins = 'Fins'; applyGearEffects(); } },
        { id: 'fins2', name: 'Ultra Glide Fins', cost: { 'Titanium': 2, 'Copper': 2, 'Silver': 1 }, crafted: false, unlock: 'fins1', effect: () => { state.equipment.fins = 'Ultra Glide Fins'; applyGearEffects(); } },
        { id: 'flashlight', name: 'Flashlight', cost: { 'Titanium': 1, 'Quartz': 1 }, crafted: false, effect: () => { state.inventory['Flashlight'] = 1; uiHandlers.updateInventoryUI(); } },
        { id: 'seaglide', name: 'Seaglide', cost: { 'Copper': 2, 'Titanium': 1, 'Quartz': 1 }, crafted: false, effect: () => { state.inventory['Seaglide'] = 1; uiHandlers.updateInventoryUI(); } },
        { id: 'builder', name: 'Habitat Builder', cost: { 'Titanium': 3, 'Copper': 1, 'Silver': 1 }, crafted: false, effect: () => {
            state.inventory['Habitat Builder'] = 1;
            document.getElementById('builder-toggle-container').style.display = 'block';
            uiHandlers.updateInventoryUI();
        } },
        { id: 'seamoth', name: 'Seamoth', cost: { 'Titanium': 10, 'Copper': 4, 'Lead': 2, 'Gold': 1 }, crafted: false, repeat: true, effect: () => {
            state.seamoths.push({ x: state.player.x + 50, y: state.player.y, vx: 0, vy: 0, rotation: 0, energy: 100, maxEnergy: 100, dockedId: null });
            uiHandlers.showMsg("SEAMOTH CONSTRUCTED");
        } }
    ],
    habitatPieces: [
        { name: 'Compartment', cost: { 'Titanium': 2 }, width: 120, height: 60, type: 'room' },
        { name: 'Multi-Purpose Room', cost: { 'Titanium': 6 }, width: 160, height: 140, type: 'room' },
        { name: 'Scanner Room', cost: { 'Titanium': 3, 'Copper': 2, 'Gold': 1 }, width: 130, height: 90, type: 'room_special' },
        { name: 'Bio-Reactor Module', cost: { 'Titanium': 4, 'Quartz': 2, 'Silver': 1 }, width: 100, height: 120, type: 'room_lab' },
        { name: 'Moonpool', cost: { 'Titanium': 8, 'Copper': 4, 'Lead': 2 }, width: 220, height: 160, type: 'moonpool' },
        { name: 'Observation Bubble', cost: { 'Quartz': 4, 'Titanium': 1 }, width: 100, height: 100, type: 'bubble' },
        { name: 'Vertical Connector', cost: { 'Titanium': 2 }, width: 50, height: 140, type: 'room' },
        { name: 'Reinforced Window', cost: { 'Quartz': 2, 'Lead': 1 }, width: 45, height: 35, type: 'window' },
        { name: 'Reinforcement Plate', cost: { 'Titanium': 2, 'Lead': 2 }, width: 60, height: 60, type: 'plate' },
        { name: 'Floodlight', cost: { 'Titanium': 1, 'Quartz': 1 }, width: 20, height: 20, type: 'light' },
        { name: 'Solar Panel', cost: { 'Quartz': 2, 'Copper': 1 }, width: 40, height: 15, type: 'solar' },
        { name: 'Storage Locker', cost: { 'Titanium': 2, 'Quartz': 1 }, width: 40, height: 60, type: 'locker' },
        { name: 'Foundation', cost: { 'Titanium': 4, 'Lead': 2 }, width: 280, height: 25, type: 'structure' }
    ]
};

export const SAVE_KEY = '2nautica-save-v1';

export function applyGearEffects() {
    const p = state.player;
    p.maxO2 = state.equipment.tank ? state.items[state.equipment.tank].o2 : 45;
    p.baseSpeed = state.equipment.fins ? state.items[state.equipment.fins].speed : 0.15;
    uiHandlers.updateInventoryUI();
}
