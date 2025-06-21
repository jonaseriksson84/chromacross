import { initializeGameClient } from "./gameClient.js";

// Initialize the game when the script loads
// Data will be available from global variables set by the previous script
if (typeof window !== 'undefined' && window.puzzle && window.gameState) {
    initializeGameClient(window.puzzle, window.gameState);
}