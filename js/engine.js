

// The engine class will only be instantiated once. It contains all the logic
// of the game relating to the interactions between the player and the
// enemy and also relating to how our enemies are created and evolve over time
class Engine {
  // The constructor has one parameter. It will refer to the DOM node that we will be adding everything to.
  // You need to provide the DOM node when you create an instance of the class
  constructor(theRoot) {
    // We need the DOM element every time we create a new enemy so we
    // store a reference to it in a property of the instance.
    this.root = theRoot;
    // We create our hamburger.
    // Please refer to Player.js for more information about what happens when you create a player
    this.player = new Player(this.root);
    // Initially, we have no enemies in the game. The enemies property refers to an array
    // that contains instances of the Enemy class
    this.enemies = [];
    this.text = new Text(this.root);
    this.snow = new Snow(this.root);
    this.hiScore = 0;
    // We add the background image to the game
    addBackground(this.root);
  }

  // The gameLoop will run every few milliseconds. It does several things
  //  - Updates the enemy positions
  //  - Detects a collision between the player and any enemy
  //  - Removes enemies that are too low from the enemies array
  gameLoop = () => {
    //console.log(this.hiScore);
    // This code is to see how much time, in milliseconds, has elapsed since the last
    // time this method was called.
    // (new Date).getTime() evaluates to the number of milliseconds since January 1st, 1970 at midnight.
    if (this.lastFrame === undefined) {
      this.lastFrame = new Date().getTime();
    }
    let timeDiff = new Date().getTime() - this.lastFrame;

    // Cap timeDiff to prevent blocks from jumping after lag spikes
    if (timeDiff > 40) timeDiff = 40;

    this.lastFrame = new Date().getTime();
  
    // console.log(this.gameStartTime);
    
    if (this.gameStartTime === undefined){
      this.gameStartTime = new Date().getTime();
      this.snow.start();
    }

    this.timeElapsed = new Date().getTime() - this.gameStartTime;

    // Only update score display every 10 frames to reduce DOM thrashing
    this.frameCount = (this.frameCount || 0) + 1;
    let currentScore = this.timeElapsed;
    if (currentScore > this.hiScore){
      this.hiScore = currentScore;
    }
    if (this.frameCount % 10 === 0) {
      this.text.update(currentScore);
      this.text.highScore(this.hiScore);
    }

    // We use the number of milliseconds since the last call to gameLoop to update the enemy positions.
    // Furthermore, if any enemy is below the bottom of our game, its destroyed property will be set. (See Enemy.js)
    this.enemies.forEach((enemy) => {
      enemy.update();
    });

    // We remove all the destroyed enemies from the array referred to by \`this.enemies\`.
    // We use filter to accomplish this.
    // Remember: this.enemies only contains instances of the Enemy class.
    this.enemies = this.enemies.filter((enemy) => {
      //MINE 
      //Evaluates true/false
      //console.log(!enemy.destroyed);
      return !enemy.destroyed;
    });

    // We need to perform the addition of enemies until we have enough enemies.
    // Only add one enemy per frame to prevent burst spawning
    if (this.enemies.length < MAX_ENEMIES) {
      const spot = nextEnemySpot(this.enemies);
      this.enemies.push(new Enemy(this.root, spot));
    }

    // Render snow in the same frame
    this.snow.render();

    // We check if the player is dead. If he is, we alert the user
    // and return from the method (Why is the return statement important?)
    if (this.isPlayerDead()) {
      //MINE
      //STOP GAME ON WINDOW ALERT
      //GAME OVER POP UP with score
      //BUTTON to reload game
      // window.alert(`Game Over, your score was ${this.timeElapsed}`);
      this.snow.stop();
      return;
    }

    // If the player is not dead, then we put a setTimeout to run the gameLoop in 20 milliseconds
    // setTimeout(this.gameLoop, 20);

    //PLAY
    this.animFrame = requestAnimationFrame(this.gameLoop);
    //PAUSE
    // cancelAnimationFrame(this.animFrame);
  };

  // This method is not implemented correctly, which is why
  // the burger never dies. In your exercises you will fix this method.

  //MINE
  //conditional to evaluate whether player has hit position of ememy
  isPlayerDead = () => {
    let dead = false;
    const playerImg = document.getElementById("player");

    // Shrink the hit boxes a bit for more forgiving collisions
    const padding = Math.floor(15 * SCALE);
    const playerLeft = this.player.x + padding;
    const playerRight = this.player.x + PLAYER_WIDTH - padding;
    const playerTop = this.player.y + padding;
    const playerBottom = this.player.y + PLAYER_HEIGHT;

    this.enemies.forEach(enemy =>{
      const enemyLeft = enemy.x + padding;
      const enemyRight = enemy.x + ENEMY_WIDTH - padding;
      const enemyTop = enemy.y + padding;
      const enemyBottom = enemy.y + ENEMY_HEIGHT - padding;

      // Bounding box overlap check
      if (enemyRight > playerLeft &&
          enemyLeft < playerRight &&
          enemyBottom > playerTop &&
          enemyTop < playerBottom) {
        //console.log("player dead");
        // playerImg.src = 'images/penguinHIT.png';
        playerImg.src = 'images/penguinPOWPOW.png';
        playerImg.style.marginTop = "-25px";
        const audio = document.getElementById("hit");
        audio.currentTime = 0;
        audio.play();
        const app = document.getElementById("app");
        const popUp = document.getElementById("pop-up-container");
        popUp.style.display = "block";
        popUp.style.zIndex = 10000000;
        const popUpText = document.getElementById("pop-up-paragraph");
        popUpText.innerText = "Try Again!";
        popUpText.style.fontSize = `${IS_MOBILE ? 18 : 24}px`;
        const getButton = document.getElementById("pop-up-button");
        getButton.style.display = "inline-block";
        getButton.innerText = "Reload";

        // Remove old listener by replacing button with clone
        const newButton = getButton.cloneNode(true);
        getButton.parentNode.replaceChild(newButton, getButton);

        newButton.addEventListener("click", () =>{
            document.addEventListener('keydown', keydownHandler);
            document.addEventListener('touchstart', touchHandler, { passive: false });
            gameActive = true;
            playerImg.style.marginTop = "0px";
            getPopUp.style.display = "none";
            playerImg.src = './images/penguinMOVE.gif';
            // Clear all existing enemies from screen and reset state
            this.enemies.forEach(enemy => {
              if (enemy.domElement && enemy.domElement.parentNode) {
                enemy.domElement.parentNode.removeChild(enemy.domElement);
              }
            });
            this.enemies = [];
            this.lastFrame = undefined;
            this.gameStartTime = undefined;
            this.snow.reset();
            gameEngine.gameLoop();
        });
        
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('touchstart', touchHandler);
        gameActive = false;
        dead = true;
      }
     // let header = [' X', ' Width', ' Y', ' Height'];
    //   console.table([header,
    //     [enemy.x, ENEMY_WIDTH, enemy.y, ENEMY_HEIGHT],
    //     [this.player.x, PLAYER_WIDTH, this.player.y, PLAYER_WIDTH]]);
    })
    return dead;
  };
}
