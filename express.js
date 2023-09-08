const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql');
let forzaCentre = "forza_centre";
const { Server } = require("socket.io");
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your actual frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});
const cors = require('cors');
const port = process.env.PORT || 3000;
class Round {
    priceoptions = ["50k", "100k", "150k", "200k", "250k", "500k"];
    selectedprice = null;
    classoptions = ["D", "C", "B", "A", "S1", "S2", "X"];
    selectedclass = null;
    raceoptions = ["Road", "Dirt", "Cross Country", "Street Scene", "Drag", "Drift", "Goliath"];
    selectedrace = null;
    not_upgradeable = ["engine", "brakes, suspension", "aero", "tires", "drivetrain"];
    selectednot_upgradeable = null;
    cartypes = ["hatchback", "sedan", "suv", "coupe", "convertible", "truck", "sportscar"]
    selectedcartype = null;

    constructor() {
        this.selectedprice = this.priceoptions[Math.floor(Math.random() * this.priceoptions.length)];
        this.selectedclass = this.classoptions[Math.floor(Math.random() * this.classoptions.length)];
        this.selectedrace = this.raceoptions[Math.floor(Math.random() * this.raceoptions.length)];
        this.selectednot_upgradeable = this.not_upgradeable[Math.floor(Math.random() * this.not_upgradeable.length)];
        this.selectedcartype = this.cartypes[Math.floor(Math.random() * this.cartypes.length)];
    }
}

app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join', (username) => {
        console.log(username + ' joined the game');
        // add username to players array
        // update database
        // send back updated players array
        con.getConnection(function(err) {
            let query = `SELECT * FROM ${forzaCentre}`;
            // Run the query
            con.query(query, function (err, result, fields) {
                if (err) throw err;
                // Check if there is a game
                if (result.length == 0) {
                    socket.emit('error', {
                        message: "There is no game to join",
                    })
                    return;
                }
                // Check if game hasn't started
                if (result[0].gameStarted) {
                    socket.emit('error', {
                        message: "The game has already started",
                    })
                    return;
                }
                let players = JSON.parse(result[0].players);
                // Check if the player is already in the game
                if (players.includes(username)) {
                    socket.emit('error', {
                        message: "You are already in the game",
                    })
                    return;
                }
                players.push(username);
                let playersString = JSON.stringify(players);
                let query = `UPDATE ${forzaCentre} SET players = ? WHERE gameStarted = 0`;
                let values = [playersString];
                // Run the query
                con.query(query, values, function (err, result, fields) {
                    if (err) throw err;
                    socket.join('forzaCentre')
                    io.to('forzaCentre').emit('joined', players)	
                });
            })
        })
    })
    socket.on('leave', (username) => {
        console.log(username + ' left the game');
        // remove username from players array
        // update database
        // send back updated players array
        con.getConnection(function(err) {
            let query = `SELECT * FROM ${forzaCentre}`;
            // Run the query
            con.query(query, function (err, result, fields) {
                if (err) throw err;
                // Check if there is a game
                if (result.length == 0) {
                    socket.emit('error', {
                        message: "There is no game to join",
                    })
                    return;
                }
                // Check if game hasn't started
                if (result[0].gameStarted) {
                    socket.emit('error', {
                        message: "The game has already started",
                    })
                    return;
                }
                let players = JSON.parse(result[0].players);
                // Check if the player is already in the game
                if (!players.includes(username)) {
                    socket.emit('error', {
                        message: "You are not in the game",
                    })
                    return;
                }
                players = players.filter(player => player != username);
                let playersString = JSON.stringify(players);
                let query = `UPDATE ${forzaCentre} SET players = ? WHERE gameStarted = 0`;
                let values = [playersString];
                // Run the query
                con.query(query, values, function (err, result, fields) {
                    if (err) throw err;
                    socket.leave('forzaCentre')
                    io.to('forzaCentre').emit('left', players)	
                });
            })
        })
    });

    socket.on('start', () => {
        // Emit to all clients that the game has started
        // Update database
        io.to('forzaCentre').emit('started', {
            state: true,
            options: new Round()
        });
    });
  });

const con = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});



    

app.get('/', (req, res) => res.send('Hello, world!'));

app.get('/showDBs', (req, res) => {
    con.getConnection(function(err) {
        if (err) throw err;
        con.query("SHOW DATABASES", function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.json({
                databases: result
            })
        });
    });
});
class game {
    creatorUsername = null;
    players = [];
    price = null
    class = null;
    race = null;
    not_upgradeable = null
    gameStarted = false;
}
let gameActive = false;

app.post('/creategame', (req, res) => {
    let creatorUsername = req.body.creatorUsername;

    let newGame = new game();
    con.getConnection(function(err) {
        if (err) throw err;
        let playersString = JSON.stringify(newGame.players);
        let query = `INSERT INTO ${forzaCentre} (price, class, race, not_upgradeable, players, gameStarted) VALUES (?, ?, ?, ?, ?, ?)`;
        let values = [newGame.price, newGame.class, newGame.race, newGame.not_upgradeable, playersString, newGame.gameStarted];
        // Run the query
        con.query(query, values, function (err, result, fields) {
            if (err) throw err;
            gameActive = true;
            res.json({
                result: result,
                link: "https://roblox.com"
            })
        });
    })
})

app.get('/cleargame', (req, res) => {
    con.getConnection(function(err) {
        if (err) throw err;
        let query = `DELETE FROM ${forzaCentre}`;
        // Run the query
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            gameActive = false;
            res.json({
                result: true,
            })
        });
    })
})

app.post('/joingame', (req, res) => {
    let username = req.body.username;
    console.log(username + ' joined the game');
    if (!gameActive) {
        res.json({
            error: "There is no game to join"
        })
        return;
    }
    res.json({
        link: `http://localhost:5173/join/${username}`
    })
})



server.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))