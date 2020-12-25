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

// CONFIGURATION

const socket = io("http://localhost:3000");

var canvas = document.querySelector('#canvas');
var c = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Animated sprite used when
// the player is moving
var playerImage = new Image();
playerImage.src = 'assets/playerSprites2.png';

// Image used if the player isn't moving
var stillPlayerImage = new Image();
stillPlayerImage.src = 'assets/player.png';

// Image for scene
var background = new Image();
background.src = 'assets/background.png';

// Socket connection
socket.on('init', handleInit);
socket.on('gamestate', handleState);

function handleInit(msg) {
    console.log(msg);
}


// This function is used to get the gamestate,
// and call the function to draw it on screen
function handleState(state) {

    // Convert string back into valid JSON
    state = JSON.parse(state);

    requestAnimationFrame(() => draw(state));
}

// USER INPUT

window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);

function onKeydown(e) {
    socket.emit('keydown', e.keyCode);
}

function onKeyup(e) {
    socket.emit('keyup', e.keyCode);
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
    var runningU = player.running.U;
    var runningD = player.running.D;
    var runningL = player.running.L;
    var runningR = player.running.R;
    var maxPlayerHealth = player.maxhp;
    var gameOver = player.dead;
    var i = state.frame;
    var spriteFrameNum = player.sprite.frameNum;
    var animationSpeed = player.sprite.speed;
    var totalFrames = player.sprite.total;
    var spriteFramesPerRow = player.sprite.perRow;

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
    if(gameOver === true) {
        c.fillStyle = 'white';
        c.font = '96px JetBrains Mono';
        c.fillText('G4me 0v3r!', 120, 300);
    }
}

// Example gamestate below

// const gameState = {
// 	player: {
// 		pos: {
// 			x: 50,
//             y: 40,
//             camX: -250,
//             camY: -260,
//         }, 
//         running: {
//             U: false,
//             D: false,
//             R: true,
//             L: false,
//         },
// 		looking: {
// 			l: true,
// 			r: false
// 		},
// 		velocity: 10,
//         moving: false,
//         maxhp: 20,
//         hp: 1,
//         dead: false
//     },
//     frame: 0,
// }