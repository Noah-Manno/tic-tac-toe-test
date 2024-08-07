const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: 'http://localhost:3000' // Replace with your frontend URL
}));
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tic-tac-toe', { useNewUrlParser: true, useUnifiedTopology: true });

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('makeMove', (move) => {
    io.emit('moveMade', move); // Broadcast move to all clients
    console.log('move made')
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
