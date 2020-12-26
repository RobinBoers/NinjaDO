// INITIALIZE

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

const { makeId } = require('./utils');

// CONFIGUARATION & CONSTANTS

// Player info
const jumpPower = 8;
const maxPlayerHealth = 20;

// Player health and abilities
var playerHealth = maxPlayerHealth;
var gameOver = false;

// Player movement & position
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

// Framerate, used to calculate
// interval for the gameLoop
const frameRate = 90;

// Framecounter and animationspeed,
// used for the animated sprite
var frameCounter = 0;
var AnimationSpeed = 10;
var spriteFrameNum = 0;
const spriteFramesPerRow = 2;
const totalFrames = 2;

// Framecounter, used for debugging
// (displayed in HUD)
var i = 0;

const state = {};
const clientRooms = {};

// Check when a client is connecting
io.on('connection', client => {

    client.emit('connected');

    client.on('keydown', handleKeydown);
    client.on('keyup', handleKeyup);

    client.on('newGame', openNewGame);
    client.on('joinGame', handleJoinGame);

    function handleKeydown(keyCode, playerNum) {

        var roomName = clientRooms[client.id];

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        if(keyCode === upKeyCode) state[roomName].player.running.U = true;
        if(keyCode === downKeyCode) state[roomName].player.running.D = true;
        if(keyCode === rightKeyCode) state[roomName].player.running.R = true;
        if(keyCode === leftKeyCode) state[roomName].player.running.L = true;

        if(keyCode === hackKeyCode) {
            state[roomName].player.velocity = superSpeed;
        }

        client.emit('keyCode', keyCode);
    }

    function handleKeyup(keyCode, playerNum) {

        var roomName = clientRooms[client.id];

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        if(keyCode === upKeyCode) state[roomName].player.running.U = false;
        if(keyCode === downKeyCode) state[roomName].player.running.D = false;
        if(keyCode === rightKeyCode) state[roomName].player.running.R = false;
        if(keyCode === leftKeyCode) state[roomName].player.running.L = false;
    }

    function openNewGame() {
        let roomName = makeId(5);

        client.emit('msg', "Serverconnection with gamecode: "+roomName);

        clientRooms[client.id] = roomName;
        client.emit('displayGameCode', roomName);

        state[roomName] = createGamestate();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleJoinGame(roomName) {

        client.emit('msg', "Serverconnection with gamecode: " + roomName);

        {// const room = io.sockets.adapter.rooms[JSON.stringify(roomName)];
        // client.emit('msg', room);
        // let allUsers;

        // if(room) {
        //     allUsers = room.sockets;
        //     client.emit('msg', allUsers);
        // }

        // let numClients = 0;
        // if(allUsers) {
        //     numClients = Object.keys(allUsers).length;
        // }

        // if(numClients === 0) {
        //     client.emit('unknownGame');
        //     return;
        // } else if(numClients > 1) {
        //     client.emit('TooManyPlayers');
        //     return;
        // } 

        // clientRooms[client.id] = roomName;
        }

        clientRooms[client.id] = roomName;
        client.emit('displayGameCode', roomName);

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        gameLoop(roomName);
    }
    
});

// GAME LOOP

function gameLoop(roomName) {
    const gameInterval = setInterval(() => {

        // Update the state
        update(roomName);

        // Send the updated state to the
        //  client as a string
        io.to(roomName).emit('gamestate', JSON.stringify(state[roomName]));
    }, 1000 / frameRate);
}

// UPDATE

function update(roomName) {

    // Simple frame count
    state[roomName].frame = state.frame+1;
    frameCounter = frameCounter + 1;

    // Player movement
    if(state[roomName].player.running.U) { 
        state[roomName].player.pos.y = state[roomName].player.pos.y - state[roomName].player.velocity; 
    }
    if(state[roomName].player.running.D) {
        state[roomName].player.pos.y = state[roomName].player.pos.y + state[roomName].player.velocity;
    }
    if(state[roomName].player.running.R) {
        state[roomName].player.pos.x = state[roomName].player.pos.x + state[roomName].player.velocity;
        state[roomName].player.looking.r = true;
        state[roomName].player.looking.l = false;
    }
    if(state[roomName].player.running.L) {
        state[roomName].player.pos.x = state[roomName].player.pos.x - state[roomName].player.velocity;
        state[roomName].player.looking.l = true;
        state[roomName].player.looking.r = false;
    }

    // Check if moving, used later to determin image to use
    if( state[roomName].player.running.R || 
        state[roomName].player.running.D || 
        state[roomName].player.running.L || 
        state[roomName].player.running.U) {
        state[roomName].player.moving = true;
    }
    else state[roomName].player.moving = false;

    // Update viewport
    state[roomName].player.pos.camX = state[roomName].player.pos.x - 300;
    state[roomName].player.pos.camY = state[roomName].player.pos.y - 300;

    // Update player animation
    if((frameCounter % AnimationSpeed) === 0) {
        state[roomName].player.sprite.frameNum = state[roomName].player.sprite.frameNum + 1;
        if(state[roomName].player.sprite.frameNum >= totalFrames) {
            state[roomName].player.sprite.frameNum = 0;
        }
    }

    // Check for gameover
    if(state[roomName].player.hp <= 0) {
        state[roomName].player.dead = true;
    }
}

function createGamestate() {
    return {
        player: {
            pos: {
                x: playerX,
                y: playerY,
                camX: camX,
                camY: camY,
            }, 
            running: {
                U: runningU,
                D: runningD,
                R: runningR,
                L: runningL,
            },
            looking: {
                l: lookingL,
                r: lookingR,
            },
            velocity: playerSpeed,
            moving: moving,
            maxhp: maxPlayerHealth,
            hp: maxPlayerHealth,
            dead: gameOver,
            sprite: {
                frameNum: spriteFrameNum,
                speed: AnimationSpeed,
                total: totalFrames,
                perRow: spriteFramesPerRow
            }
        },
        frame: i,
    }
}

// Listen on port 3000
http.listen(3000);