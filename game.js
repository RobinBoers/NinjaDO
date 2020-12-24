// CONSTANTS

const canvasWidth = 800;
const canvasHeight = 600;
const playerWidth = 181;
const playerHeight = 229;
const floorY = 540;

// CONFIGURATION

var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
document.body.appendChild(canvas);


var playerImage = new Image();
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

}

// DRAW

function draw() {

    // Clear canvas
    c.clearRect(0,0, canvasWidth, canvasHeight);

    // Draw player
    c.drawImage(playerImage, playerX, playerY);
}