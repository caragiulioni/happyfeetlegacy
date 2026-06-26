


// We create an instance of the Engine class. Looking at our index.html,
// we see that it has a div with an id of `"app"`
const gameEngine = new Engine(document.getElementById('app'));
// keydownHandler is a variable that refers to a function. The function has one parameter
// (does the parameter name matter?) which is called event. As we will see below, this function
// will be called every time the user presses a key. The argument of the function call will be an object.
// The object will contain information about the key press, such as which key was pressed.
const keydownHandler = (event) => {
  play = () =>{
    console.log("playing sound");
  }
  // event.code contains a string. The string represents which key was press. If the
  // key is left, then we call the moveLeft method of gameEngine.player (where is this method defined?)
  if (event.code === 'ArrowLeft') {
    gameEngine.player.moveLeft();
    let audio = document.getElementById("move");
    audio.currentTime = 0;
    audio.play();
  }

  // If `event.code` is the string that represents a right arrow keypress,
  // then move our hamburger to the right
  if (event.code === 'ArrowRight') {
    gameEngine.player.moveRight();
    let audio = document.getElementById("move");
    audio.currentTime = 0;
    audio.play();
  }
};

const body = document.querySelector("body");
let audioDivs = `
  <audio id="move" hidden="true">
    <source src="./audio/jump.mp3">
  </audio>
  <audio id="hit" hidden="true">
    <source src="./audio/hit.mp3">
  </audio>
  <audio allow="autoplay" id="theme" hidden="true">
    <source src="./audio/theme-trimmed.mp3">
  </audio>
`;

body.insertAdjacentHTML("beforeend", audioDivs);

const app = document.getElementById("app");
app.style.width = `${GAME_WIDTH}px`;
app.style.height = `${GAME_HEIGHT}px`;

// Add title banner
const titleBanner = document.createElement('div');
titleBanner.id = 'title-banner';
titleBanner.innerText = 'HAPPY FEET!';
titleBanner.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #568FB0;
  color: white;
  font-size: ${Math.floor(28 * SCALE * FONT_SCALE)}px;
  font-weight: ${IS_MOBILE ? 700 : 800};
  text-align: center;
  padding: ${Math.floor(10 * SCALE)}px 0;
  border: ${Math.floor(4 * SCALE)}px solid white;
  box-sizing: border-box;
  z-index: 4000;
`;
app.appendChild(titleBanner);

const popUp = `
  <div id="pop-up-container" style="background-color: #568FB0; padding: 20px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 10000;">
    <p id="pop-up-paragraph" style="margin: 10px 0px; font-weight: ${IS_MOBILE ? 600 : 'bold'}; color: white; font-size: ${IS_MOBILE ? 18 : 24}px;">Let's Play!</p>
    <button id="pop-up-button">START</button>
  </div>
`;

//console.log(popUp);

app.insertAdjacentHTML("afterbegin", popUp);
// Track whether game is actively running
let gameActive = false;

// Touch controls — tap left half to move left, right half to move right
const touchHandler = (event) => {
  // Only handle touch movement when game is active
  if (!gameActive) return;

  // Prevent double-tap zoom and other default touch behaviors during gameplay
  event.preventDefault();

  const touch = event.touches[0];
  const gameApp = document.getElementById('app');
  const rect = gameApp.getBoundingClientRect();

  // Get tap position relative to game container
  const tapX = touch.clientX - rect.left;
  const midpoint = rect.width / 2;

  if (tapX < midpoint) {
    gameEngine.player.moveLeft();
  } else {
    gameEngine.player.moveRight();
  }

  let audio = document.getElementById("move");
  audio.currentTime = 0;
  audio.play();
};

// Add touch listener (passive: false so preventDefault works)
document.addEventListener('touchstart', touchHandler, { passive: false });

// We add an event listener to document. document the ancestor of all DOM nodes in the DOM.
document.addEventListener('keydown', keydownHandler);

const getPopUp = document.getElementById("pop-up-container");
const getButton = document.getElementById("pop-up-button");

getPopUp.style.border =  "5px solid white";
getPopUp.style.borderRadius = "5px";

getButton.style.backgroundColor = "#C9D8EB";
getButton.style.color = "#568FB0";
getButton.style.fontSize = `${IS_MOBILE ? 16 : 20}px`;
getButton.style.fontWeight = IS_MOBILE ? "600" : "700";
getButton.style.border = "3px solid white";
getButton.style.borderRadius = "5px";
getButton.style.cursor = "pointer";

// Detect if user is on a touch device
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

run = () =>{
  // Start music immediately on user interaction
  document.getElementById("theme").play();

  // Show instructions based on device type
  const popUpText = document.getElementById("pop-up-paragraph");
  const popUpButton = document.getElementById("pop-up-button");
  popUpButton.style.display = "none";

  if (isTouchDevice) {
    popUpText.innerHTML = "Tap left or right<br>to dodge the blocks!<br><br>Beat your highscore!";
  } else {
    popUpText.innerHTML = "Use \u2190 and \u2192 arrows<br>to avoid the blocks!<br><br>Beat your highscore!";
  }
  popUpText.style.fontSize = `${IS_MOBILE ? 16 : 20}px`;

  // After 8 seconds, hide instructions and start the game
  setTimeout(() => {
    getPopUp.style.display = "none";
    const playerImg = document.getElementById("player");
    playerImg.src = 'images/penguinMOVE.gif';
    gameActive = true;
    gameEngine.gameLoop();
  }, 8000);
}

getButton.addEventListener("click", run);

// We call the gameLoop method to start the game
// gameEngine.gameLoop();

