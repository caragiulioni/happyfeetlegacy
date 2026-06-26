// In this file we have some data that the other source files will use.
// Most of this data is stored in constants.
// Constants are just variables that never change. By convention,
// We write constants with upper case letters.

// The game scales to fit the viewport.
// Base aspect ratio is roughly 5:6 (width:height)
const GAME_HEIGHT = Math.floor(window.innerHeight * 0.88);
const GAME_WIDTH = Math.floor(GAME_HEIGHT * (5 / 6));

// Scale factor relative to the original 375px width
const SCALE = GAME_WIDTH / 375;

// Smaller blocks on mobile
const IS_MOBILE = window.innerWidth < 768;
const ENEMY_SCALE = IS_MOBILE ? 0.75 : 1;
const FONT_SCALE = IS_MOBILE ? 0.7 : 1;

// These constants represent the width and height of an enemy in pixels
// as well as the maximum number of enemies on screen at any given time.
const ENEMY_WIDTH = Math.floor(75 * SCALE * ENEMY_SCALE);
const ENEMY_HEIGHT = Math.floor(70 * SCALE * ENEMY_SCALE);
const MAX_ENEMIES = 5;

// These constants represent the player width and height.
const PLAYER_WIDTH = Math.floor((IS_MOBILE ? 60 : 75) * SCALE);
const PLAYER_HEIGHT = Math.floor((IS_MOBILE ? 44 : 54) * SCALE);
