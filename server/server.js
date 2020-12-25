// CONFIGUARATION & CONSTANTS

const jumpPower = 8;
const maxPlayerHealth = 20;

// Player health and abilities
var playerHealth = maxPlayerHealth;
var gameOver = false;

var playerX = 50;
var playerY = 40;
var runningU = false;
var runningL = false;
var runningR = false;
var runningD = false;
var lookingL = false;
var lookingR = true;
var moving = false;
var hacking = false;

// Keycodes
const upKeyCode = 87;
const downKeyCode = 83;
const rightKeyCode = 68;
const leftKeyCode = 65;
const hackKeyCode = 59;
const jumpKeyCode = 87;

// Movement speed
var playerSpeed = 8;
const superSpeed = 30;

// Viewport
var camX = 0;
var camY = 0;

// Framcounter, used for the animated sprite
var frameCounter = 0;
var i = 0;

// Initialize http, cors and socket.io
var http = require('http').createServer();
var cors = require('cors');
const io = require('socket.io')(http, {
    cors: {
      origin: "*",
      methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["origin", "x-requested-with", "content-type"]
    }
});

// Check when a client is connecting
io.on('connection', client => {

    client.emit('init', "Connected.");

    client.on('keydown', handleKeydown);
    client.on('keyup', handleKeyup);

    function handleKeydown(keyCode) {

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        if(keyCode === upKeyCode) runningU = true;
        if(keyCode === downKeyCode) runningD = true;
        if(keyCode === rightKeyCode) runningR = true;
        if(keyCode === leftKeyCode) runningL = true;
        if(keyCode === hackKeyCode) hacking = true;

        client.emit('keyCode', keyCode);
    }

    function handleKeyup(keyCode) {

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        if(keyCode === upKeyCode) runningU = false;
        if(keyCode === downKeyCode) runningD = false;
        if(keyCode === rightKeyCode) runningR = false;
        if(keyCode === leftKeyCode) runningL = false;
    }
    
});

function start() {
    window.requestAnimationFrame(gameLoop);
}

// GAME LOOP

function gameLoop(state) {

    // Update the frame
    update(state);

    // Request next frame
    window.requestAnimationFrame(gameLoop);
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

http.listen(3000);