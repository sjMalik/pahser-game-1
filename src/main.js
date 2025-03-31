import './style.css'
import Phaser from "phaser";

// This is the main entry point for the Phaser game
// It initializes the game and sets up the configuration
// for the game, including the physics engine, scene, and assets to be loaded.
const config = {
  type: Phaser.AUTO, // Use WebGL if available, otherwise use Canvas
  width: 288,
  height: 512,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let game = new Phaser.Game(config);


/**
 * Preload function to load assets before the game starts
 * This function is called before the create function
 * It loads images and other assets that will be used in the game
 * @returns {void}
 */
function preload() {
  this.load.image('background', '/assets/backgrounds/background_night.png');
  this.load.image('bird1', '/assets/objects/bird_yellow_1.png');
  this.load.image('bird2', '/assets/objects/bird_yellow_2.png');
  this.load.image('bird3', '/assets/objects/bird_yellow_3.png');
  this.load.image('base', '/assets/backgrounds/ground.png');
  this.load.image('piller', '/assets/backgrounds/pipe_red_bottom.png');
  this.load.image('startGame', '/assets/backgrounds/message.png');
}

let background;
let bird;
let birdFrame = 0;
let birdFrames = ['bird1', 'bird2', 'bird3'];
let base;
let birdDirection = 1; // 1 for down, -1 for up
let gameOver = false;

/**
 * Create function to set up the game scene
 * This function is called after the preload function
 * It creates the game objects, sets up physics, and initializes the game state
 * @returns {void}
 * @param {Phaser.Scene} this - The current scene instance
 * @param {Phaser.Game} game - The current game instance
 * @param {Phaser.GameConfig} config - The game configuration object
 * @param {Phaser.GameObjects} gameObjects - The game objects in the scene
 * @param {Phaser.Physics} physics - The physics engine used in the game
 * @param {Phaser.Input} input - The input manager for handling user input
 * @param {Phaser.Loader} loader - The loader for loading assets
 * @param {Phaser.Time} time - The time manager for handling game time
 * @param {Phaser.Cameras} cameras - The camera manager for handling game cameras
 * @param {Phaser.Scale} scale - The scale manager for handling game scaling
 * @param {Phaser.Display} display - The display manager for handling game display
 * @param {Phaser.Renderer} renderer - The renderer for rendering game graphics
 * @param {Phaser.GameObjects} gameObjects - The game objects in the scene
 * @param {Phaser.GameConfig} gameConfig - The game configuration object
 * @param {Phaser.Game} game - The current game instance
 * @param {Phaser.GameObjects} gameObjects - The game objects in the scene
 * @param {Phaser.Physics} physics - The physics engine used in the game
 * @param {Phaser.Input} input - The input manager for handling user input
 * @param {Phaser.Loader} loader - The loader for loading assets
 * @param {Phaser.Time} time - The time manager for handling game time
 * @param {Phaser.Cameras} cameras - The camera manager for handling game cameras 
 */
function create() {
  // Show start game image
  let startGameImage = this.add.image(game.config.width / 2, game.config.height / 2, 'startGame');
  startGameImage.setOrigin(0.5, 0.5);
  startGameImage.setScale(0.5);
  startGameImage.setInteractive();
  startGameImage.on('pointerdown', () => {
    startGameImage.destroy(); // Remove start game image
    this.scene.restart(); // Restart the scene to start the game
  }
  );

  background = this.add.tileSprite(0, 0, game.config.width, game.config.height, "background");
  background.setOrigin(0, 0);
  background.setScale(2);
  background.displayWidth = this.sys.game.config.width;
  background.displayheight = this.sys.game.config.height;

  let baseImage = this.textures.get("base");
  let baseHeight = baseImage.getSourceImage().height;
  base = this.add.tileSprite(game.config.width / 2, game.config.height - baseHeight / 2, game.config.width, baseHeight, "base");
  this.physics.add.existing(base, true);
  base.setDepth(1);

  bird = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, birdFrames[0]);
  bird.setCollideWorldBounds(true);

  // Add event for mouse click or touch to make the bird jump
  this.input.on('pointerdown', () => {
    bird.setVelocityY(-200); // Apply upward velocity on click or tap
  });

  const createPiller = () => {
    let pillerHeight = Phaser.Math.Between(100, 300);
    let piller = this.physics.add.sprite(game.config.width, game.config.height - base.height, 'piller');
    piller.displayHeight = pillerHeight;
    piller.setOrigin(0.5, 1);
    piller.body.setVelocityX(-100);

    piller.body.onWorldBounds = true;
    piller.body.world.on('worldbounds', (body) => {
      if (body.gameObject === piller) {
        piller.destroy();
      }
    });

    // Add collision detection between bird and piller
    this.physics.add.collider(bird, piller, () => {
      handleCollision();
    });
  };

  const handleCollision = () => {
    gameOver = true; // Set gameOver to true
    bird.setTint(0xff0000); // Change bird color to red
    bird.setVelocity(0, 0); // Stop bird movement
    this.physics.pause(); // Pause the physics engine
    background.tilePositionX = 0; // Stop background movement
    base.tilePositionX = 0; // Stop base movement
    this.add.text(game.config.width / 2 - 50, game.config.height / 2, 'Game Over', {
      fontSize: '32px',
      color: '#ffffff'
    });

    // Restart the game after a short delay
    this.time.delayedCall(2000, () => {
      gameOver = false; // Reset gameOver to false
      this.scene.restart();
    });
  };

  this.time.addEvent({
    delay: 2000,
    callback: () => {
      if (!gameOver) {
        createPiller();
      }
    },
    loop: true
  });
}

function update() {
  if (gameOver) {
    return; // Skip update if game is over
  }
  // Update background and base position
  background.tilePositionX += 0.5;
  base.tilePositionX += 0.5;

  if (bird.active) {
    // Apply gravity-like effect when no input is given
    bird.setVelocityY(bird.body.velocity.y + 10);

    let baseTop = game.config.height - base.height;
    if (bird.y + bird.height / 2 > baseTop) {
      bird.y = baseTop - bird.height / 2;
      bird.setVelocityY(0); // Stop bird movement when it hits the ground
    }

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (spaceKey.isDown || this.input.activePointer.isDown) {
      bird.setVelocityY(-200); // Apply upward velocity on space or click
    }

    birdFrame += 0.1;
    if (birdFrame >= birdFrames.length) {
      birdFrame = 0;
    }
    bird.setTexture(birdFrames[Math.floor(birdFrame)]);
  }
}
