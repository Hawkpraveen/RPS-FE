// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GameData from './Components/GameData';
import Game from './Components/Game';


const App = () => {
  return (
    <Router>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between">
          <Link to="/" className="text-white font-bold">
            Rock-Paper-Scissors
          </Link>
          <Link to="/games" className="text-gray-300 hover:text-white">
            Game Records
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/games" element={<GameData />} />
      </Routes>
    </Router>
  );
};

export default App;
