// CONSTANTS

const canvasWidth = 800;
const canvasHeight = 600;
const playerWidth = 60;
const playerHeight = 70;
const floorY = 540;

// CONFIGURATION

var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
document.body.appendChild(canvas);
var i = 0;

var playerImage = new Image(playerWidth, playerHeight);
playerImage.src = 'assets/player.png';

var playerX = 50;
var playerY = 40;

window.addEventListener('load', start);

function start() {
    window.requestAnimationFrame(gameLoop);
}

// GAME LOOP

function gameLoop() {
    update();
    draw();
    window.requestAnimationFrame(gameLoop);
}

// UPDATE

function update() {

    // Simple frame count
    i = i+1;
    console.log("Frame "+i);

}

// DRAW

function draw() {

    c.imageSmoothingEnabled = false;
    c.mozImageSmoothingEnabled = false;
    c.webkitImageSmoothingEnabled = false;

    // Draw sky
    c.fillStyle = 'royalblue';
    c.fillRect(0, 0, canvasWidth, floorY - 40);

    // Draw ground
    c.fillStyle = 'limegreen';
    c.fillRect(0, floorY - 40, canvasWidth, canvasHeight - floorY + 40);

    // Draw player
    c.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);
}