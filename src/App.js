import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

const apiBaseUrl = "http://localhost:3211";

function getRandomIntWithPadding(min, max, padding) {
  const randomValue = Math.floor(Math.random() * (max - min + 1) + min);
  return `${randomValue + padding}vh`;
}

function App() {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gridGenerated, setGridGenerated] = useState(false);
  const [gridGenerationSpeed, setGridGenerationSpeed] = useState(1000);
  const [gameEnded, setGameEnded] = useState(false);

  const speedOptions = {
    low: 1000,     // 1 second
    medium: 500,   // 0.5 seconds
    high: 250,     // 0.25 seconds
  };

  useEffect(() => {
    if (isGameRunning) {
      if (!gridGenerated) {
        fetchGrid();
        setGridGenerated(true);
      }
      const intervalId = setInterval(() => {
        fetchGrid();
      }, speedOptions[gridGenerationSpeed]);

      return () => clearInterval(intervalId);
    }
  }, [isGameRunning, gridGenerated, gridGenerationSpeed]);

  const fetchGrid = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/grid`);
      setGrid(response.data.grid);
    } catch (error) {
      console.error("Error fetching grid:", error);
    }
  };

  const handleClick = async (row, col) => {
    if (isGameRunning) {
      try {
        const response = await axios.post(`${apiBaseUrl}/click`, {
          row,
          col,
        });

        const { scoreChange } = response.data;
        let newScore = score + scoreChange;
        setScore(newScore);

        // Blink the tile 3 times
        const cell = document.getElementById(`cell-${row}-${col}`);
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            cell.style.backgroundColor = 'white';
          }, 100 * i);
          setTimeout(() => {
            cell.style.backgroundColor = 'clickedTile';
          }, 100 * i + 50);
        }

        // Instead of setting the grid locally, fetch the updated grid from the server
        fetchGrid();
      } catch (error) {
        console.error("Error handling click:", error);
      }
    }
  };

  const handleClickRed = (row, col) => {
    if (isGameRunning) {
      const scoreChange = -10;
      const newScore = score + scoreChange;
      setScore(newScore);
    }
  };

  const handleStartGame = () => {
    setIsGameRunning(true);
    setScore(0);
    fetchGrid();
  };

  const handleStopGame = () => {
    setIsGameRunning(false);
    setGrid([]);
    setGameEnded(true);
  };

  const blueBlocks = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    row: Math.floor(index / 10),
    col: index % 10,
    top: getRandomIntWithPadding(0, 90, 10),
    left: getRandomIntWithPadding(0, 80, 10),
  }));

  const handleSpeedChange = (event) => {
    const newSpeed = event.target.value;
    setGridGenerationSpeed(newSpeed);
  };

  return (
    <div>
      <div className="grid-container">
        {[...Array(2)].map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {[...Array(10)].map((_, colIndex) => (
              <div
                key={colIndex}
                id={`cell-${rowIndex}-${colIndex}`}
                className="green"
              ></div>
            ))}
          </div>
        ))}{" "}
        {blueBlocks.map((blueBlock) => (
          <div
            key={blueBlock.id}
            className="blue"
            style={{ top: blueBlock.top, left: blueBlock.left }}
            onClick={() => handleClick(blueBlock.row, blueBlock.col)}
          ></div>
        ))}
        {[...Array(2)].map((_, rowIndex) => (
          <div key={rowIndex} className="row redRow">
            {[...Array(10)].map((_, colIndex) => (
              <div
                key={colIndex}
                id={`cell-${rowIndex}-${colIndex}`}
                className="red"
                onClick={() => {
                  handleClickRed(rowIndex, colIndex);
                }}
              ></div>
            ))}
          </div>
        ))}
        <div className="stats">
          <p>Score:{score}</p>
          {gameEnded && <p>Final Score: {score}</p>}
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={handleStopGame}>Stop Game</button>
          <label>
      Speed:
      <select value={gridGenerationSpeed} onChange={handleSpeedChange}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>

        </div>
      </div>
    </div>
  );
}

export default App;
