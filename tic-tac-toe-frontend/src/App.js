import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; // Import the CSS file

const socket = io('http://localhost:5001'); // Connect to backend

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    socket.on('moveMade', (move) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[move.index] = move.player;
        return newBoard;
      });
    });

    return () => {
      socket.off('moveMade');
    };
  }, []);

  const handleClick = (index) => {
    if (board[index] || calculateWinner(board)) return;

    const player = xIsNext ? 'X' : 'O';
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[index] = player;
      return newBoard;
    });
    socket.emit('makeMove', { index, player });
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(board);

  return (
    <div>
      <h1>Tic-Tac-Toe</h1>
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

