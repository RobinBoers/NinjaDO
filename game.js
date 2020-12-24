// CONSTANTS

const canvasWidth = 800;
const canvasHeight = 600;
const bgWidth = 800;
const bgHeight = 800;
const playerWidth = 60;
const playerHeight = 70;
const floorY = 540;

const playerYacceleration = 1;
const jumpKeyCode = 87;
const jumpPower = 15;

const rightKeyCode = 68;
const leftKeyCode = 65;
const playerSpeed = 10;

// CONFIGURATION

var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
document.body.appendChild(canvas);
var i = 0;

var playerImage = new Image(playerWidth, playerHeight);
playerImage.src = 'assets/player.png';

var background = new Image();
background.src = 'assets/background.png';

var playerX = 50;
var playerY = 40;
var playerYspeed = 0;
var jumping = false;
var inAir = false;
var runningL = false;
var runningR = false;

var camX = 0;
var camY = 0;

// Event listeners
window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);
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

// USER INPUT

function onKeydown(event) {
    console.log(event.keyCode);

    if(event.keyCode === jumpKeyCode) jumping = true;
    if(event.keyCode === rightKeyCode) runningR = true;
    if(event.keyCode === leftKeyCode) runningL = true;
}

function onKeyup(event) {
    console.log(event.keyCode);

    if(event.keyCode === jumpKeyCode) jumping = false;
    if(event.keyCode === rightKeyCode) runningR = false;
    if(event.keyCode === leftKeyCode) runningL = false;
}

// UPDATE

function update() {

    // Simple frame count
    i = i+1;
    document.querySelector("#frameNum").innerHTML = i;

    // Jumping
    if(jumping && !inAir) {
        playerYspeed = -jumpPower;
        inAir = true;
    }

    // Update player movement
    if(runningL) {
        playerX = playerX - playerSpeed;
    }
    if(runningR) {
        playerX = playerX + playerSpeed;
    }

    // Gravity
    playerY = playerY + playerYspeed;
    playerYspeed = playerYspeed + playerYacceleration;
    if(playerY > (floorY - playerHeight)) {
        playerY = floorY - playerHeight;
        playerYspeed = 0;
        inAir = false;
    }

    // Update viewport
    camX = playerX - 150;

    // Show coordinates
    document.querySelector("#corX").innerHTML = playerX;
    document.querySelector("#corY").innerHTML = playerY;
}

// DRAW

function draw() {

    c.imageSmoothingEnabled = false;
    c.webkitImageSmoothingEnabled = false;

    // Draw sky
    c.fillStyle = 'royalblue';
    c.fillRect(0, 0, canvasWidth, floorY - 40);

    // Draw backdrop
    var backgroundX = - (camX % bgWidth);
    c.drawImage(background, backgroundX, -210, bgWidth, bgHeight);
    c.drawImage(background, backgroundX + bgWidth, -210, bgWidth, bgHeight);
    c.drawImage(background, backgroundX - bgWidth, -210, bgWidth, bgHeight);

    // Draw ground
    c.fillStyle = 'limegreen';
    c.fillRect(0, floorY - 40, canvasWidth, canvasHeight - floorY + 40);

    // Draw player
    c.drawImage(playerImage, playerX - camX, playerY - camY, playerWidth, playerHeight);
}