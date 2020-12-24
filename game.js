// CONSTANTS

// Image sizes
const canvasWidth = 800;
const canvasHeight = 600;
const bgWidth = 1000;
const bgHeight = 800;
const playerWidth = 60;
const playerHeight = 70;
const playerImageW = 6;
const playerImageH = 7;

// Keycodes
const upKeyCode = 87;
const downKeyCode = 83;
const rightKeyCode = 68;
const leftKeyCode = 65;
const hackKeyCode = 59;

// Movement speed
var playerSpeed = 8;
const superSpeed = 30;

// Abilities
const jumpKeyCode = 87;
const jumpPower = 8;

// Animated sprites
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

// Animated sprite used when
// the player is moving
var playerImage = new Image();
playerImage.src = 'assets/playerSprites2.png';

// Image used if the player isn't moving
var stillPlayerImage = new Image();
stillPlayerImage.src = 'assets/player.png';

spriteFrameNum = 0;

// Image for scene
var background = new Image();
background.src = 'assets/background.png';

// Player movement and location
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
var hacking = false;

var camX = 0;
var camY = 0;

// Framcounter, used for the animated sprite
var frameCounter = 0;

// Overwrite which will stop the
// game is set to true
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
    if(event.keyCode === hackKeyCode) hacking = true;
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

    // Superspeed for hackers
    // Is triggerd by the ; key
    if(hacking) {
        playerSpeed = superSpeed;
    }

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

    // Check if moving, used later to determin image to use
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

    // Show direction the player is 
    // lookin at in HUD.
    if(lookingL) {
        document.querySelector("#dir").innerHTML = "L";
    } else {
        document.querySelector("#dir").innerHTML = "R";
    }
}

// DRAW

function draw() {

    // Save the non-flipped state to restore later
    c.save();

    // Make sure the pixelart
    // isn't ruined
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

    // If the player is moving,
    // use a animated sprite (from spritesheet)
    if(moving) {

        // Check for player direction, and flip the image the right way
        if(lookingL) {

            // Flip canvas
            c.translate(canvasWidth, 0);
            c.scale(-1, 1);
            
            // Put the player onscreen
            c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX + 150 - camX, playerY - camY, playerWidth, playerHeight);

            // Remove flip by restoring
            // the state saved at the start
            // of the draw function
            c.restore();

        } else {
            // Put the player onscreen
            c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX - camX, playerY - camY, playerWidth, playerHeight);
        }

    // If the player isn't moving, just use a still sprite
    } else {

        // Check for player direction, and flip the image the right way
        if(lookingL) {
            
            // Flip canvas
            c.translate(canvasWidth, 0);
            c.scale(-1, 1);

            // Put the player onscreen
            c.drawImage(stillPlayerImage, playerX + 150 - camX, playerY - camY, playerWidth, playerHeight);

            // Remove flip by restoring
            // the state saved at the start
            // of the draw function
            c.restore();

        } else {
            // Put the player onscreen
            c.drawImage(stillPlayerImage, playerX - camX, playerY - camY, playerWidth, playerHeight);
        }
        
    }
}