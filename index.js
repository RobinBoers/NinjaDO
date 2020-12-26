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

// Connect to socket.io backend
const socket = io("http://localhost:3000");

// Socket connection
socket.on('connected', () => {console.log("Connected.")});
socket.on('init', handleInit);
socket.on('msg', viewMessage);
socket.on('gamestate', handleState);
socket.on('hurt', handleDamage)
socket.on('displayGameCode', handleGamecode);
socket.on('unknownGame', () => {
    reset();
    alert("Gamecode incorrect or game unknown.");
});
socket.on('TooManyPlayers', () => {
    reset();
    alert("Too many players.");
});

let canvas;
let c;
let playerNum;

function init() {
    // Hide homescreen, and show game
    homeScreen.style.display = "none";
    gameScreen.style.display = "block";

    // Get cavas and context
    canvas = document.querySelector('#canvas');
    c = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvas.addEventListener('click', handleAbilityRequest);
}

// Get elements from HTML
const gameScreen = document.querySelector('#game');
const homeScreen = document.querySelector("#home");
const NGBtn = document.querySelector("#NGBtn");
const JGBtn = document.querySelector("#JGBtn");
const gameCodeInput = document.getElementById("gameCode");
const gameCodeDisplay = document.querySelector("#GameCodeDisplay");

NGBtn.addEventListener('click', newGame);
JGBtn.addEventListener('click', joinGame);

// Animated sprite used when
// the player is moving (right)
var playerImage = new Image();
playerImage.src = 'assets/playerSprites2.png';

// Image used if the player isn't moving (right)
var stillPlayerImage = new Image();
stillPlayerImage.src = 'assets/player.png';

// Animated sprite used when
// the player is moving (left)
var playerImageL = new Image();
playerImageL.src = 'assets/playerSprites2L.png';

// Image used if the player isn't moving (left)
var stillPlayerImageL = new Image();
stillPlayerImageL.src = 'assets/playerL.png';

// Image for scene
var background = new Image();
background.src = 'assets/background.png';

// HANDLERS

// Used to recieve playernumber / playerID
function handleInit(num) {
    console.log("Your playerID is "+num);
    playerNum = num;
}

function handleGamecode(code) {
    console.log("Received code.");
    gameCodeDisplay.innerText = code;
}

function viewMessage(message) {
    console.log(message);
}

function reset() {
    playerNum = null;
    gameCodeInput.value = '';
    homeScreen.style.display = "block";
    gameScreen.style.display = "none";
}

function handleAbilityRequest(e) {
    if(playerNum) {
        socket.emit('abilityRequest', e, playerNum)
    }
}

function handleDamage() {
    console.log("Damaged.");
}

// This function is used to get the gamestate,
// and call the function to draw it on screen
function handleState(state) {

    // Convert string back into valid JSON
    state = JSON.parse(state);

    if(playerNum) {
        requestAnimationFrame(() => draw(state, playerNum));
    }

}

// USER INPUT

window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);

function onKeydown(e) {
    console.log(playerNum)
    if(playerNum) {
        socket.emit('keydown', e.keyCode, playerNum);
    }
}

function onKeyup(e) {
    if(playerNum) {
        socket.emit('keyup', e.keyCode, playerNum);
    }
}

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    console.log("Preparing to join game "+code)
    socket.emit("joinGame", code);
    init();
}

// DRAW

function draw(state, playerNum) {

    // Set correct index for array
    playerNum = playerNum - 1;

    var player = state.players[playerNum];
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
    var manaCount = player.mana;

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

    // Calculate cords
    var cordX = Math.floor(playerX / 10);
    var cordY = Math.floor(playerY / 10);

    // Draw the cords in the topleft corner
    c.fillStyle = "white";
    c.font = '30px JetBrains Mono';
    c.fillText("x:"+ cordX + ",y:" + cordY, 20, 40);

    // Show framenum on the bottom right
    // c.fillText(i, 720, 600);

    // Show mana left on the bottom right
    c.fillText(manaCount, 720, 600);

    drawPlayer(state.players[1], camX, camY);
    drawPlayer(state.players[0], camX, camY);

    // Draw a healthbar
    if(!player.dead) {
        c.fillStyle = "tomato";
        c.fillRect(400, 10, playerHealth / maxPlayerHealth *380, 20);
    } else {
        c.fillStyle = "rgba(255, 0, 0, .5)";
        c.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Healthbar outline
    c.strokeStyle = "black";
    c.strokeRect(400, 10, 380, 20);

    // Draw Gameover screen when game is over (duh)
    if(gameOver === true) {
        c.fillStyle = 'white';
        c.font = '96px JetBrains Mono';
        c.fillText('G4me 0v3r!', 120, 300);
    }
}

function drawPlayer(player, camX, camY) {

    if(player.dead) return;

    var playerX = player.pos.x;
    var playerY = player.pos.y;
    var moving = player.moving;
    var lookingL = player.looking.l;
    var spriteFrameNum = player.sprite.frameNum;
    var spriteFramesPerRow = player.sprite.perRow;

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
            
            // Put the player onscreen
            c.drawImage(playerImageL, spriteX, spriteY, playerImageW, playerImageH, playerX - camX, playerY - camY, playerWidth, playerHeight);

        } else {
            // Put the player onscreen
            c.drawImage(playerImage, spriteX, spriteY, playerImageW, playerImageH, playerX - camX, playerY - camY, playerWidth, playerHeight);
        }

    // If the player isn't moving, just use a still sprite
    } else {

        // Check for player direction, and flip the image the right way
        if(lookingL) {

            // Put the player onscreen
            c.drawImage(stillPlayerImageL, playerX - camX, playerY - camY, playerWidth, playerHeight);

        } else {
            // Put the player onscreen
            c.drawImage(stillPlayerImage, playerX - camX, playerY - camY, playerWidth, playerHeight);
        }
        
    }
}