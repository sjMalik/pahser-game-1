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
  this.load.image('resume', '/assets/backgrounds/button_resume.png');
  this.load.image('playButton', '/assets/backgrounds/button_play_normal.png');
  this.load.audio("score", "assets/music/point.wav");
  this.load.audio("hit", "assets/music/hit.wav");
  this.load.audio("wing", "assets/music/wing.wav");
  this.load.audio("die", "assets/music/die.wav");
}

let background;
let bird;
let birdFrame = 0;
let birdFrames = ['bird1', 'bird2', 'bird3'];
let base;
let birdDirection = 1; // 1 for down, -1 for up
let gameStarted = false;
let gameOver = false;
let scoreText;
let score = 0;
let point;
let hit;
let wing;
let die;


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
  gameStarted = false;
  // Show start game image
  let startGameImage = this.add.image(game.config.width / 2, game.config.height / 2, 'startGame');
  startGameImage.setOrigin(0.5, 0.5);
  startGameImage.setScale(0.5);
  startGameImage.setInteractive();
  startGameImage.on('pointerdown', () => {
    startGameImage.destroy(); // Remove start game image
    gameStarted = true; // Set gameStarted to true
    bird.setActive(true).setVisible(true); // Show and activate the bird
    bird.setVelocityY(0); // Reset bird velocity

    scoreText = this.add.text(game.config.width / 2, 30, "0", {
      fontSize: "32px",
      fontFamily: "Fantasy",
      fill: "white",
    });
    scoreText.setOrigin(0.5, 0.5);
    scoreText.setDepth(1);

    // Add sound effects
    point = this.sound.add("score");
    hit = this.sound.add("hit");
    wing = this.sound.add("wing");
    die = this.sound.add("die");

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!gameOver) {
          createPiller();
        }
      },
      loop: true
    });
  });

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
  // bird.setActive(false).setVisible(false); // Hide and deactivate the bird initially

  // Pause all movement and physics initially
  // this.physics.pause();
  // background.tilePositionX = 0;
  // base.tilePositionX = 0;

  // Add event for mouse click or touch to make the bird jump
  // this.input.on('pointerdown', () => {
  //   if (gameStarted) return; // Ignore input if game has already started
  //   gameStarted = true; // Set gameStarted to true
  //   bird.setVelocityY(-200); // Apply upward velocity on click or tap
  // });

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
    hit.play(); // Play hit sound
    die.play(); // Play die sound
    bird.setTint(0xff0000); // Change bird color to red
    bird.setVelocity(0, 0); // Stop bird movement
    this.physics.pause(); // Pause the physics engine
    background.tilePositionX = 0; // Stop background movement
    base.tilePositionX = 0; // Stop base movement
    this.add.text(game.config.width / 2 - 50, game.config.height / 2, 'Game Over', {
      fontSize: '32px',
      color: '#ffffff'
    });

    let resumeButton = this.add.image(game.config.width / 2, game.config.height / 2 + 50, 'resume');
    resumeButton.setOrigin(0.6, 0.5);
    resumeButton.setScale(3);
    resumeButton.setInteractive();
    resumeButton.on('pointerdown', () => {
      resumeGame();
    });
  };

  // Add collision detection between bird and base
  this.physics.add.collider(bird, base, () => {
    handleCollision();
  });

  // Add collision detection for bird hitting the upper boundary of the canvas
  bird.body.onWorldBounds = true;
  this.physics.world.on('worldbounds', (body) => {
    if (body.gameObject === bird && bird.y <= 0) {
      handleCollision();
    }
  });

  const resumeGame = () => {
    gameOver = false; // Reset gameOver to false
    score = 0; // Reset score to 0
    bird.clearTint(); // Remove tint from bird
    bird.setActive(false).setVisible(false); // Hide and deactivate the bird
    this.scene.restart(); // Restart the scene
  }
}

function update() {
  if (gameOver || !gameStarted) {
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
      wing.play();
      bird.setVelocityY(-200); // Apply upward velocity on space or click
    }

    birdFrame += 0.1;
    if (birdFrame >= birdFrames.length) {
      birdFrame = 0;
    }
    bird.setTexture(birdFrames[Math.floor(birdFrame)]);

    // Check for pillars that the bird has passed
    this.physics.world.colliders.getActive().forEach((collider) => {
      if (collider.object1 === bird && collider.object2.texture.key === 'piller') {
        let piller = collider.object2;
        if (piller.x + piller.width / 2 < bird.x - bird.width / 2 && !piller.scored) {
          point.play(); // Play score sound
          piller.scored = true; // Mark the pillar as scored
          score += 1; // Increment the score
          scoreText.setText(score.toString()); // Update the score text
        }
      }
    });
  }
}
