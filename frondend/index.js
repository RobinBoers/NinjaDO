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

// Abilities & Health
const jumpKeyCode = 87;
const jumpPower = 8;
const maxPlayerHealth = 20;

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

// Player health and abilities
var playerHealth = maxPlayerHealth;
var playerMana = 5;
var gameOver = false;

// Viewport
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
// window.addEventListener('load', start);

function start() {
    window.requestAnimationFrame(gameLoop);
}

// GAME LOOP

function gameLoop() {

    // Overwrite to stop the game
    if (stop) return;

    // Update and draw the frame
    update();
    draw();

    // Request next frame
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

    // Check for gameover
    if(playerHealth <= 0) {
        gameOver = true;
        stop = true;
    }
}

// DRAW

function draw(state) {

    var player = state.player;
    var playerX = player.pos.x;
    var playerY = player.pos.y;
    var playerSpeed = player.velocity;
    var moving = player.moving;
    var lookingL = player.looking.l;
    var lookingR = player.looking.r;
    var playerHealth = player.hp;
    var camX = player.pos.camX;
    var camY = player.pos.camY;

    console.log();

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

    // Calculate cords
    var cordX = Math.floor(playerX / 10);
    var cordY = Math.floor(playerY / 10);

    // Draw the cords in the topleft corner
    c.fillStyle = "white";
    c.font = '30px JetBrains Mono';
    c.fillText("x:"+ cordX + ",y:" + cordY, 20, 40);

    // Show framenum on the bottom right
    c.fillText(i, 720, 600);

    // Draw a healthbar
    c.fillStyle = "tomato";
    c.fillRect(400, 10, playerHealth / maxPlayerHealth *380, 20)

    c.strokeStyle = "black";
    c.strokeRect(400, 10, 380, 20);

    // Draw Gameover screen when game is over (duh)
    if(gameOver === true || stop === true) {
        c.fillStyle = 'white';
        c.font = '96px JetBrains Mono';
        c.fillText('G4me 0v3r!', 120, 300);
    }
}

const gameState = {
	player: {
		pos: {
			x: 150,
            y: -120,
            camX: -300,
            camY: -300,
		}, 
		looking: {
			l: true,
			r: false
		},
		velocity: 10,
        moving: false,
        hp: 1
	}
}