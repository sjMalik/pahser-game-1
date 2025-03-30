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
}

let background;
let bird;
let birdFrame = 0;
let birdFrames = ['bird1', 'bird2', 'bird3'];
let base;

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
  background = this.add.tileSprite(0, 0, game.config.width, game.config.height, "background");
  // Set the origin to the top left corner
  background.setOrigin(0, 0);
  // Set the scale to fit the screen
  background.setScale(2);
  // Set the display size to match the game config
  background.displayWidth = this.sys.game.config.width;
  background.displayheight = this.sys.game.config.height;

  let baseImage = this.textures.get("base");
  let baseHeight = baseImage.getSourceImage().height;
  base = this.add.tileSprite(game.config.width / 2, game.config.height - baseHeight / 2, game.config.width, baseHeight, "base");
  this.physics.add.existing(base, true);
  base.setDepth(1);

  bird = this.add.sprite(game.config.width / 2, game.config.height / 2, birdFrames[0]);

  // Add mouse click event listener
  this.input.on('pointerdown', () => {
    bird.y -= 50; // Move the bird up by 50 pixels on click
  });

  // Function to create a random-sized piller
  const createPiller = () => {
    let pillerHeight = Phaser.Math.Between(100, 300); // Random height between 100 and 300
    let piller = this.add.sprite(game.config.width, game.config.height - base.height, 'piller');
    piller.displayHeight = pillerHeight; // Adjust the height of the piller
    piller.setOrigin(0.5, 1); // Set origin to the bottom center
    this.physics.add.existing(piller);
    piller.body.setVelocityX(-100); // Move the piller to the left

    // Remove the piller when it goes out of bounds
    piller.body.onWorldBounds = true;
    piller.body.world.on('worldbounds', (body) => {
      if (body.gameObject === piller) {
        piller.destroy();
      }
    });
  };

  // Create a new piller every 2 seconds
  this.time.addEvent({
    delay: 2000,
    callback: createPiller,
    loop: true
  });
}

function update() {
  background.tilePositionX += 0.5;
  base.tilePositionX += 0.5;

  // Gravity effect to make the bird fall down
  bird.y += 2; // Adjust the gravity speed as needed

  // Prevent the bird from falling below the base
  let baseTop = game.config.height - base.height;
  if (bird.y + bird.height / 2 > baseTop) {
    bird.y = baseTop - bird.height / 2;
  }

  // Animate the bird by cycling through frames
  birdFrame += 0.1;
  if (birdFrame >= birdFrames.length) {
    birdFrame = 0;
  }
  bird.setTexture(birdFrames[Math.floor(birdFrame)]);
}
