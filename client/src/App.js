import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; // Import the CSS file

const socket = io('https://tic-tac-toe-test.onrender.com'); // Connect to backend

const App = () => {
  const [roomName, setRoomName] = useState('');
  const [player, setPlayer] = useState(null); // 'X' or 'O'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameStatus, setGameStatus] = useState('Enter a room to start playing...');
  const [currentRoom, setCurrentRoom] = useState('');

  useEffect(() => {
    socket.on('playerRole', (role) => {
      setPlayer(role);
      setGameStatus(`You are player ${role}`);
    });

    socket.on('roomCreated', (room) => {
      setCurrentRoom(room);
      setGameStatus(`Room ${room} created. Waiting for another player to join...`);
    });

    socket.on('roomJoined', (room) => {
      setCurrentRoom(room);
      setGameStatus(`Joined room ${room}. Waiting for another player to join...`);
    });

    socket.on('roomError', (error) => {
      setGameStatus(error);
    });

    socket.on('gameStart', () => {
      setBoard(Array(9).fill(null));
      setXIsNext(true);
      setGameStatus('Game started!');
    });

    socket.on('moveMade', (move) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[move.index] = move.player;
        return newBoard;
      });
      setXIsNext(move.player === 'O'); // Toggle next player
    });

    return () => {
      socket.off('playerRole');
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('roomError');
      socket.off('gameStart');
      socket.off('moveMade');
    };
  }, []);

  const createRoom = () => {
    if (roomName) {
      socket.emit('createRoom', roomName);
    }
  };

  const joinRoom = () => {
    if (roomName) {
      socket.emit('joinRoom', roomName);
    }
  };

  const handleClick = (index) => {
    if (!player || board[index] || calculateWinner(board) || (player !== (xIsNext ? 'X' : 'O'))) return;

    const currentPlayer = xIsNext ? 'X' : 'O';
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[index] = currentPlayer;
      return newBoard;
    });
    socket.emit('makeMove', currentRoom, { index, player: currentPlayer });
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(board);

  return (
    <div>
      <h1>Tic-Tac-Toe</h1>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Enter room name"
      />
      <button onClick={createRoom}>Create Room</button>
      <button onClick={joinRoom}>Join Room</button>
      {currentRoom && (
        <>
          <div className="board">
            {board.map((value, index) => (
              <button
                key={index}
                className="button"
                onClick={() => handleClick(index)}
              >
                {value}
              </button>
            ))}
          </div>
          {winner ? (
            <h2 className="winner">Winner: {winner}</h2>
          ) : (
            <h2 className="next-player">Next Player: {xIsNext ? 'X' : 'O'}</h2>
          )}
        </>
      )}
      <h3>{gameStatus}</h3>
    </div>
  );
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default App;


