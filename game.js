// CONSTANTS

const canvasWidth = 800;
const canvasHeight = 600;
const bgWidth = 1000;
const bgHeight = 800;
const playerWidth = 60;
const playerHeight = 70;
const playerImageW = 6;
const playerImageH = 7;

const upKeyCode = 87;
const downKeyCode = 83;
const rightKeyCode = 68;
const leftKeyCode = 65;
const playerSpeed = 8;

const spriteFramesPerRow = 2;
const totalFrames = 2;
const AnimationSpeed = 10;

// CONFIGURATION

var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
document.body.appendChild(canvas);
var i = 0;

var playerImage = new Image();
playerImage.src = 'assets/playerSprites2.png';

var stillPlayerImage = new Image();
stillPlayerImage.src = 'assets/player.png';

spriteFrameNum = 0;

var background = new Image();
background.src = 'assets/background.png';

var playerX = 50;
var playerY = 40;
var playerYspeed = 0;
var runningU = false;
var runningL = false;
var runningR = false;
var runningD = false;
var lookingL = false;
var lookingR = true;
var moving = false;

var camX = 0;
var camY = 0;

var frameCounter = 0;
var stop = false;

// Event listeners
window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);
window.addEventListener('load', start);

function start() {
    window.requestAnimationFrame(gameLoop);
}

// GAME LOOP

function gameLoop() {
    if (stop) return;
    update();
    draw();
    window.requestAnimationFrame(gameLoop);
}

// USER INPUT

function onKeydown(event) {
    console.log(event.keyCode);

    if(event.keyCode === upKeyCode) runningU = true;
    if(event.keyCode === downKeyCode) runningD = true;
    if(event.keyCode === rightKeyCode) runningR = true;
    if(event.keyCode === leftKeyCode) runningL = true;
}

function onKeyup(event) {
    console.log(event.keyCode);

    if(event.keyCode === upKeyCode) runningU = false;
    if(event.keyCode === downKeyCode) runningD = false;
    if(event.keyCode === rightKeyCode) runningR = false;
    if(event.keyCode === leftKeyCode) runningL = false;
}

// UPDATE

function update() {

    // Simple frame count
    i = i+1;
    frameCounter = frameCounter + 1;
    document.querySelector("#frameNum").innerHTML = i;

    // Update player movement
    if(runningU) {
        playerY = playerY - playerSpeed;
    }
    if(runningD) {
        playerY = playerY + playerSpeed;
    }
    if(runningL) {
        playerX = playerX - playerSpeed;
        lookingL = true;
        lookingR = false;
    }
    else if(runningR) {
        playerX = playerX + playerSpeed;
        lookingR = true;
        lookingL = false;
    }

    if(runningR || runningD || runningL || runningU) moving = true;
    else moving = false;

    // Update viewport
    camX = playerX - 300;
    camY = playerY - 300;

    // Update player animation

    if((frameCounter % AnimationSpeed) === 0) {
        spriteFrameNum = spriteFrameNum + 1;
        if(spriteFrameNum >= totalFrames) {
            spriteFrameNum = 0;
        }
    }

    // Show coordinates
    document.querySelector("#corX").innerHTML = playerX;
    document.querySelector("#corY").innerHTML = playerY;

    if(lookingL) {
        document.querySelector("#dir").innerHTML = "L";
    } else {
        document.querySelector("#dir").innerHTML = "R";
    }
}

// DRAW

function draw() {

    c.save();

    c.imageSmoothingEnabled = false;
    c.webkitImageSmoothingEnabled = false;

    // Draw the scene
    var backgroundX = - (camX % bgWidth);
    var backgroundY = - (camY % bgHeight);
    c.drawImage(background, backgroundX, backgroundY, bgWidth, bgHeight);
    c.drawImage(background, backgroundX + bgWidth, backgroundY, bgWidth, bgHeight);
    c.drawImage(background, backgroundX - bgWidth, backgroundY, bgWidth, bgHeight);
    c.drawImage(background, backgroundX, backgroundY - bgHeight, bgWidth, bgHeight);
    c.drawImage(background, backgroundX + bgWidth, backgroundY - bgHeight, bgWidth, bgHeight);
    c.drawImage(background, backgroundX - bgWidth, backgroundY - bgHeight, bgWidth, bgHeight);
    c.drawImage(background, backgroundX, backgroundY + bgHeight, bgWidth, bgHeight);
    c.drawImage(background, backgroundX + bgWidth, backgroundY + bgHeight, bgWidth, bgHeight);
    c.drawImage(background, backgroundX - bgWidth, backgroundY + bgHeight, bgWidth, bgHeight);

    // Get correct sprite from spritesheet
    var spritesRow = Math.floor(spriteFrameNum / spriteFramesPerRow);
    var spritesCol = spriteFrameNum % spriteFramesPerRow;
    var spriteX = spritesCol * playerImageW;
    var spriteY = spritesRow * playerImageH;

    if(moving) {
        // check for player direction, and flip the image the right way
        if(lookingL) {

            // Flip canvas
            c.translate(canvasWidth, 0);
            c.scale(-1, 1);
            
            // Draw the player
            c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX + 150 - camX, playerY - camY, playerWidth, playerHeight);

            // Remove flip
            c.restore();

        } else {
            c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX - camX, playerY - camY, playerWidth, playerHeight);
        }
    } else {
        if(lookingL) {
            
            // Flip canvas
            c.translate(canvasWidth, 0);
            c.scale(-1, 1);

            c.drawImage(stillPlayerImage, playerX + 150 - camX, playerY - camY, playerWidth, playerHeight);

            // Remove flip
            c.restore();

        } else {
            c.drawImage(stillPlayerImage, playerX - camX, playerY - camY, playerWidth, playerHeight);
        }
        
    }
}