// CONSTANTS

const canvasWidth = 800;
const canvasHeight = 600;
const bgWidth = 800;
const bgHeight = 800;
const playerWidth = 60;
const playerHeight = 70;
const playerImageW = 6;
const playerImageH = 7;
const floorY = 540;

const playerYacceleration = 1;
const jumpKeyCode = 87;
const jumpPower = 15;

const rightKeyCode = 68;
const leftKeyCode = 65;
const playerSpeed = 10;

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

spriteFrameNum = 0;

var background = new Image();
background.src = 'assets/background.png';

var playerX = 50;
var playerY = 40;
var playerYspeed = 0;
var jumping = false;
var inAir = false;
var runningL = false;
var runningR = false;
var lookingL = false;
var lookingR = true;

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
    frameCounter = frameCounter + 1;
    document.querySelector("#frameNum").innerHTML = i;

    // Jumping
    if(jumping && !inAir) {
        playerYspeed = -jumpPower;
        inAir = true;
    }

    // Update player movement
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

    // Draw sky
    c.fillStyle = 'royalblue';
    c.fillRect(0, 0, canvasWidth, floorY - 40);

    // Draw the backdrop
    var backgroundX = - (camX % bgWidth);
    c.drawImage(background, backgroundX, -210, bgWidth, bgHeight);
    c.drawImage(background, backgroundX + bgWidth, -210, bgWidth, bgHeight);
    c.drawImage(background, backgroundX - bgWidth, -210, bgWidth, bgHeight);

    // Draw ground
    c.fillStyle = 'limegreen';
    c.fillRect(0, floorY - 40, canvasWidth, canvasHeight - floorY + 40);

    // Get correct sprite from spritesheet
    var spritesRow = Math.floor(spriteFrameNum / spriteFramesPerRow);
    var spritesCol = spriteFrameNum % spriteFramesPerRow;
    var spriteX = spritesCol * playerImageW;
    var spriteY = spritesRow * playerImageH;

    // check for player direction, and flip the image the right way
    if(lookingL) {

        // Flip canvas
        c.translate(canvasWidth, 0);
        c.scale(-1, 1);
        
        // Draw the player
        c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX + 450 - camX, playerY - camY, playerWidth, playerHeight);

        // Remove flip
        c.restore();

    } else {
        c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX - camX, playerY - camY, playerWidth, playerHeight);
    }

}