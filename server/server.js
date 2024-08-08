const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://tic-tac-toe-test.onrender.com", // Allow specific origin
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: 'https://tic-tac-toe-test.onrender.com' // Your deployed frontend URL
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API routes go here

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Game state management
let players = [];
let board = Array(9).fill(null);
let xIsNext = true; // X always starts

io.on('connection', (socket) => {
  console.log('New client connected');

  // Assign roles to players
  if (players.length < 2) {
    const role = players.length === 0 ? 'X' : 'O';
    players.push({ id: socket.id, role });
    socket.emit('playerRole', role);
    console.log(`Player ${role} connected`);

    // Inform other player about the new player
    if (players.length === 2) {
      io.emit('playerRole', players.find(p => p.id !== socket.id).role);
    }
  }

  socket.on('makeMove', (move) => {
    if (board[move.index] || (move.player !== (xIsNext ? 'X' : 'O'))) {
      // Invalid move or not the player's turn
      return;
    }
    board[move.index] = move.player;
    xIsNext = !xIsNext;
    io.emit('moveMade', { index: move.index, player: move.player });
    console.log(`Move made by ${move.player} at index ${move.index}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove player from the list
    players = players.filter(p => p.id !== socket.id);
    // Reset game if a player disconnects
    board = Array(9).fill(null);
    xIsNext = true;
    io.emit('gameReset'); // Notify clients that the game has been reset
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
