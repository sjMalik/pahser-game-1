import './style.css'
import Phaser from "phaser";

// Phaser 3 game configuration object with type, width, height, physics, and scene properties
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload,
    create,
    update
  }
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image('background', '/assets/backgrounds/background_night.png');
  this.load.image('bird1', '/assets/objects/bird_yellow_1.png');
  this.load.image('bird2', '/assets/objects/bird_yellow_2.png');
  this.load.image('bird3', '/assets/objects/bird_yellow_3.png');
}

let background;
let bird;
let birdDirection = 1; // 1 for moving up, -1 for moving down
let birdFrame = 0; // To track the current frame for animation
let birdFrames = ['bird1', 'bird2', 'bird3']; // Array of bird frames

function create() {
  background = this.add.tileSprite(0, 0, game.config.width, game.config.height, "background");
  background.setScale(3);

  // Add the bird sprite to the scene
  bird = this.add.sprite(game.config.width / 2, game.config.height / 2, 'bird1'); // Position the bird in the middle of the game bounds
  bird.setScale(1); // Scale the bird down if needed

  // Add game title text on the screen
  this.add.text(120, 20, '🐦 Phaser Game Tutorial: Flappy Bird 🕹️', {
    fontSize: '25px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setShadow(2, 2, "#000", 3); // Adding shadow for better visibility

  // Add footer text with YouTube link
  let youtubeLink = this.add.text(90, 570, '🎥 Click Here to Watch the Tutorial in my Youtube Channel - Coding with Sjmalik', {
    fontSize: '15px',
    fontFamily: 'Arial',
    color: '#ffff00', // Yellow color for visibility
    fontStyle: 'bold'
  }).setShadow(1, 1, "#000", 2);

  // Make the text interactive and open YouTube link on click
  youtubeLink.setInteractive({ useHandCursor: true }) // Change cursor on hover
    .on('pointerdown', () => {
      window.open('https://www.youtube.com/@sjmalik1407', '_blank'); // Open in new tab
    })
    .on('pointerover', () => {
      youtubeLink.setColor('#ff0000'); // Change color to red when hovered
    })
    .on('pointerout', () => {
      youtubeLink.setColor('#ffff00'); // Change back to yellow when not hovered
    });
}

function update() {
  // Move the background horizontally to create a scrolling effect
  background.tilePositionX += 0.5; // Adjust the speed as needed

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
