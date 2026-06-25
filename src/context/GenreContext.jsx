import { createContext, useContext, useState, useEffect } from 'react';
import { fetchGenres } from '../services/tmdb';

const GenreContext = createContext();

export const GenreProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    const loadGenres = async () => {
      const genresList = await fetchGenres();
      setGenres(genresList);
    };
    loadGenres();
  }, []);

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearGenres = () => setSelectedGenres([]);

  return (
    <GenreContext.Provider
      value={{ genres, selectedGenres, toggleGenre, clearGenres }}
    >
      {children}
    </GenreContext.Provider>
  );
};

export const useGenres = () => useContext(GenreContext);
