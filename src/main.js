import './style.css'
import Phaser from "phaser";

function preload() {
  this.load.image('background', '/assets/backgrounds/background_day.png');
  this.load.image('bird1', '/assets/objects/bird_blue_0.png');
  this.load.image('bird2', '/assets/objects/bird_blue_1.png');
  this.load.image('bird3', '/assets/objects/bird_blue_2.png');
}

let background;
let bird;
let birdDirection = 1; // 1 for moving up, -1 for moving down
let birdFrame = 0; // To track the current frame for animation
let birdFrames = ['bird1', 'bird2', 'bird3']; // Array of bird frames

function create() {
  // Add background image to the scene and scale it to fit the game's size 
  background = this.add.tileSprite(0, 0, game.config.width, game.config.height, "background");
  // Set the origin to the top-left corner of the image to make it fit the game's size
  background.setOrigin(0, 0);
  // Set the image's displayWidth and displayHeight to the game's width and height 
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height; // Fixed typo

  // Add the bird sprite to the scene
  bird = this.add.sprite(400, 300, 'bird1'); // Start with the first frame
  bird.setScale(2.5); // Scale the bird down if needed
}

function update() {
  // Move the background horizontally to create a scrolling effect
  background.tilePositionX += 1; // Adjust the speed as needed

  // Make the bird fly up and down
  bird.y += birdDirection * 1; // Adjust the speed of movement
  if (bird.y <= 250 || bird.y >= 350) {
    birdDirection *= -1; // Reverse direction when reaching bounds
  }

  // Animate the bird by cycling through frames
  birdFrame += 0.1; // Adjust the speed of animation
  if (birdFrame >= birdFrames.length) {
    birdFrame = 0; // Reset to the first frame
  }
  bird.setTexture(birdFrames[Math.floor(birdFrame)]);
}

const config = {
  // Set the game's resolution and background color
  type: Phaser.AUTO,
  width: 800, // 800 pixels wide
  height: 600,
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);
