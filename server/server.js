const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://tic-tac-toe-test.onrender.com", // Allow all origins for simplicity; adjust as needed
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

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('makeMove', (move) => {
    io.emit('moveMade', move); // Broadcast move to all clients
    console.log('move made');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
