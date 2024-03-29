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

var
    // Local ip address that we're trying to calculate
    address
    // Provides a few basic operating-system related utility functions (built-in)
    ,os = require('os')
    // Network interfaces
    ,ifaces = os.networkInterfaces();


// Iterate over interfaces ...
for (var dev in ifaces) {

    // ... and find the one that matches the criteria
    var iface = ifaces[dev].filter(function(details) {
        return details.family === 'IPv4' && details.internal === false;
    });

    if(iface.length > 0) address = iface[0].address;
}

// Print the result
console.log("Listening on: http://" + address + ":4000"); 

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
var lookingU = false;
var lookingD = false;
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
var playerSpeed = 6;
const superSpeed = 30;

// Abilities
const abilityStrength = 2; // total hp is 20
const abilityCooldown = 60; // devide by 90 for seconds
var abilityTimer = 0;
const maxManaPoints = 5;
const manaRegenCooldown = 540; // devide by 90 for seconds
var manaFrameCounter = 0;

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

    console.log("Established connection with client.");

    client.emit('connected');

    client.on('keydown', handleKeydown);
    client.on('keyup', handleKeyup);
    client.on('abilityRequest', handleAbilityRequest);

    client.on('newGame', openNewGame);
    client.on('joinGame', handleJoinGame);

    client.on('bgConfig', handleBackground);

    function handleBackground(bgWidth, bgHeight) {
        endX = bgWidth - 70;
        endY = bgHeight - 70;

        var roomName = clientRooms[client.id];

        if(!roomName) return;

        // Set correct values in state
        state[roomName].endX = endX;
        state[roomName].endY = endY;
    }

    function handleKeydown(keyCode, playerNum) {

        // Get roomName from all rooms (by client ID)
        var roomName = clientRooms[client.id];

        if(!roomName) return;

        // Set correct index for array
        playerNum = playerNum -1;

        if(state[roomName].players[playerNum].dead) return;

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        // Update gamestate based on input
        if(keyCode === upKeyCode) state[roomName].players[playerNum].running.U = true;
        if(keyCode === downKeyCode) state[roomName].players[playerNum].running.D = true;
        if(keyCode === rightKeyCode) state[roomName].players[playerNum].running.R = true;
        if(keyCode === leftKeyCode) state[roomName].players[playerNum].running.L = true;

        if(keyCode === hackKeyCode) {
            state[roomName].players[playerNum].velocity = superSpeed;
        }

        // Send the code to the client for debugging
        client.emit('keyCode', keyCode);
    }

    function handleKeyup(keyCode, playerNum) {

        // Get roomName from all rooms (by client ID)
        var roomName = clientRooms[client.id];

        if(!roomName) return;

        // Set correct index for array
        playerNum = playerNum -1;

        if(state[roomName].players[playerNum].dead) return;

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        // Update gamestate based on input
        if(keyCode === upKeyCode) state[roomName].players[playerNum].running.U = false;
        if(keyCode === downKeyCode) state[roomName].players[playerNum].running.D = false;
        if(keyCode === rightKeyCode) state[roomName].players[playerNum].running.R = false;
        if(keyCode === leftKeyCode) state[roomName].players[playerNum].running.L = false;

        // Send the code to the client for debugging
        client.emit('keyCode', keyCode);
    }

    function handleAbilityRequest(event, playerNum) {

        // Get roomName from all rooms (by client ID)
        var roomName = clientRooms[client.id];

        if(!roomName) return;

        // Check if player is dead, and if he has enough mana
        if(state[roomName].players[playerNum - 1].dead) return;
        if(state[roomName].players[playerNum - 1].mana <= 0) return;

        if(abilityTimer < abilityCooldown) return;

        abilityTimer = 0;

        // Remove mana for using attack
        state[roomName].players[playerNum - 1].mana = state[roomName].players[playerNum - 1].mana -1;

        // Damage other player
        if(playerNum === 1) {

            // Check if player is already dead
            if(state[roomName].players[1].dead) return;

            // Jump to victim
            state[roomName].players[0].pos.x = state[roomName].players[1].pos.x;
            state[roomName].players[0].pos.y = state[roomName].players[1].pos.y;

            // Do damage
            state[roomName].players[1].hp = state[roomName].players[1].hp - abilityStrength;
            state[roomName].players[1].hurt = true;
        } else if(playerNum === 2) {

            // Check if player is already dead
            if(state[roomName].players[1].dead) return;

            // Jump to victim
            state[roomName].players[1].pos.x = state[roomName].players[0].pos.x;
            state[roomName].players[1].pos.y = state[roomName].players[0].pos.y;

            // Do damage
            state[roomName].players[0].hp = state[roomName].players[0].hp - abilityStrength;
            state[roomName].players[0].hurt = true;
        }

        // Let other player know he is damaged
        client.to(roomName).emit("hurt");
        
        // Send the code to the client for debugging
        client.emit('msg', "Used ability.");
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

        // Start gameloop
        gameLoop(roomName);

        // Send client message to start the game (music etc.)
        io.to(roomName).emit('start');
    }
    
});

// Dispay message in log if client disconnects
io.on('disconnect', function(){
    console.log("Client disconnected.");
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
    i = i + 1;
    state[roomName].frame = i;
    frameCounter = frameCounter + 1;
    manaFrameCounter = manaFrameCounter + 1;

    abilityTimer = abilityTimer + 1;

    // Update mana for both players
    if(manaFrameCounter === manaRegenCooldown) {
        manaFrameCounter = 0;
        state[roomName].players[0].mana = state[roomName].players[0].mana + 1;
        state[roomName].players[1].mana = state[roomName].players[1].mana + 1;
        io.to(roomName).emit('msg', 'Reset mana Timer.');
    }

    // Player movement (for player 1)
    if(state[roomName].players[0].running.U) { 
        state[roomName].players[0].pos.y = state[roomName].players[0].pos.y - state[roomName].players[0].velocity; 
        state[roomName].players[0].looking.l = false;
        state[roomName].players[0].looking.r = false;
        state[roomName].players[0].looking.u = true;
        state[roomName].players[0].looking.d = false;
    }
    if(state[roomName].players[0].running.D) {
        state[roomName].players[0].pos.y = state[roomName].players[0].pos.y + state[roomName].players[0].velocity;
        state[roomName].players[0].looking.l = false;
        state[roomName].players[0].looking.r = false;
        state[roomName].players[0].looking.u = false;
        state[roomName].players[0].looking.d = true;
    }
    if(state[roomName].players[0].running.R) {
        state[roomName].players[0].pos.x = state[roomName].players[0].pos.x + state[roomName].players[0].velocity;
        state[roomName].players[0].looking.r = true;
        state[roomName].players[0].looking.l = false;
        state[roomName].players[0].looking.u = false;
        state[roomName].players[0].looking.d = false;
    }
    if(state[roomName].players[0].running.L) {
        state[roomName].players[0].pos.x = state[roomName].players[0].pos.x - state[roomName].players[0].velocity;
        state[roomName].players[0].looking.l = true;
        state[roomName].players[0].looking.r = false;
        state[roomName].players[0].looking.u = false;
        state[roomName].players[0].looking.d = false;
    }

    // Player movement (for player 2)
    if(state[roomName].players[1].running.U) { 
        state[roomName].players[1].pos.y = state[roomName].players[1].pos.y - state[roomName].players[1].velocity; 
        state[roomName].players[1].looking.l = false;
        state[roomName].players[1].looking.r = false;
        state[roomName].players[1].looking.u = true;
        state[roomName].players[1].looking.d = false;
    }
    if(state[roomName].players[1].running.D) {
        state[roomName].players[1].pos.y = state[roomName].players[1].pos.y + state[roomName].players[1].velocity;
        state[roomName].players[1].looking.l = false;
        state[roomName].players[1].looking.r = false;
        state[roomName].players[1].looking.u = false;
        state[roomName].players[1].looking.d = true;
    }
    if(state[roomName].players[1].running.R) {
        state[roomName].players[1].pos.x = state[roomName].players[1].pos.x + state[roomName].players[1].velocity;
        state[roomName].players[1].looking.r = true;
        state[roomName].players[1].looking.l = false;
        state[roomName].players[1].looking.u = false;
        state[roomName].players[1].looking.d = false;
    }
    if(state[roomName].players[1].running.L) {
        state[roomName].players[1].pos.x = state[roomName].players[1].pos.x - state[roomName].players[1].velocity;
        state[roomName].players[1].looking.l = true;
        state[roomName].players[1].looking.r = false;
        state[roomName].players[1].looking.u = false;
        state[roomName].players[1].looking.d = false;
    }

    // Check if moving, used later to determin image to use (player 1)
    if( state[roomName].players[0].running.R || 
        state[roomName].players[0].running.D || 
        state[roomName].players[0].running.L || 
        state[roomName].players[0].running.U) {
        state[roomName].players[0].moving = true;
    }
    else (state[roomName].players[0].moving) = false;

    // Check if moving, used later to determin image to use (player 2)
    if( state[roomName].players[1].running.R || 
        state[roomName].players[1].running.D || 
        state[roomName].players[1].running.L || 
        state[roomName].players[1].running.U) {
        state[roomName].players[1].moving = true;
    }
    else (state[roomName].players[1].moving) = false;

    // Update viewport (player 1)
    state[roomName].players[0].pos.camX = state[roomName].players[0].pos.x - 300;
    state[roomName].players[0].pos.camY = state[roomName].players[0].pos.y - 300;

    // Update viewport (player 2)
    state[roomName].players[1].pos.camX = state[roomName].players[1].pos.x - 300;
    state[roomName].players[1].pos.camY = state[roomName].players[1].pos.y - 300;

    // Update player animation (player 1 +2)
    if((frameCounter % AnimationSpeed) === 0) {
        state[roomName].players[0].sprite.frameNum = state[roomName].players[0].sprite.frameNum + 1;
        if(state[roomName].players[0].sprite.frameNum >= totalFrames) {
            state[roomName].players[0].sprite.frameNum = 0;
        }

        state[roomName].players[1].sprite.frameNum = state[roomName].players[1].sprite.frameNum + 1;
        if(state[roomName].players[1].sprite.frameNum >= totalFrames) {
            state[roomName].players[1].sprite.frameNum = 0;
        }
    }

    // Dont let players move out of the map (upper left)
    if(state[roomName].players[0].pos.x < 0) {
        state[roomName].players[0].pos.x = 0;
    }
    if(state[roomName].players[0].pos.y < 0) {
        state[roomName].players[0].pos.y = 0;
    }

    if(state[roomName].players[1].pos.x < 0) {
        state[roomName].players[1].pos.x = 0;
    }
    if(state[roomName].players[1].pos.y < 0) {
        state[roomName].players[1].pos.y = 0;
    }

    // Dont let players move out of the map (bottom right)
    if(state[roomName].players[0].pos.x > state[roomName].endX) {
        state[roomName].players[0].pos.x = state[roomName].endX;
    }
    if(state[roomName].players[0].pos.y > state[roomName].endY) {
        state[roomName].players[0].pos.y = state[roomName].endY;
    }

    if(state[roomName].players[1].pos.x > state[roomName].endX) {
        state[roomName].players[1].pos.x = state[roomName].endX;
    }
    if(state[roomName].players[1].pos.y > state[roomName].endY) {
        state[roomName].players[1].pos.y = state[roomName].endY;
    }

    // Check for gameover (player 1)
    if(state[roomName].players[0].hp <= 0) {
        state[roomName].players[0].dead = true;
    }

    // Check for gameover (player 2)
    if(state[roomName].players[1].hp <= 0) {
        state[roomName].players[1].dead = true;
    }
}

function createGamestate() {
    return {
        players: [{
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
            mana: maxManaPoints,
            hurt: false,
            dead: gameOver,
            sprite: {
                frameNum: spriteFrameNum,
                speed: AnimationSpeed,
                total: totalFrames,
                perRow: spriteFramesPerRow
            }
        },
        {
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
                u: lookingU,
                d: lookingD,
            },
            velocity: playerSpeed,
            moving: moving,
            maxhp: maxPlayerHealth,
            hp: maxPlayerHealth,
            mana: maxManaPoints,
            hurt: false,
            dead: gameOver,
            sprite: {
                frameNum: spriteFrameNum,
                speed: AnimationSpeed,
                total: totalFrames,
                perRow: spriteFramesPerRow
            }
        }],
        frame: i,
        endX: 100,
        endY: 100
    }
}

// Listen on port 4000
http.listen(4000);
