// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import AnimePage from './pages/AnimePage';
import DetailPage from './pages/DetailPage';
import SearchPage from './pages/SearchPage'; 
import PersonPage from './pages/PersonPage';// Make sure this import is correct
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/tv-shows" element={<TVShowsPage />} />
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/detail/:type/:id" element={<DetailPage />} />
        {/* Alternative routes if you prefer */}
        <Route path="/movie/:id" element={<DetailPage />} />
        <Route path="/tv/:id" element={<DetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;