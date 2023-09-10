const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql');
let forzaCentre = "forza_centre";
let finGames = "fin_games";
let forzaCars = "forza_cars";
const { Server } = require("socket.io");
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const io = new Server(server, {
  cors: {
    origin: "http://nbg02.sq3.nl:25605", // Replace with your actual frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});
const cors = require('cors');
const port = process.env.PORT || 3000;
// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'react-frontend/forza_centre/dist')));
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
        let rounddetails = new Round();
        io.to('forzaCentre').emit('started', {
            state: true,
            options: rounddetails
        });
        // Set game to started in database and insert game values
        con.getConnection(function(err) {
            let query = `UPDATE ${forzaCentre} SET gameStarted = 1, price = '${rounddetails.selectedprice}', class = '${rounddetails.selectedclass}', race = '${rounddetails.selectedrace}', not_upgradeable = '${rounddetails.selectednot_upgradeable}', cartype = '${rounddetails.selectedcartype}' WHERE gameStarted = 0;`;
            // Run the query
            con.query(query, function (err, result, fields) {
                if (err) throw err;
            });
        });
    });
    socket.on('stop', () => {
        // Emit to all clients that the game has stopped
        // Update database
        console.log('game stopped');
        con.getConnection(function(err) {
            let query = `CREATE TABLE IF NOT EXISTS ${finGames} LIKE ${forzaCentre}`;
            // Run the query
            con.query(query, function (err, result, fields) {
                if (err) throw err;
                let query = `INSERT INTO ${finGames} SELECT * FROM ${forzaCentre}`;
                // Run the query
                con.query(query, function (err, result, fields) {
                    if (err) throw err;
                    let query = `DELETE FROM ${forzaCentre}`;
                    // Run the query
                    con.query(query, function (err, result, fields) {
                        if (err) throw err;
                    });
                });
            });
        });
        io.to('forzaCentre').emit('stopped', {
            state: false,
        });
        gameActive = false;
        // move game to finGames table
        
    })
  });

const con = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});



    


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

app.get('/botgamestatus', (req, res) => {
    // Send back if the game has started
    con.getConnection(function(err) {
        let query = `SELECT * FROM ${forzaCentre}`;
        // Run the query
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            if (result.length == 0) {
                res.json({
                    gameStarted: false
                })
                return;
            }
            else {
                res.json({
                    gameStarted: result[0].gameStarted,
                    result: result
                })
            }

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
    con.getConnection(function(err) {
        let query = `SELECT * FROM ${forzaCentre}`;
        // Run the query
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            let players = JSON.parse(result[0].players);
            // Check if the player is already in the game
            if (players.includes(username)) {
                res.json({
                    error: "You are already in the game"
                })
                return;
            }
                // Check if game hasn't started
            if (result[0].gameStarted) {
                res.json({
                    error: "The game has already started"
                });
                return;
            }
        })
    })
    res.json({
        link: `http://nbg02.sq3.nl:25605/join/${username}`
    })
})
app.get('/getcar/:carname', (req, res) => {
    let userCarName = req.params.carname.trim();
    con.getConnection(function (err) {
        let query = `SELECT * FROM ${forzaCars}`;
        con.query(query, function (err, result, fields) {
            if (err) {
                res.status(500).json({
                    error: "Internal server error"
                });
                return;
            }

            if (result.length === 0) {
                res.status(404).json({
                    error: "Car database is empty"
                });
                return;
            }

            // Function to calculate Levenshtein distance
            function getLevenshteinDistance(a, b) {
                if (a.length === 0) return b.length;
                if (b.length === 0) return a.length;

                const matrix = Array.from(Array(a.length + 1), () =>
                    Array(b.length + 1).fill(0)
                );

                for (let i = 0; i <= a.length; i++) {
                    matrix[i][0] = i;
                }

                for (let j = 0; j <= b.length; j++) {
                    matrix[0][j] = j;
                }

                for (let i = 1; i <= a.length; i++) {
                    for (let j = 1; j <= b.length; j++) {
                        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j] + 1, // Deletion
                            matrix[i][j - 1] + 1, // Insertion
                            matrix[i - 1][j - 1] + cost // Substitution
                        );
                    }
                }

                return matrix[a.length][b.length];
            }

            let closestCar = null;
            let closestDistance = Infinity;
            // Run .contains() on each car name
            for (const car of result) {
                const carName = car.name.toLowerCase();
                if (carName.includes(userCarName.toLowerCase())) {
                    closestCar = car;
                    break;
                }
            }
            if (!closestCar) {
                for (const car of result) {
                    const carName = car.name.toLowerCase();
                    const distance = getLevenshteinDistance(userCarName.toLowerCase(), carName);
                    if (distance < closestDistance) {
                        closestCar = car;
                        closestDistance = distance;
                    }
                }
            }
            if (closestCar) {
                let wikialink = closestCar.wikialink;
                fetch(wikialink)
                    .then(response => response.text())
                    .then(data => {
                        let imagelink = data.split('<meta property="og:image" content="')[1].split('"')[0];
                        imagelink = imagelink.replace("/1200?cb", "/2000?cb");
                        res.json({
                            result: closestCar,
                            imagelink: imagelink
                        });
                    });
            } else {
                res.status(404).json({
                    error: "Car not found"
                });
            }
        });
    });
});


// Define a catch-all route to serve your React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'react-frontend/forza_centre/dist'));
  });

app.get('/join/:username', (req, res) => {
    // serve reat page
    res.sendFile(path.join(__dirname, 'react-frontend/forza_centre/dist/index.html'));
})

server.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))