// client/src/components/GameData.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const GameData = () => {
  const [games, setGames] = useState([]);


  useEffect(() => {
    axios
      .get("http://13.51.207.180:5000//api/games")
      .then((response) => {
        setGames(response.data);
      })
      .catch((error) => {
        console.error("Error fetching game data:", error);
      });
  }, []);

  return (
    <div className="container mx-auto p-4 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-4">All Game Records</h1>
      {games.length === 0 ? (
        <p>No games found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Player 1</th>
                <th className="py-2 px-4 border">Player 2</th>
                <th className="py-2 px-4 border">Player 1 Score</th>
                <th className="py-2 px-4 border">Player 2 Score</th>
                <th className="py-2 px-4 border">Winner</th>
                <th className="py-2 px-4 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                let winner = "";
                if (game.player1Score > game.player2Score) {
                  winner = game.player1Name;
                } else if (game.player2Score > game.player1Score) {
                  winner = game.player2Name;
                } else {
                  winner = "Tie";
                }

                return (
                  <tr key={game._id}>
                    <td className="py-2 px-4 border">{game.player1Name}</td>
                    <td className="py-2 px-4 border">{game.player2Name}</td>
                    <td className="py-2 px-4 border">{game.player1Score}</td>
                    <td className="py-2 px-4 border">{game.player2Score}</td>
                    <td className="py-2 px-4 border">{winner}</td>
                    <td className="py-2 px-4 border">
                      {new Date(game.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GameData;
