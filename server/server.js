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

// Room management
const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createRoom', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = { players: [], board: Array(9).fill(null), xIsNext: true };
      socket.join(roomName);
      socket.emit('roomCreated', roomName);
      console.log(`Room ${roomName} created`);
    } else {
      socket.emit('roomError', 'Room already exists');
    }
  });

  socket.on('joinRoom', (roomName) => {
    if (rooms[roomName]) {
      const room = rooms[roomName];
      if (room.players.length < 2) {
        room.players.push(socket.id);
        socket.join(roomName);
        socket.emit('roomJoined', roomName);
        if (room.players.length === 2) {
          const [player1, player2] = room.players;
          io.to(player1).emit('playerRole', 'X');
          io.to(player2).emit('playerRole', 'O');
          io.to(roomName).emit('gameStart');
        }
        console.log(`Player joined room ${roomName}`);
      } else {
        socket.emit('roomError', 'Room is full');
      }
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });

  socket.on('makeMove', (roomName, move) => {
    const room = rooms[roomName];
    if (room && room.board[move.index] === null && move.player === (room.xIsNext ? 'X' : 'O')) {
      room.board[move.index] = move.player;
      room.xIsNext = !room.xIsNext;
      io.to(roomName).emit('moveMade', { index: move.index, player: move.player });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Handle disconnection logic, reset rooms if necessary
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
