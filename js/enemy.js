// The Enemy class will contain information about the enemy such as
// its position on screen. It will also provide methods for updating
// and destroying the enemy.
class Enemy {
  // The constructor takes 2 arguments.
  // - theRoot refers to the parent DOM element.
  //   We need a way to add the DOM element we create in this constructor to our DOM.
  // - enemySpot is the position of the enemy (either 0, 1, 2, 3 or 4)
  // Since the constructor takes 2 parameters
  // and the 2 parameters provide important information, we must supply 2 arguments to "new" every time we
  // create an instance of this class.
  constructor(theRoot, enemySpot) {
    // When we create an Enemy instance, for example, new Enemy(someRoot, 3)
    // A new object is created and the constructor of the Enemy class is called. The context (the \`this\` keyword) is going
    // to be the new object. In these lines of code we see how to add 2 properties to this object: spot, root and gameHeight.
    // We do this because we want to access this data in the other methods of the class.
    // - We need the root DOM element so that we can remove the enemy when it is no longer needed. This will be done at a later time.
    // - We need to keep track of the enemy spot so that we don't place two enemies in the same spot.
    this.root = theRoot;
    this.spot = enemySpot;

    // The x position of the enemy is determined by its width and its spot. We need this information for the lifetime
    // of the instance, so we make it a property of the instance. (Why is this information needed for the lifetime of the instance?)
    this.x = enemySpot * ENEMY_WIDTH;
    //console.log("ENEMY POSITION X", this.x);

    // The y position starts just above the screen, slightly staggered
    this.y = -(ENEMY_HEIGHT + Math.random() * ENEMY_HEIGHT * 2);
    this.destroyed = false;

    // We create a new DOM element. The tag of this DOM element is img. It is the DOM node that will display the enemy image
    // to the user. When the enemy is no longer needed, we will use a reference to this DOM node to remove it from the game. This
    // is why we create a property that refers to it.
    this.domElement = document.createElement('img');

    // We give it a src attribute to specify which image to display.
    this.domElement.src = './images/cube.png';
    // We modify the CSS style of the DOM node.
    this.domElement.style.position = 'absolute';
    this.domElement.style.height = `${ENEMY_HEIGHT}px`;
    this.domElement.style.width = `${Math.floor(65 * SCALE)}px`;
    this.domElement.style.left = `${this.x}px`;
    this.domElement.style.top = `${this.y}px`;
    this.domElement.style.marginLeft = `${Math.floor(15 * SCALE)}px`;
    this.domElement.style.zIndex = 5;

    // Show that the user can actually see the img DOM node, we append it to the root DOM node.
    theRoot.appendChild(this.domElement);

    // Fixed speed in pixels per frame (not time-based)
    // Range gives good variety between slow and fast blocks
    this.speed = Math.random() * 3 + 3;
  }

  update() {
    // Move by a fixed amount each frame — no timeDiff means no stutter
    this.y = this.y + this.speed;
    this.domElement.style.top = `${this.y}px`;

    // If the y position of the DOM element is greater than the GAME_HEIGHT then the enemy is at the bottom
    // of the screen and should be removed. We remove the DOM element from the root DOM element and we set
    // the destroyed property to indicate that the enemy should no longer be in play
    if (this.y > GAME_HEIGHT) {
      this.root.removeChild(this.domElement);
      this.destroyed = true;

      //MINE
      //Maybe keep score ot enemies destroyed for display at end
      //console.log(this.destroyed);
    }
  }
}
