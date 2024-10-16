// client/src/components/Game.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const choices = ["Stone", "Paper", "Scissors"];

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const Game = () => {
  // Player Names
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  // Game State
  const [namesSubmitted, setNamesSubmitted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roundsData, setRoundsData] = useState([]);
  const [result, setResult] = useState("");

  // Current Player Turn: 1 or 2
  const [currentPlayer, setCurrentPlayer] = useState(1);

  // Player Choices
  const [player1Choice, setPlayer1Choice] = useState(null);
  const [player2Choice, setPlayer2Choice] = useState(null);

  // Modal Visibility
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Timer for Automatic Modal Closure
  const [timer, setTimer] = useState(null);

  const icons = {
    Stone: (
      <img
        src="https://cdn.icon-icons.com/icons2/390/PNG/512/rock_39413.png"
        alt="Rock"
        width="50"
        height="50"
      />
    ),
    Paper: (
      <img
        src="https://cdn.icon-icons.com/icons2/390/PNG/512/paper_38485.png"
        alt="Paper"
        width="50"
        height="50"
      />
    ),
    Scissors: (
      <img
        src="https://cdn.icon-icons.com/icons2/390/PNG/512/scissors_39412.png"
        alt="Scissors"
        width="50"
        height="50"
      />
    ),
  };

  // Determine Winner of a Round
  const determineWinner = (choice1, choice2) => {
    if (choice1 === choice2) return "Tie";

    if (
      (choice1 === "Stone" && choice2 === "Scissors") ||
      (choice1 === "Scissors" && choice2 === "Paper") ||
      (choice1 === "Paper" && choice2 === "Stone")
    ) {
      return "Player 1";
    } else {
      return "Player 2";
    }
  };

  // Handle Starting the Game
  const handleStartGame = () => {
    if (player1Name.trim() !== "" && player2Name.trim() !== "") {
      setNamesSubmitted(true);
      setCurrentPlayer(1);
      setModalMessage(`${player1Name}'s turn to choose`);
      setIsModalVisible(true);
    } else {
      alert("Please enter both player names.");
    }
  };

  // Handle Player Move Selection
  const handlePlayerChoice = (choice) => {
    if (currentPlayer === 1) {
      setPlayer1Choice(choice);
      setModalMessage(`${player2Name}'s turn to choose`);
      setCurrentPlayer(2);
      setIsModalVisible(true);
    } else if (currentPlayer === 2) {
      setPlayer2Choice(choice);
      setIsModalVisible(true);
    }
  };

  // Handle Round Calculation Automatically
  useEffect(() => {
    if (player1Choice && player2Choice) {
      // Automatically calculate the round winner after both choices are made
      setIsLoading(true);
      setModalMessage("Calculating round winner...");
      setIsModalVisible(true);

      // Simulate a brief delay for better UX
      const calculateWinner = async () => {
        const winner = determineWinner(player1Choice, player2Choice);
        let updatedPlayer1Score = player1Score;
        let updatedPlayer2Score = player2Score;
        let roundResult = "";

        if (winner === "Player 1") {
          updatedPlayer1Score += 1;
          roundResult = `${player1Name} wins this round!`;
        } else if (winner === "Player 2") {
          updatedPlayer2Score += 1;
          roundResult = `${player2Name} wins this round!`;
        } else {
          roundResult = "It's a tie!";
        }

        setPlayer1Score(updatedPlayer1Score);
        setPlayer2Score(updatedPlayer2Score);

        const roundData = {
          roundNumber: currentRound,
          player1Choice,
          player2Choice,
          winner,
        };

        setRoundsData([...roundsData, roundData]);

        // Determine if the game has ended
        if (currentRound < 6) {
          // Proceed to the next round after a brief delay
          setTimeout(() => {
            setCurrentRound(currentRound + 1);
            setPlayer1Choice(null);
            setPlayer2Choice(null);
            setCurrentPlayer(1);
            setModalMessage(`${player1Name}'s turn to choose`);
            setIsModalVisible(true);
            setIsLoading(false);
          }, 1500);
        } else {
          // Game Over - Determine Final Winner
          let finalResult = "";
          if (updatedPlayer1Score > updatedPlayer2Score) {
            finalResult = `${player1Name} is the overall winner! 🎉`;
          } else if (updatedPlayer2Score > updatedPlayer1Score) {
            finalResult = `${player2Name} is the overall winner! 🎉`;
          } else {
            finalResult = "The game is a tie! 🤝";
          }
          setResult(finalResult);

          // Save game data to backend
          const gameData = {
            player1Name,
            player2Name,
            rounds: [...roundsData, roundData],
            player1Score: updatedPlayer1Score,
            player2Score: updatedPlayer2Score,
          };

          axios
            .post("http://13.51.207.180:5000//api/games", gameData)
            .then((response) => {
              console.log("Game data saved:", response.data);
            })
            .catch((error) => {
              console.error("Error saving game data:", error);
            });

          // Display final result with animation
          setTimeout(() => {
            setIsLoading(false);
            setIsModalVisible(false);
          }, 1500);
        }
      };

      calculateWinner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player2Choice]);

  // Handle Restarting the Game
  const handleRestart = () => {
    // Clear any existing timers
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }

    setPlayer1Choice(null);
    setPlayer2Choice(null);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentRound(1);
    setResult("");
    setRoundsData([]);
    setNamesSubmitted(false);
    setPlayer1Name("");
    setPlayer2Name("");
    setCurrentPlayer(1);
    setIsModalVisible(false);
    setModalMessage("");
    setIsLoading(false);
  };

  // Automatically close the modal after a brief period (e.g., 1.5 seconds)
  useEffect(() => {
    if (isModalVisible && modalMessage !== "Calculating round winner...") {
      const autoClose = setTimeout(() => {
        setIsModalVisible(false);
      }, 1500); // 1500 milliseconds = 1.5 seconds

      setTimer(autoClose);

      return () => clearTimeout(autoClose);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible, modalMessage]);

  return (
    <div className="flex flex-col items-center justify-center h-[92vh] bg-neutral-950 p-2 text-white overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Rock-Paper-Scissors Game</h1>

      {/* Modal for Player Turns and Round Results */}
      <AnimatePresence>
        {isModalVisible && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg text-center w-80"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <p className="text-xl mb-4">{modalMessage}</p>
              {modalMessage.includes("turn to choose") && (
                <button
                  onClick={() => setIsModalVisible(false)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-300 transition"
                >
                  Close
                </button>
              )}
              {isLoading && (
                <div className="mt-4">
                  <p className="animate-pulse">Calculating...</p>
                </div>
              )}
              {result && (
                <button
                  onClick={handleRestart}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Restart Game
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!namesSubmitted ? (
        // Player Names Input
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col space-y-4 text-black"
        >
          <input
            type="text"
            placeholder="Player 1 Name"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            className="px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Player 2 Name"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleStartGame}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Start Game
          </button>
        </motion.div>
      ) : (
        <>
          {/* Game Information */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mb-3 text-center p-2"
          >
            <p className="text-xl p-2">Round: {currentRound} / 6</p>
            <p className="text-xl p-2">
              {player1Name} Score: {player1Score}
            </p>
            <p className="text-xl p-2">
              {player2Name} Score: {player2Score}
            </p>
          </motion.div>

          {/* Player Move Selection */}

          {currentPlayer === 1 && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-6 text-center"
            >
              <h2 className="text-2xl pb-7">
                Player {player1Name} - Choose your move
              </h2>
              <div className="flex space-x-4 justify-center">
                {choices.map((choice) => (
                  <motion.button
                    key={choice}
                    onClick={() => handlePlayerChoice(choice)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center justify-center px-5 py-2 rounded shadow ${
                      player1Choice === choice
                        ? "bg-blue-500 text-black"
                        : "bg-white border"
                    }`}
                  >
                    {icons[choice]}
                    <span className="mt-1 text-fuchsia-400 text-lg">
                      {choice}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentPlayer === 2 && player2Choice === null && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-6 text-center"
            >
              <h2 className="text-2xl pb-7">
                Player {player2Name} - Choose your move
              </h2>
              <div className="flex space-x-4 justify-center">
                {choices.map((choice) => (
                  <motion.button
                    key={choice}
                    onClick={() => handlePlayerChoice(choice)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center justify-center px-5 py-2 rounded shadow ${
                      player2Choice === choice
                        ? "bg-green-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {icons[choice]}
                    <span className="mt-1 text-fuchsia-400 text-lg">
                      {choice}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Display Final Result and Restart Option */}
          {result && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-2xl font-semibold mb-4">{result}</p>
              <motion.button
                onClick={handleRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Restart Game
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Game;
