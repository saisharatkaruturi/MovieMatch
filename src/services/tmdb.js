import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
  timeout: 10000,
});

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  // Validate TMDB path format before returning
  if (!path.startsWith('/')) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Generate a placeholder SVG data URI for movies without posters
export const getPlaceholderUrl = (title, colors = ['#1a1a2e', '#16213e', '#0f3460']) => {
  const safeTitle = String(title || '?');
  // Use only ASCII initials to avoid btoa issues
  const initials = safeTitle
    .split(' ')
    .slice(0, 2)
    .map(w => (w && /[A-Za-z0-9]/.test(w[0]) ? w[0].toUpperCase() : ''))
    .join('') || '?';
  const bgColor = colors[Math.abs(safeTitle.charCodeAt(0) || 65) % colors.length];
  const escapedTitle = safeTitle
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const displayTitle = escapedTitle.length > 15 ? escapedTitle.substring(0, 15) + '...' : escapedTitle;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="${bgColor}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="80" fill="white" font-weight="bold">${initials}</text><text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="rgba(255,255,255,0.7)">${displayTitle}</text></svg>`;
  // UTF-8 safe base64 encoding
  const utf8 = unescape(encodeURIComponent(svg));
  return `data:image/svg+xml;base64,${btoa(utf8)}`;
};

// Oscar awards data - 'winner' = won Oscar, 'nominee' = nominated
const OSCAR_AWARDS = {
  28: 'winner', // The Godfather - Best Picture
  32: 'nominee', // The Shawshank Redemption
  29: 'winner', // Pulp Fiction - Best Original Screenplay
  30: 'winner', // The Dark Knight - Best Supporting Actor (Heath Ledger)
  35: 'winner', // Gladiator - Best Picture
  36: 'winner', // Titanic - Best Picture
  43: 'winner', // LOTR: Return of the King - Best Picture
  34: 'nominee', // The Matrix
  31: 'winner', // Inception
  38: 'nominee', // Interstellar
  41: 'winner', // Oppenheimer - Best Picture, Best Director, Best Actor
  42: 'nominee', // Dune: Part Two
  51: 'winner', // Seven Samurai - Honorary Oscar
  50: 'winner', // Spirited Away - Best Animated Feature
  44: 'winner', // Parasite - Best Picture (First non-English film to win Best Picture)
  56: 'winner', // Crouching Tiger, Hidden Dragon - Best Foreign Language Film
  57: 'nominee', // Hero
  58: 'nominee', // Raise the Red Lantern
  74: 'nominee', // Pan's Labyrinth
  75: 'winner', // The Secret in Their Eyes - Best Foreign Language Film
  66: 'winner', // Cinema Paradiso - Best Foreign Language Film
  67: 'winner', // Life Is Beautiful - Best Foreign Language Film
  70: 'nominee', // The Lives of Others
  72: 'nominee', // Das Boot
  61: 'nominee', // Amelie
  63: 'nominee', // The Intouchables
  54: 'winner', // Rashomon - Honorary Oscar
  71: 'nominee', // Downfall
  76: 'nominee', // City of God
  77: 'winner', // Roma - Best Director, Best Foreign Language Film
  26: 'winner', // Pather Panchali - Best Foreign Language Film (Honorary)
  68: 'nominee', // La Dolce Vita
  55: 'nominee', // Perfect Days
  49: 'nominee', // Decision to Leave
  45: 'nominee', // Oldboy
  73: 'nominee', // Run Lola Run
  79: 'nominee', // Mad Max: Fury Road
  80: 'nominee', // The Hunt
  69: 'nominee', // The Great Beauty
  10: 'nominee', // Dangal
  14: 'nominee', // Drishyam
  21: 'nominee', // Jai Bhim
};

// Genre mapping for mock movies (id -> genres array)
const MOVIE_GENRES = {
  1: ['Action', 'Adventure', 'Fantasy'],
  2: ['Action', 'Adventure', 'Fantasy'],
  3: ['Action', 'Drama', 'Adventure'],
  4: ['Action', 'Crime', 'Thriller'],
  5: ['Action', 'Crime', 'Thriller'],
  6: ['Action', 'Thriller', 'Crime'],
  7: ['Sci-Fi', 'Action', 'Adventure'],
  8: ['Action', 'Thriller'],
  9: ['Action', 'Thriller'],
  10: ['Drama', 'Action'],
  11: ['Comedy', 'Drama', 'Sci-Fi'],
  12: ['Drama', 'Comedy'],
  13: ['Action', 'Adventure', 'Drama'],
  14: ['Crime', 'Drama', 'Thriller'],
  15: ['Comedy', 'Drama', 'Romance'],
  16: ['Drama', 'Action', 'Comedy'],
  17: ['Romance', 'Drama', 'Comedy'],
  18: ['Drama', 'Romance', 'Action'],
  19: ['Action', 'Drama', 'Thriller'],
  20: ['Action', 'Crime', 'Thriller'],
  21: ['Drama', 'Crime', 'Mystery'],
  22: ['Action', 'Crime', 'Thriller'],
  23: ['Action', 'Drama', 'History'],
  24: ['Action', 'Crime', 'Drama'],
  25: ['Romance', 'Drama'],
  26: ['Drama'],
  27: ['Drama'],
  28: ['Drama', 'Crime'],
  29: ['Crime', 'Drama', 'Thriller'],
  30: ['Action', 'Crime', 'Drama'],
  31: ['Action', 'Sci-Fi', 'Adventure'],
  32: ['Drama'],
  33: ['Drama', 'Romance', 'Comedy'],
  34: ['Action', 'Sci-Fi'],
  35: ['Action', 'Drama', 'Adventure'],
  36: ['Drama', 'Romance'],
  37: ['Action', 'Adventure', 'Fantasy'],
  38: ['Adventure', 'Drama', 'Sci-Fi'],
  39: ['Action', 'Sci-Fi', 'Adventure'],
  40: ['Adventure', 'Sci-Fi', 'Action'],
  41: ['Drama', 'History', 'Thriller'],
  42: ['Sci-Fi', 'Adventure', 'Drama'],
  43: ['Action', 'Adventure', 'Drama'],
  44: ['Drama', 'Thriller', 'Comedy'],
  45: ['Action', 'Drama', 'Mystery'],
  46: ['Action', 'Horror', 'Drama'],
  47: ['Drama', 'Mystery', 'Romance'],
  48: ['Sci-Fi', 'Action', 'Drama'],
  49: ['Crime', 'Romance', 'Mystery'],
  50: ['Animation', 'Fantasy', 'Adventure'],
  51: ['Action', 'Drama', 'Adventure'],
  52: ['Animation', 'Romance', 'Drama'],
  53: ['Animation', 'Sci-Fi', 'Action'],
  54: ['Crime', 'Drama', 'Mystery'],
  55: ['Drama'],
  56: ['Action', 'Adventure', 'Fantasy'],
  57: ['Action', 'Drama', 'History'],
  58: ['Drama', 'History', 'Romance'],
  59: ['Drama', 'Comedy'],
  60: ['Drama', 'Comedy'],
  61: ['Comedy', 'Romance'],
  62: ['Drama', 'Crime'],
  63: ['Drama', 'Comedy'],
  64: ['Romance', 'Drama'],
  65: ['Romance', 'Drama', 'Musical'],
  66: ['Drama', 'Romance'],
  67: ['Drama', 'Comedy', 'Romance'],
  68: ['Drama'],
  69: ['Drama'],
  70: ['Drama', 'Thriller'],
  71: ['Drama', 'History', 'War'],
  72: ['War', 'Drama', 'Action'],
  73: ['Thriller', 'Crime', 'Drama'],
  74: ['Fantasy', 'Drama', 'War'],
  75: ['Drama', 'Mystery', 'Romance'],
  76: ['Drama', 'Crime'],
  77: ['Drama'],
  78: ['Drama', 'Crime'],
  79: ['Action', 'Adventure', 'Sci-Fi'],
  80: ['Drama', 'Mystery', 'Thriller'],
};

// TMDB Genre ID to Name mapping
const GENRE_ID_TO_NAME = {
  28: 'Action',
  12: 'Adventure',
  35: 'Comedy',
  80: 'Crime',
  18: 'Drama',
  10749: 'Romance',
  27: 'Horror',
  53: 'Thriller',
  16: 'Animation',
  14: 'Fantasy',
  36: 'History',
  37: 'Western',
  878: 'Sci-Fi',
  99: 'Documentary',
  9648: 'Mystery',
  10752: 'War',
  10402: 'Music',
  10770: 'TV Movie',
  10751: 'Family',
};

// Helper function to get genre names from TMDB genre_ids or mock genres
const getGenreNames = (movie) => {
  // If movie has genre_ids (from TMDB API), convert to names
  if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
    return movie.genre_ids.map(id => GENRE_ID_TO_NAME[id]).filter(Boolean);
  }
  // If movie has genres array (from mock data), return names directly
  if (movie.genres && Array.isArray(movie.genres)) {
    if (typeof movie.genres[0] === 'string') {
      return movie.genres;
    }
    return movie.genres.map(g => g.name);
  }
  // Fallback to MOVIE_GENRES mapping
  if (MOVIE_GENRES[movie.id]) {
    return MOVIE_GENRES[movie.id];
  }
  return [];
};

// Classify movies into categories - movies can appear in multiple categories
export const classifyMovies = (movies) => {
  // Separate Oscar winners, nominees, and others
  const oscarWinners = movies.filter(m => OSCAR_AWARDS[m.id] === 'winner')
    .sort((a, b) => b.vote_average - a.vote_average)
    .map(m => ({ ...m, category: 'Oscar Winner', isOscar: true }));

  const oscarNominees = movies.filter(m => OSCAR_AWARDS[m.id] === 'nominee')
    .sort((a, b) => b.vote_average - a.vote_average)
    .map(m => ({ ...m, category: 'Oscar Nominee', isOscar: true }));

  // Top rated (8.0+) that are not already Oscar
  const oscarIds = new Set([...oscarWinners, ...oscarNominees].map(m => m.id));
  const topRated = movies
    .filter(m => !oscarIds.has(m.id) && m.vote_average >= 8.0)
    .sort((a, b) => b.vote_average - a.vote_average)
    .map(m => ({ ...m, category: 'Top Rated IMDb' }));

  // Genre-based categories - movies can appear in multiple if they match
  // Use lower threshold (7.0) to get more movies per category
  const getMoviesByGenre = (genreName, minRating = 7.0) => {
    return movies
      .filter(m => {
        const genres = getGenreNames(m);
        return genres.some(g => g.toLowerCase() === genreName.toLowerCase()) && m.vote_average >= minRating;
      })
      .sort((a, b) => b.vote_average - a.vote_average)
      .map(m => ({ ...m, category: genreName, isGenre: true }));
  };

  const actionHigh = getMoviesByGenre('Action');
  const adventureHigh = getMoviesByGenre('Adventure');
  const comedyHigh = getMoviesByGenre('Comedy');
  const horrorHigh = getMoviesByGenre('Horror');
  const romanceHigh = getMoviesByGenre('Romance');
  const sciFiHigh = getMoviesByGenre('Sci-Fi');
  const thrillerHigh = getMoviesByGenre('Thriller');
  const dramaHigh = getMoviesByGenre('Drama');
  const animatedHigh = getMoviesByGenre('Animation');

  // Remaining movies that don't fit any category
  const categorizedIds = new Set([
    ...oscarWinners.map(m => m.id),
    ...oscarNominees.map(m => m.id),
    ...topRated.map(m => m.id),
    ...actionHigh.map(m => m.id),
    ...adventureHigh.map(m => m.id),
    ...comedyHigh.map(m => m.id),
    ...horrorHigh.map(m => m.id),
    ...romanceHigh.map(m => m.id),
    ...sciFiHigh.map(m => m.id),
    ...thrillerHigh.map(m => m.id),
    ...dramaHigh.map(m => m.id),
    ...animatedHigh.map(m => m.id),
  ]);

  const remaining = movies
    .filter(m => !categorizedIds.has(m.id))
    .sort((a, b) => b.vote_average - a.vote_average)
    .map(m => ({ ...m, category: 'More Movies' }));

  // Build sections array - ALWAYS include ALL categories in specific order
  const sections = [
    { title: 'Top Rated IMDb (8.0+)', movies: topRated, icon: '⭐' },
    { title: 'Oscar Winners', movies: oscarWinners, icon: '🏆' },
    { title: 'Oscar Nominees', movies: oscarNominees, icon: '🎬' },
    { title: 'Action Movies', movies: actionHigh, icon: '💥' },
    { title: 'Adventure Movies', movies: adventureHigh, icon: '🗺️' },
    { title: 'Comedy Movies', movies: comedyHigh, icon: '😂' },
    { title: 'Horror Movies', movies: horrorHigh, icon: '👻' },
    { title: 'Romance Movies', movies: romanceHigh, icon: '💕' },
    { title: 'Sci-Fi Movies', movies: sciFiHigh, icon: '🚀' },
    { title: 'Thriller Movies', movies: thrillerHigh, icon: '🔪' },
    { title: 'Drama Movies', movies: dramaHigh, icon: '🎭' },
    { title: 'Animation Movies', movies: animatedHigh, icon: '🎨' },
    { title: 'More Movies', movies: remaining, icon: '🎬' },
  ];

  return sections;
};

// Mock data - Global cinema from 1900-2026
const MOCK_MOVIES = [
  // TELUGU MOVIES
  { id: 1, title: 'Baahubali: The Beginning', poster_path: null, vote_average: 8.3, release_date: '2015-07-10', original_language: 'te', overview: 'In the kingdom of Mahishmati, a young warrior named Sivagami sacrifices her life to save an infant, who grows up to become Baahubali, the legendary warrior who discovers his royal lineage and must choose between avenging his fathers death or protecting his kingdom from a tyrannical ruler. This epic fantasy action film directed by S.S. Rajamouli features breathtaking visuals, powerful storytelling, and intense emotional moments that redefined Indian cinema.' },
  { id: 2, title: 'Baahubali 2: The Conclusion', poster_path: null, vote_average: 8.5, release_date: '2017-04-28', original_language: 'te', overview: 'Baahubali 2 continues the epic saga as Shivudu uncovers his true identity as the forgotten prince Baahubali, who was betrayed and murdered by his own brother Bhallala Deva. Now, Shivudu must embrace his heritage and lead a rebellion to reclaim his kingdom, avenge his fathers death, and save the love of his life from the clutches of his tyrannical uncle.' },
  { id: 3, title: 'RRR', poster_path: null, vote_average: 8.1, release_date: '2022-03-24', original_language: 'te', overview: 'Set in the 1920s, RRR follows the story of two legendary revolutionaries, Alluri Sitarama Raju and Komaram Bheem, who fight for freedom against British colonial rule. These two strangers from different backgrounds must work together to rescue a young girl from a British officer, discovering their shared destiny as freedom fighters in this spectacular action drama with unforgettable musical sequences.' },
  { id: 4, title: 'Pushpa: The Rise', poster_path: null, vote_average: 7.6, release_date: '2021-12-17', original_language: 'te', overview: 'Pushpa Raj, a coolie from Hyderabad, rises through the ranks of the red sandalwood smuggling operation in the forests of Vishakhapatnam. His journey from a humble laborer to a powerful syndicate leader showcases his street smarts, ruthless determination, and unexpected vulnerability as he navigates the dangerous world of crime while trying to win the love of his life.' },
  { id: 5, title: 'Pushpa 2: The Rule', poster_path: null, vote_average: 7.8, release_date: '2024-12-06', original_language: 'te', overview: 'Pushpa Raj has become the unchallenged king of red sandalwood smuggling, but his growing power attracts the attention of both police and rival criminals. When a determined police officer vows to bring him down, Pushpa must protect his family and empire while facing the ultimate test of loyalty and betrayal from those closest to him.' },
  { id: 6, title: 'Salaar: Part 1 - Ceasefire', poster_path: null, vote_average: 7.9, release_date: '2023-12-22', original_language: 'te', overview: 'Salaar follows the story of a fearsome gangster named Deva who has principles that no one dares to challenge. When his past catches up with him, he must protect his people and loved ones from an army of enemies who want him dead at any cost. This action thriller showcases a deadly man caught between his duty and his conscience.' },
  { id: 7, title: 'Kalki 2898 AD', poster_path: null, vote_average: 7.4, release_date: '2024-06-27', original_language: 'te', overview: 'Set in a post-apocalyptic future, Kalki 2898 AD weaves together three epic storylines spanning different time periods. A legendary hero named Kalki must rise to save humanity from destruction, while modern-day rebels fight against an evil totalitarian regime. This ambitious sci-fi epic combines Hindu mythology with futuristic storytelling in a visually stunning spectacle.' },
  { id: 8, title: 'Jawan', poster_path: null, vote_average: 7.2, release_date: '2023-09-07', original_language: 'hi', overview: 'A high-octane action thriller where a prison warden and his team of determined women take on a corrupt system and a terrorist organization. With clever twists andMask moments, this film explores themes of justice, sacrifice, and the price of freedom in a society plagued by corruption.' },
  { id: 9, title: 'Pathaan', poster_path: null, vote_average: 6.9, release_date: '2023-01-25', original_language: 'hi', overview: 'Pathaan is a RAW agent who returns from exile to investigate a deadly terrorist organization that has planned devastating attacks across India. With time running out and lives at stake, he must overcome his personal demons and work with a mysterious spy to prevent the biggest catastrophe the nation has ever faced.' },

  // HINDI MOVIES
  { id: 10, title: 'Dangal', poster_path: null, vote_average: 8.4, release_date: '2016-12-23', original_language: 'hi', overview: 'Based on a true story, Dangal follows the incredible journey of Mahavir Singh Phogat, a wrestler who dreams of winning gold for India but is forced to stop competing due to societal pressure. He trains his four daughters instead, turning them into world-class wrestlers who go on to win international championships, overcoming gender discrimination and inspiring millions along the way.' },
  { id: 11, title: 'PK', poster_path: null, vote_average: 7.9, release_date: '2014-12-19', original_language: 'hi', overview: 'An alien creature lands on Earth with a remote control that can communicate with God. Confused by human religions and superstitions, he seeks answers from a TV reporter, challenging blind faith and questioning the nature of God, religion, and human behavior in this thought-provoking comedy that sparks important conversations about spirituality.' },
  { id: 12, title: '3 Idiots', poster_path: null, vote_average: 8.4, release_date: '2009-12-25', original_language: 'hi', overview: 'Three engineering students form an unbreakable friendship at one of Indias most prestigious colleges, where they must balance academic pressure with their passion for learning. Through laughter and tears, they challenge the traditional education system, discover the true meaning of success, and prove that following your passion is the key to happiness and fulfillment.' },
  { id: 13, title: 'Sholay', poster_path: null, vote_average: 8.2, release_date: '1975-08-15', original_language: 'hi', overview: 'Two criminals are hired by a retired police officer to help him rid his village of a ruthless dacoit. But as they prepare for the ultimate battle, they discover that the enemy they face is more dangerous than they ever imagined. This iconic Bollywood film combines action, drama, comedy, and unforgettable characters into a timeless tale of courage and sacrifice.' },
  { id: 14, title: 'Drishyam', poster_path: null, vote_average: 8.3, release_date: '2015-07-31', original_language: 'ml', overview: 'A simple man with an extraordinary memory runs a cable TV business and loves watching movies. When his daughter accidentally kills the son of a powerful police officer, he uses his film knowledge to orchestrate the perfect alibi, leading to a thrilling cat-and-mouse game between him and the police as they desperately try to uncover the truth.' },
  { id: 15, title: 'Queen', poster_path: null, vote_average: 8.1, release_date: '2014-02-20', original_language: 'hi', overview: 'A young girl from Delhi goes on her honeymoon to Europe alone after being dumped by her fiance just days before the wedding. What starts as a journey to find herself becomes an eye-opening adventure across Paris and Amsterdam, where she discovers her own strength, independence, and the true meaning of self-worth.' },
  { id: 16, title: 'Bajrangi Bhaijaan', poster_path: null, vote_average: 8.0, release_date: '2015-07-17', original_language: 'hi', overview: 'A simple man with a pure heart adopts a lost Pakistani girl who cannot speak and has been separated from her family during a stampede at the India-Pakistan border. When he discovers she is actually Pakistani and was trafficked to India, he embarks on an extraordinary journey to help her return home, challenging diplomatic tensions and religious barriers.' },
  { id: 17, title: 'Dilwale Dulhania Le Jayenge', poster_path: null, vote_average: 8.1, release_date: '1995-10-20', original_language: 'hi', overview: 'When Raj and Simran meet on a train through Europe, they fall deeply in love. But Simran is already betrothed to someone else by her traditional father. Raj must win not just Simrans heart but also her fathers respect, leading to one of Bollywoods most beloved love stories about standing up for what you believe in.' },
  { id: 18, title: 'Kabir Singh', poster_path: null, vote_average: 6.6, release_date: '2019-06-21', original_language: 'hi', overview: 'Kabir Singh, a brilliant but self-destructive surgeon, spirals into depression after being heartbroken. He turns to reckless behavior and substance abuse, destroying his career and relationships. Only when he hits rock bottom can he begin the journey of self-reflection and redemption to win back the love of his life.' },
  { id: 19, title: 'Animal', poster_path: null, vote_average: 7.2, release_date: '2023-12-01', original_language: 'hi', overview: 'A son struggles with his complicated and distant relationship with his father, a powerful and ruthless businessman. As family secrets surface and betrayal threatens everything he holds dear, he transforms into a violent and dangerous person willing to do anything to protect his loved ones, leading to a bloody and shocking climax.' },

  // TAMIL MOVIES
  { id: 20, title: 'Vikram Vedha', poster_path: null, vote_average: 7.8, release_date: '2017-07-27', original_language: 'ta', overview: 'Vikram, a tough police encounter specialist, is tasked with hunting down Vedha, a feared gangster who claims to have reformed. But when Vedha starts narrating stories that expose the gray areas between law and justice, Vikram begins to question his own morality and the meaning of righteousness.' },
  { id: 21, title: 'Jai Bhim', poster_path: null, vote_average: 8.8, release_date: '2021-11-03', original_language: 'ta', overview: 'Based on a true story, when a tribal man named Ranchimanyam is falsely accused of theft and his pregnant wife goes missing after being arrested by the police, a lawyer takes up his case pro bono. This powerful drama exposes systemic injustice and the struggles faced by marginalized communities in India.' },
  { id: 22, title: 'Vikram', poster_path: null, vote_average: 8.2, release_date: '2022-06-03', original_language: 'ta', overview: 'An undercover agent with a dark past is drawn into a deadly game when he investigates the murder of an intelligence officer. As he uncovers layers of conspiracy involving drug cartels and powerful politicians, he must confront his own demons and make impossible choices between duty and justice.' },
  { id: 23, title: 'Ponniyin Selvan: Part 1', poster_path: null, vote_average: 7.6, release_date: '2022-09-30', original_language: 'ta', overview: 'Set in the Chola empire during the 10th century, this epic follows a young prince born with a mysterious birthmark who must navigate court intrigue, betrayal, and war to claim his rightful place on the throne while a deadly conspiracy threatens to destroy the empire from within.' },
  { id: 24, title: 'Master', poster_path: null, vote_average: 7.5, release_date: '2021-01-13', original_language: 'ta', overview: 'A professor takes on a mission to reform a juvenile correction facility, only to find himself trapped in a dangerous game of cat and mouse with a psychopathic gangster who has infiltrated the institution. What follows is a battle of wits and wills that will determine the fate of hundreds of young lives.' },

  // MARATHI MOVIES
  { id: 25, title: 'Sairat', poster_path: null, vote_average: 8.4, release_date: '2016-04-22', original_language: 'mr', overview: 'Archana and Prashant fall deeply in love despite coming from radically different social backgrounds. When their families discover their relationship, the young couple must choose between family loyalty and their love. This powerful romantic drama explores caste discrimination, social norms, and the courage required to fight for love in modern India.' },

  // BENGALI MOVIES
  { id: 26, title: 'Pather Panchali', poster_path: null, vote_average: 8.5, release_date: '1955-08-26', original_language: 'bn', overview: 'Based on Bibhutibhushan Bandyopadhyays classic novel, this masterpiece follows young Apu and his family as they grow up in rural Bengal. Through innocent eyes, we witness the beauty of nature, the struggles of poverty, and the bittersweet journey of growing up and letting go. This film defined Indian cinema worldwide.' },
  { id: 27, title: 'Mahanagar', poster_path: null, vote_average: 8.3, release_date: '1963-09-20', original_language: 'bn', overview: 'Subarna, a young housewife, takes a job as a saleswoman in Calcutta to help her struggling family. As she navigates the complexities of the working world and modern urban life, she discovers both liberation and new forms of oppression. Satyajit Rays deeply humanist drama remains remarkably relevant today.' },

  // ENGLISH/HOLLYWOOD MOVIES
  { id: 28, title: 'The Godfather', poster_path: null, vote_average: 9.2, release_date: '1972-03-14', original_language: 'en', overview: 'When the aging don of an organized crime dynasty names his reluctant son as his successor, Michael Corleone transforms from a war hero wanting nothing to do with the family business into the most powerful and feared mafia boss in America. This epic tale of power, family, loyalty, and betrayal defined a genre and remains cinema greatest achievement.' },
  { id: 29, title: 'Pulp Fiction', poster_path: null, vote_average: 8.9, release_date: '1994-10-14', original_language: 'en', overview: 'Two hitmen, a boxers wife, a gangster couple, and a pair of diner robbers all find their lives intertwining in this groundbreaking nonlinear crime story. Quentin Tarantinos masterful dialogue, unconventional structure, and memorable characters revolutionized independent cinema and changed filmmaking forever.' },
  { id: 30, title: 'The Dark Knight', poster_path: null, vote_average: 9.0, release_date: '2008-07-18', original_language: 'en', overview: 'Batman faces his greatest challenge when the Joker, a psychopathic criminal mastermind, launches a campaign of chaos and destruction across Gotham City. As the Clown Prince of Crime challenges everything Batman believes about justice and morality, the Dark Knight must push beyond his limits to save the city he swore to protect.' },
  { id: 31, title: 'Inception', poster_path: null, vote_average: 8.8, release_date: '2010-07-16', original_language: 'en', overview: 'Dom Cobb is the greatest thief in history, stealing secrets from within the dreams of others. Given a chance to have his criminal record erased, he must perform the impossible: plant an idea into someones mind rather than steal it. But protecting that idea from his own haunted past proves more dangerous than any dream.' },
  { id: 32, title: 'The Shawshank Redemption', poster_path: null, vote_average: 9.3, release_date: '1994-09-23', original_language: 'en', overview: 'A banker is wrongfully convicted of murder and sentenced to life in Shawshank Prison. Over decades, he forms an unlikely friendship with a fellow inmate while secretly planning an impossible escape. This deeply moving story about hope, friendship, and the human spirit triumphing over injustice has topped ratings worldwide for decades.' },
  { id: 33, title: 'Forrest Gump', poster_path: null, vote_average: 8.8, release_date: '1994-07-06', original_language: 'en', overview: 'Forrest Gump, a man with a low IQ but a pure heart, stumbles through life experiencing the greatest historical events of the 20th century. From meeting presidents to starting a shrimp empire, his unintentional involvement in major events shows that life is like a box of chocolates - you never know what youre gonna get.' },
  { id: 34, title: 'The Matrix', poster_path: null, vote_average: 8.7, release_date: '1999-03-31', original_language: 'en', overview: 'Neo, a computer programmer, discovers that the world he lives in is not real but a simulated reality called the Matrix created by machines to subjugate humanity. Joining a group of rebels, he learns martial arts and the truth about his existence, becoming the prophesied One who could end the war between humans and machines.' },
  { id: 35, title: 'Gladiator', poster_path: null, vote_average: 8.5, release_date: '2000-05-05', original_language: 'en', overview: 'Roman general Maximus Decimus Meridius is betrayed when the emperors corrupt son seizes power and murders his family. Reduced to slavery, Maximus rises through the gladiator arena to challenge the new emperor, driven by a single purpose: to avenge his murdered wife and son or Rome and restore glory to the empire.' },
  { id: 36, title: 'Titanic', poster_path: null, vote_average: 7.9, release_date: '1997-12-19', original_language: 'en', overview: 'Rose, a wealthy young woman suffocating under the expectations of her engagement, falls for Jack, a poor artist who wins a ticket to the maiden voyage of the RMS Titanic in a card game. Their passionate romance is cut short when the unsinkable ship strikes an iceberg, and they must fight to survive the freezing Atlantic waters.' },
  { id: 37, title: 'Avatar', poster_path: null, vote_average: 7.9, release_date: '2009-12-18', original_language: 'en', overview: 'Jake Sully, a paralyzed former Marine, is sent to Pandora, a moon where humans are mining valuable minerals. Using an Avatar body that allows him to walk, Jake encounters the Naavi, Pandoras indigenous species. Through his connection with them, he learns that protecting his new home might require sacrificing everything he came for.' },
  { id: 38, title: 'Interstellar', poster_path: null, vote_average: 8.6, release_date: '2014-11-07', original_language: 'en', overview: 'In a future where Earth is dying from crop blights and dust storms, a former pilot travels through a wormhole near Saturn in search of a new home for humanity. Battaging time dilation and black holes, Cooper must navigate the boundaries of space and time to save his daughter and humanity itself from extinction.' },
  { id: 39, title: 'The Avengers', poster_path: null, vote_average: 8.0, release_date: '2012-05-04', original_language: 'en', overview: 'Earths mightiest heroes must come together and learn to fight as a team to stop Loki and his alien army from enslaving humanity. Iron Man, Captain America, Thor, Hulk, Black Widow, and Hawkeye must put aside their differences to save New York and the entire world from the Mad Titan Thors brother.' },
  { id: 40, title: 'Jurassic Park', poster_path: null, vote_average: 8.1, release_date: '1993-06-11', original_language: 'en', overview: 'Scientists clone dinosaurs to populate a theme park on an isolated island, but when the security systems fail during a tropical storm, the prehistoric predators break free and hunt the terrified visitors. A small group must survive the most dangerous theme park gone wrong in cinematic history.' },
  { id: 41, title: 'Oppenheimer', poster_path: null, vote_average: 8.4, release_date: '2023-07-21', original_language: 'en', overview: 'The story of J. Robert Oppenheimer, the physicist who led the Manhattan Project to create the atomic bomb. This gripping drama explores his role in creating the most destructive weapon in human history, the moral weight of that choice, and how it led to his eventual downfall during the McCarthy era hearings.' },
  { id: 42, title: 'Dune: Part Two', poster_path: null, vote_average: 8.6, release_date: '2024-03-01', original_language: 'en', overview: 'Paul Atreides unites with the Fremen people to wage guerrilla warfare against House Harkonnen while seeking revenge for his familys betrayal. As he embraces his destiny as a messianic figure, he must confront the terrible consequences of his choices and the potential destruction of the universe.' },
  { id: 43, title: 'The Lord of the Rings: The Return of the King', poster_path: null, vote_average: 9.0, release_date: '2003-12-17', original_language: 'en', overview: 'The final chapter of the epic trilogy sees Aragorn claim his destiny as king while Frodo and Sam journey to Mount Doom to destroy the One Ring. As the fellowship makes its last stand at Minas Tirith and Gondor, the fate of Middle-earth hangs in the balance in this triumphant and emotional conclusion.' },

  // KOREAN MOVIES
  { id: 44, title: 'Parasite', poster_path: null, vote_average: 8.5, release_date: '2019-05-30', original_language: 'ko', overview: 'A poor family of four schemes their way into employment at a wealthy familys mansion by posing as unrelated qualified workers. But when a dark secret about the Parks basement is discovered, the parasites greed spirals into a terrifying sequence of events that culminates in violence and tragedy.' },
  { id: 45, title: 'Oldboy', poster_path: null, vote_average: 8.4, release_date: '2003-11-21', original_language: 'ko', overview: 'A man is kidnapped and imprisoned in a cell for 15 years without explanation. Upon release, he embarks on a brutal quest for revenge, aided by a mysterious girl. But his journey for vengeance leads to a devastating twist that will leave you questioning everything you thought you knew.' },
  { id: 46, title: 'Train to Busan', poster_path: null, vote_average: 7.6, release_date: '2016-07-20', original_language: 'ko', overview: 'A divorced father takes his young daughter on a train to Busan to reunite with her mother. When undead zombies overrun the country and spread through the train, passengers must fight for survival while Seok-woo discovers the depths of paternal love and the courage ordinary people can show in crisis.' },
  { id: 47, title: 'The Handmaiden', poster_path: null, vote_average: 8.1, release_date: '2016-06-01', original_language: 'ko', overview: 'In Japanese-occupied Korea, a young woman is hired as a handmaiden to a wealthy Japanese heiress. But she is actually part of an elaborate con orchestrated by a Count to steal her fortune. As the plot thickens, the relationships become increasingly complex with betrayal, manipulation, and forbidden desire.' },
  { id: 48, title: 'Snowpiercer', poster_path: null, vote_average: 7.1, release_date: '2013-08-15', original_language: 'ko', overview: 'In a frozen post-apocalyptic world where the remaining survivors live on a perpetually moving train, class struggle between the rich front cars and poor tail section passengers erupts into violent revolution. A group of rebels fights their way through each car toward the front, discovering the trains terrible secrets.' },
  { id: 49, title: 'Decision to Leave', poster_path: null, vote_average: 7.8, release_date: '2022-06-29', original_language: 'ko', overview: 'A detective investigating a suspected murder falls deeply in love with the prime suspect, a Chinese immigrant. Their twisted romance unfolds as he tries to prove her guilt while she manipulates him with apparent ease. This neo-noir romance thriller explores obsession, love, and the blurry line between justice and desire.' },

  // JAPANESE MOVIES
  { id: 50, title: 'Spirited Away', poster_path: null, vote_average: 8.6, release_date: '2001-07-20', original_language: 'ja', overview: 'Ten-year-old Chihiro and her parents stumble upon an abandoned theme park that is actually a bathhouse for spirits and gods. When her parents are transformed into pigs, she must work in the bathhouse to find a way to free them and return to the human world, discovering courage and friendship along the way.' },
  { id: 51, title: 'Seven Samurai', poster_path: null, vote_average: 8.6, release_date: '1954-04-26', original_language: 'ja', overview: 'A poor village hires seven unemployed samurai to protect them from a band of ruthless bandits who plan to raid them during planting season. This epic tale of honor, sacrifice, and the warrior code influenced countless films and remains one of the greatest achievements in cinema history.' },
  { id: 52, title: 'Your Name', poster_path: null, vote_average: 8.4, release_date: '2016-08-26', original_language: 'ja', overview: 'Two teenagers mysteriously swap bodies every few days, living each others lives without understanding why. Through notes and instructions, they navigate each others daily challenges while forming a deep connection. When they finally decide to meet, a devastating comet accident threatens to tear them apart forever.' },
  { id: 53, title: 'Akira', poster_path: null, vote_average: 8.0, release_date: '1988-07-16', original_language: 'ja', overview: 'In the rebuilt Tokyo after World War III, a biker gang member accidentally acquires telekinetic powers after his friend is kidnapped by the military. As his powers grow out of control, he becomes a threat to the entire city. This groundbreaking anime explores government experimentation, corruption, and the terrifying power of the mind.' },
  { id: 54, title: 'Rashomon', poster_path: null, vote_average: 8.2, release_date: '1950-08-26', original_language: 'ja', overview: 'A rape and murder are recounted from four different perspectives by the bandit, the ghost of the dead man, his widow, and a woodcutter who witnessed the events. Each version contradicts the others, leaving the truth shrouded in mystery. This pioneering film introduced unreliable narration to world cinema.' },
  { id: 55, title: 'Perfect Days', poster_path: null, vote_average: 7.8, release_date: '2023-02-23', original_language: 'ja', overview: 'Hirayama, a middle-aged man, lives a simple and contented life working as a toilet cleaner in Tokyo. His daily routines include caring for his plants, reading books, and photographing trees. When his estranged daughter appears, this quiet meditation on finding beauty in ordinary life becomes deeply moving.' },

  // CHINESE MOVIES
  { id: 56, title: 'Crouching Tiger, Hidden Dragon', poster_path: null, vote_average: 7.9, release_date: '2000-07-06', original_language: 'zh', overview: 'In 19th century China, legendary warrior Li Mu Bai retires and gives his precious sword, Green Destiny, to his master. When it is stolen by a mysterious outlaw, a web of romance, intrigue, and martial arts mastery unfolds across the beautiful Chinese landscape.' },
  { id: 57, title: 'Hero', poster_path: null, vote_average: 7.9, release_date: '2002-10-24', original_language: 'zh', overview: 'Before unification of China, a nameless warrior arrives at the kings court claiming to have killed three assassins who tried to murder him. As he recounts his version of events, each retelling reveals new dimensions of truth, loyalty, and the meaning of being a hero in ancient China.' },
  { id: 58, title: 'Raise the Red Lantern', poster_path: null, vote_average: 8.1, release_date: '1991-03-15', original_language: 'zh', overview: 'In 1920s China, a young woman becomes the fourth wife of a wealthy patriarch. Living in his secluded mansion, she navigates complex relationships with his other wives while the red lanterns that hang to honor her secretly illuminate a dark world of jealousy, betrayal, and trapped womanhood.' },
  { id: 59, title: 'Shower', poster_path: null, vote_average: 7.8, release_date: '1999-05-17', original_language: 'zh', overview: 'A successful Beijing businessman returns home when his father suffers a stroke, only to find his mentally disabled brother and the traditional bathhouse they run threatened by modernization. As he rediscovers the simple pleasures of community life, he must choose between urban success and family traditions.' },
  { id: 60, title: 'Yolo', poster_path: null, vote_average: 7.2, release_date: '2024-02-10', original_language: 'zh', overview: 'A woman who has spent her entire life taking care of others finally decides to put herself first after being diagnosed with a terminal illness. She gathers her estranged friends for one last adventure, discovering that life is meant to be lived, not just survived.' },

  // FRENCH MOVIES
  { id: 61, title: 'Amelie', poster_path: null, vote_average: 8.3, release_date: '2001-04-25', original_language: 'fr', overview: 'Nino, and the whimsical world they create together, Amelie discovers that she has the power to change lives for the better while remaining a mystery herself.' },
  { id: 62, title: 'La Haine', poster_path: null, vote_average: 8.3, release_date: '1995-10-01', original_language: 'fr', overview: 'Three friends from the Paris projects - a Frenchman, an Arab, and a Jew - spend a day drifting through their alienated suburban existence. Their simmering anger and frustration with society explodes after a violent incident with police, leading to a devastating conclusion.' },
  { id: 63, title: 'The Intouchables', poster_path: null, vote_average: 8.5, release_date: '2011-11-02', original_language: 'fr', overview: 'Philippe, a wealthy quadriplegic aristocrat, hires Driss, a young man from the Paris projects who was just released from prison, as his caregiver. Despite their vast differences, they form an unlikely friendship that transforms both their lives in unexpected ways.' },
  { id: 64, title: 'Blue Is the Warmest Colour', poster_path: null, vote_average: 7.7, release_date: '2013-05-23', original_language: 'fr', overview: 'Adele is a high school student who, after falling in love with a blue-haired art student named Emma, discovers the joy and pain of first love. Their passionate relationship spans years as they navigate the complexities of art, sexuality, and adult life.' },
  { id: 65, title: 'The Umbrellas of Cherbourg', poster_path: null, vote_average: 7.8, release_date: '1964-03-05', original_language: 'fr', overview: 'Genevieve works in her mothers umbrella shop in the French port town of Cherbourg. When she falls in love with Guy, a sailor about to depart for war, their tender and doomed romance unfolds entirely through song in this visually stunning and emotionally devastating musical.' },

  // ITALIAN MOVIES
  { id: 66, title: 'Cinema Paradiso', poster_path: null, vote_average: 8.5, release_date: '1988-11-17', original_language: 'it', overview: 'A famous film director returns to his Sicilian village for the funeral of the old projectionist who mentored him as a boy. Through flashbacks, we see how Salvatore learned about love, loss, and cinema itself through the magic of the movies shown at Cinema Paradiso.' },
  { id: 67, title: 'Life Is Beautiful', poster_path: null, vote_average: 8.6, release_date: '1997-12-20', original_language: 'it', overview: 'An Italian Jewish man uses humor and imagination to shield his young son from the horrors of a Nazi concentration camp. By convincing their imprisonment is an elaborate game with a grand prize, he protects his sons innocence while demonstrating the incredible power of love to overcome adversity.' },
  { id: 68, title: 'La Dolce Vita', poster_path: null, vote_average: 8.0, release_date: '1960-04-19', original_language: 'it', overview: 'A journalist covers the glamorous but decaying world of Rome nightlife, encountering celebrities, aristocrats, and spiritual seekers over seven wild nights. Federico Fellinis masterpiece captures the decadence and spiritual emptiness of postwar Italian society.' },
  { id: 69, title: 'The Great Beauty', poster_path: null, vote_average: 7.7, release_date: '2013-05-21', original_language: 'it', overview: 'Jep Gambardella, a 65-year-old journalist, reflects on his life after the death of his wife while Rome celebrates around him. This visually spectacular film explores art, decadence, memory, and the search for meaning in modern Rome.' },

  // GERMAN MOVIES
  { id: 70, title: 'The Lives of Others', poster_path: null, vote_average: 8.4, release_date: '2006-03-15', original_language: 'de', overview: 'In 1984 East Berlin, a Stasi captain is assigned to spy on a playwright and his lover. As he listens to their intimate conversations through hidden microphones, he becomes emotionally invested in their lives and begins questioning his role in the oppressive state.' },
  { id: 71, title: 'Downfall', poster_path: null, vote_average: 8.2, release_date: '2004-09-16', original_language: 'de', overview: 'The final days of Adolf Hitler in his bunker as the Red Army closes in on Berlin. Based on diaries and testimonies, this disturbing documentary-style film shows the dictator in his final hours, exploring how ordinary people became complicit in atrocity.' },
  { id: 72, title: 'Das Boot', poster_path: null, vote_average: 8.4, release_date: '1981-09-16', original_language: 'de', overview: 'The claustrophobic terror of a German U-boat crew during World War II as they patrol the Atlantic, hunted by Allied destroyers. This intense war film captures the fear, camaraderie, and tedium of submarine warfare better than any other film.' },
  { id: 73, title: 'Run Lola Run', poster_path: null, vote_average: 7.6, release_date: '1998-08-06', original_language: 'de', overview: 'Lola has 20 minutes to get 100,000 marks to save her boyfriends life after he loses their money to a gangster. The film shows three parallel versions of how these 20 minutes might unfold, exploring how small moments can change the course of our lives.' },

  // SPANISH/LATIN AMERICAN MOVIES
  { id: 74, title: "Pan's Labyrinth", poster_path: null, vote_average: 8.2, release_date: '2006-10-10', original_language: 'es', overview: 'In post-Civil War Spain, young Ofelia moves with her pregnant mother to live with her new stepfather, a sadistic military officer. Escaping into a fantastical world of fauns and monsters, she must complete three dangerous tasks to become immortal, blurring reality and fantasy.' },
  { id: 75, title: 'The Secret in Their Eyes', poster_path: null, vote_average: 8.2, release_date: '2009-08-13', original_language: 'es', overview: 'A retired legal counselor decides to write about an unsolved murder case from 25 years ago involving a woman who was raped and murdered and her husbands strange behavior. As he digs deeper, obsession and old feelings resurface, leading to a shocking revelation.' },
  { id: 76, title: 'City of God', poster_path: null, vote_average: 8.6, release_date: '2002-08-30', original_language: 'pt', overview: 'In the favelas of Rio de Janeiro, young Buscape grows up surrounded by drug dealers and violence. His journey to become a photographer allows us to witness the brutal realities of life in the slums while exploring how environment shapes destiny.' },
  { id: 77, title: 'Roma', poster_path: null, vote_average: 7.7, release_date: '2018-11-21', original_language: 'es', overview: 'A domestic worker in 1970s Mexico City navigates the struggles of her employer household while dealing with personal tragedy. Alfonso Cuarons semi-autobiographical film is a stunning meditation on class, family, and the women who keep the world running.' },

  // RUSSIAN
  { id: 78, title: 'Leviathan', poster_path: null, vote_average: 7.6, release_date: '2014-07-24', original_language: 'ru', overview: 'In a small Russian town near the Arctic Circle, Kolya owns an auto repair shop and lives with his wife and stepson. When the corrupt mayor demolishes his property and court fails to deliver justice, Kolya must decide how far he will go to fight back.' },

  // AUSTRALIAN
  { id: 79, title: 'Mad Max: Fury Road', poster_path: null, vote_average: 8.1, release_date: '2015-05-15', original_language: 'en', overview: 'In a desert wasteland, Imperator Furiosa rebels against Immortan Joe and frees his slave wives. Hunted by Joe and his war boys, she must transport them to her homeland while Max, haunted by his past, reluctantly becomes her ally.' },

  // NORDIC
  { id: 80, title: 'The Hunt', poster_path: null, vote_average: 8.3, release_date: '2012-08-16', original_language: 'da', overview: 'Lucas, a kindergarten teacher in a small Danish town, finds his life destroyed when a young student falsely accuses him of sexual abuse. As suspicion spreads through the community, the innocent man must fight to clear his name while facing the worst in people.' },
];

const MOCK_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10749, name: 'Romance' },
  { id: 27, name: 'Horror' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 37, name: 'Western' },
  { id: 878, name: 'Sci-Fi' },
  { id: 99, name: 'Documentary' },
  { id: 9648, name: 'Mystery' },
  { id: 10752, name: 'War' },
];

const MOCK_CAST = [
  { id: 1, name: 'Marlon Brando', character: 'Vito Corleone', profile_path: null },
  { id: 2, name: 'Al Pacino', character: 'Michael Corleone', profile_path: null },
  { id: 3, name: 'Leonardo DiCaprio', character: 'Jack Dawson', profile_path: null },
  { id: 4, name: 'Prabhas', character: 'Baahubali', profile_path: null },
  { id: 5, name: 'Song Kang-ho', character: 'Park Dong-won', profile_path: null },
  { id: 6, name: 'Audrey Tautou', character: 'Amelie', profile_path: null },
];

export const fetchTrendingMovies = async () => {
  try {
    const response = await tmdbApi.get('/trending/movie/week');
    return response.data.results;
  } catch (error) {
    return MOCK_MOVIES;
  }
};

export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page },
    });
    return response.data;
  } catch (error) {
    const filtered = MOCK_MOVIES.filter(m =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, total_pages: 1 };
  }
};

export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: { append_to_response: 'credits,reviews' },
    });
    return response.data;
  } catch (error) {
    const movie = MOCK_MOVIES.find(m => m.id === parseInt(movieId)) || MOCK_MOVIES[0];
    return {
      ...movie,
      genres: MOCK_GENRES.slice(0, 3),
      runtime: 145,
      tagline: 'An epic adventure',
      credits: { cast: MOCK_CAST, crew: [{ name: 'Various Directors', job: 'Director' }] },
      reviews: { results: [] },
    };
  }
};

export const fetchSimilarMovies = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return response.data.results;
  } catch (error) {
    return MOCK_MOVIES.filter(m => m.id !== parseInt(movieId)).slice(0, 6);
  }
};

// Max pages to fetch from /discover/movie per request. TMDB caps pages at 500,
// but we stop earlier to keep the response snappy — 20 movies per page × 25
// pages = 500 results, which covers every realistic genre × language combo.
const GENRE_DISCOVER_MAX_PAGES = 25;

// Fetch every movie that matches the given genres + language by paginating
// through TMDB's /discover/movie. The result shape stays compatible with
// Home.jsx: `{ sections, isClassified }`. Falls back to mock data sliced to
// the requested language on network failure.
export const fetchMoviesByGenre = async (genreIds, language = 'all', _page = 1) => {
  try {
    const baseParams = {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
      'primary_release_date.gte': '1900-01-01',
      'primary_release_date.lte': '2026-12-31',
      'vote_count.gte': 10,
    };
    if (language !== 'all') {
      baseParams.with_original_language = language;
    }

    const allResults = [];
    const seenIds = new Set();
    let totalPages = 1;

    for (let page = 1; page <= GENRE_DISCOVER_MAX_PAGES; page += 1) {
      const response = await tmdbApi.get('/discover/movie', {
        params: { ...baseParams, page },
      });
      const results = response.data?.results || [];
      totalPages = response.data?.total_pages || totalPages;

      for (const movie of results) {
        if (!movie || seenIds.has(movie.id)) continue;
        seenIds.add(movie.id);
        allResults.push(movie);
      }

      // Stop early when we've exhausted the available pages or this page
      // came back shorter than a full page (signals end of results).
      if (page >= totalPages || results.length === 0) break;
    }

    return { sections: classifyMovies(allResults), isClassified: true };
  } catch (error) {
    let movies;
    if (language === 'all') {
      movies = MOCK_MOVIES.slice(0, 12);
    } else {
      movies = MOCK_MOVIES.filter((m) => m.original_language === language).slice(0, 12);
    }
    return { sections: classifyMovies(movies), isClassified: true };
  }
};

export const fetchGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    return MOCK_GENRES;
  }
};

// ============================================================================
// POSTER ENRICHMENT
// ============================================================================
// Fills in missing poster_path / backdrop_path by looking movies up on TMDB
// by title. Results are cached in localStorage so each unique title is fetched
// at most once across all sessions.

const POSTER_CACHE_KEY = 'tmdb_poster_cache_v1';

const loadPosterCache = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(POSTER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

const savePosterCache = (cache) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(cache));
  } catch (_) {
    // localStorage may be full or unavailable (private mode, quota) — ignore
  }
};

const buildCacheKey = (movie) =>
  `${movie.title || ''}|${(movie.release_date || '').slice(0, 4)}|${movie.original_language || ''}`;

// Search TMDB for one movie by title and return an updated copy with a real
// poster_path (and backdrop_path when available). Returns the input unchanged
// if it already has a poster_path or if the lookup fails.
export const enrichMoviePoster = async (movie) => {
  if (!movie || movie.poster_path) return movie;

  const cache = loadPosterCache();
  const cacheKey = buildCacheKey(movie);

  if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
    const cached = cache[cacheKey];
    if (cached?.poster_path) {
      return {
        ...movie,
        poster_path: cached.poster_path,
        backdrop_path: cached.backdrop_path || movie.backdrop_path,
        tmdb_id: cached.tmdb_id || movie.tmdb_id,
      };
    }
    // Negative cache entry — TMDB had no poster for this title
    return movie;
  }

  try {
    const yearParam = movie.release_date ? Number(movie.release_date.slice(0, 4)) : undefined;
    const { data } = await tmdbApi.get('/search/movie', {
      params: {
        query: movie.title,
        ...(yearParam && !Number.isNaN(yearParam) ? { year: yearParam } : {}),
        page: 1,
      },
    });
    const results = data.results || [];

    // Prefer exact language match, then highest vote_count
    const best =
      results.find((r) => r.original_language === movie.original_language) ||
      results.slice().sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];

    if (best?.poster_path) {
      cache[cacheKey] = {
        poster_path: best.poster_path,
        backdrop_path: best.backdrop_path || null,
        tmdb_id: best.id,
      };
      savePosterCache(cache);
      return {
        ...movie,
        poster_path: best.poster_path,
        backdrop_path: best.backdrop_path || movie.backdrop_path,
        tmdb_id: best.id,
        genre_ids: best.genre_ids || movie.genre_ids,
      };
    }

    // Cache negative result so we don't re-query for the same title
    cache[cacheKey] = { poster_path: null };
    savePosterCache(cache);
  } catch (_) {
    // Network or API error — leave the movie as-is, placeholder will render
  }
  return movie;
};

// Enrich an array of movies concurrently with bounded parallelism.
// Calls `onUpdate(next)` after each movie is enriched so the caller can
// re-render progressively as posters fill in.
export const enrichMoviesInBackground = async (movies, onUpdate, concurrency = 4) => {
  if (!movies?.length) return movies;

  const out = movies.slice();
  const toEnrich = [];
  for (let i = 0; i < movies.length; i++) {
    if (!movies[i].poster_path) toEnrich.push(i);
  }
  if (!toEnrich.length) return out;

  let cursor = 0;
  const workerCount = Math.min(concurrency, toEnrich.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (cursor < toEnrich.length) {
      const myIdx = cursor++;
      const arrIdx = toEnrich[myIdx];
      try {
        out[arrIdx] = await enrichMoviePoster(movies[arrIdx]);
        if (onUpdate) onUpdate(out.slice());
      } catch (_) {
        // Individual failures are non-fatal; placeholder will render for that card
      }
    }
  });
  await Promise.all(workers);
  return out;
};

// ============================================================================
// PERSON PROFILE ENRICHMENT
// ============================================================================
// Same pattern as poster enrichment, but for /search/person (artist photos).
// Cached in a separate localStorage key so it doesn't collide with movie data.

const PROFILE_CACHE_KEY = 'tmdb_profile_cache_v1';

const loadProfileCache = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

const saveProfileCache = (cache) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
  } catch (_) {}
};

// Look up an artist by name and patch in profile_path. Returns the person
// with `profile_path` set when TMDB has a result; otherwise returns the
// input unchanged (placeholder initials will render).
export const enrichPersonProfile = async (person) => {
  if (!person || person.profile_path) return person;

  const cache = loadProfileCache();
  const cacheKey = `${person.name || ''}|${person.known_for_department || ''}`;

  if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
    const cached = cache[cacheKey];
    if (cached?.profile_path) {
      return { ...person, profile_path: cached.profile_path };
    }
    return person;
  }

  try {
    const { data } = await tmdbApi.get('/search/person', {
      params: { query: person.name, page: 1 },
    });
    const results = data.results || [];

    const best =
      results.find((r) => r.known_for_department === person.known_for_department) ||
      results.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];

    if (best?.profile_path) {
      cache[cacheKey] = { profile_path: best.profile_path };
      saveProfileCache(cache);
      return { ...person, profile_path: best.profile_path };
    }
    cache[cacheKey] = { profile_path: null };
    saveProfileCache(cache);
  } catch (_) {}

  return person;
};

// Same background-with-concurrency helper, but for an array of people.
export const enrichPeopleInBackground = async (people, onUpdate, concurrency = 4) => {
  if (!people?.length) return people;

  const out = people.slice();
  const toEnrich = [];
  for (let i = 0; i < people.length; i++) {
    if (!people[i].profile_path) toEnrich.push(i);
  }
  if (!toEnrich.length) return out;

  let cursor = 0;
  const workerCount = Math.min(concurrency, toEnrich.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (cursor < toEnrich.length) {
      const myIdx = cursor++;
      const arrIdx = toEnrich[myIdx];
      try {
        out[arrIdx] = await enrichPersonProfile(people[arrIdx]);
        if (onUpdate) onUpdate(out.slice());
      } catch (_) {}
    }
  });
  await Promise.all(workers);
  return out;
};

export const fetchMoviesByLanguage = async (language = 'all', page = 1) => {
  // For 'all' languages, return plain movies without classification (use TMDB API)
  if (language === 'all') {
    try {
      const params = {
        sort_by: 'popularity.desc',
        page,
        'primary_release_date.gte': '1900-01-01',
        'primary_release_date.lte': '2026-12-31',
        'vote_count.gte': 50,
      };
      const response = await tmdbApi.get('/discover/movie', { params });
      return response.data.results;
    } catch (error) {
      return MOCK_MOVIES;
    }
  }

  // For specific languages, use live TMDB so users get a wide, real catalog
  // of movies in that language (not the small curated mock slice). Each
  // returned movie already has its own poster_path, so cards render real
  // posters without needing enrichment.
  try {
    const { data } = await tmdbApi.get('/discover/movie', {
      params: {
        with_original_language: language,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 20,
        page,
        'primary_release_date.gte': '1900-01-01',
        'primary_release_date.lte': '2026-12-31',
      },
    });
    return data.results || [];
  } catch (error) {
    // Offline / API error fallback — return the curated mock slice; the UI
    // will enrich missing poster_path values via useEnrichedMovies.
    return MOCK_MOVIES.filter((m) => m.original_language === language);
  }
};

export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        sort_by: 'popularity.desc',
        page,
        'primary_release_date.gte': '1900-01-01',
        'primary_release_date.lte': '2026-12-31',
        'vote_count.gte': 50,
      },
    });
    return response.data.results;
  } catch (error) {
    return MOCK_MOVIES;
  }
};

// Artist/Person APIs
// Mock data for search results of famous directors
const getMockDirectorSearchResults = (query) => {
  const queryLower = query.toLowerCase();
  const directors = [
    {
      id: 1283,
      name: 'S.S. Rajamouli',
      known_for_department: 'Directing',
      profile_path: null,
      known_for: [
        { title: 'Baahubali 2: The Conclusion', id: 1 },
        { title: 'RRR', id: 3 },
        { title: 'Baahubali: The Beginning', id: 2 }
      ]
    },
  ];
  return directors.filter(d => d.name.toLowerCase().includes(queryLower));
};

export const searchPeople = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/person', {
      params: { query, page },
    });
    const apiResults = response.data.results || [];

    // If searching for Indian directors, include mock data
    if (query.length > 2) {
      const mockResults = getMockDirectorSearchResults(query);
      const combined = [...mockResults];
      for (const person of apiResults) {
        if (!combined.some(p => p.id === person.id)) {
          combined.push(person);
        }
      }
      return { results: combined, total_pages: 1 };
    }

    return response.data;
  } catch (error) {
    // If API fails, still try to return mock directors
    if (query.length > 2) {
      return { results: getMockDirectorSearchResults(query), total_pages: 1 };
    }
    return { results: [], total_pages: 0 };
  }
};

// Mock data for famous directors not fully in TMDB
const getMockDirectorData = (personId) => {
  const directors = {
    // S.S. Rajamouli - Indian director known for Baahubali, RRR, Eega, Magadheera
    '1283': {
      id: 1283,
      name: 'S.S. Rajamouli',
      known_for_department: 'Directing',
      birthday: '1973-10-10',
      place_of_birth: 'Madhira, Telangana, India',
      gender: 2,
      biography: 'S.S. Rajamouli is an Indian film director and screenwriter known for his epic fantasy and action films. He is one of the highest-grossing Indian filmmakers, famous for the Baahubali series and RRR. His films are celebrated for their visual spectacle, innovative storytelling, and technical achievements in Indian cinema.',
      profile_path: null,
      also_known_as: ['S. S. Rajamouli', 'Sega Rajamouli'],
      movie_credits: {
        cast: [],
        crew: [
          { id: 1, title: 'Baahubali 2: The Conclusion', job: 'Director', poster_path: null, release_date: '2017-04-28', vote_average: 8.5 },
          { id: 2, title: 'Baahubali: The Beginning', job: 'Director', poster_path: null, release_date: '2015-07-10', vote_average: 8.3 },
          { id: 3, title: 'RRR', job: 'Director', poster_path: null, release_date: '2022-03-24', vote_average: 8.1 },
          { id: 4, title: 'Eega', job: 'Director', poster_path: null, release_date: '2012-07-05', vote_average: 7.8 },
          { id: 5, title: 'Magadheera', job: 'Director', poster_path: null, release_date: '2009-07-31', vote_average: 7.6 },
          { id: 6, title: 'Vikramarkudu', job: 'Director', poster_path: null, release_date: '2006-08-04', vote_average: 7.5 },
          { id: 7, title: 'Maryada Ramanna', job: 'Director', poster_path: null, release_date: '2010-07-28', vote_average: 7.3 },
          { id: 8, title: 'Chatrapathi', job: 'Director', poster_path: null, release_date: '2005-06-10', vote_average: 7.0 },
          { id: 9, title: 'Sye', job: 'Director', poster_path: null, release_date: '2004-10-28', vote_average: 7.4 },
          { id: 10, title: 'Student No.1', job: 'Director', poster_path: null, release_date: '2000-12-31', vote_average: 7.2 },
        ]
      },
      tv_credits: { cast: [] }
    },
  };
  return directors[personId];
};

export const fetchPersonDetails = async (personId) => {
  try {
    const response = await tmdbApi.get(`/person/${personId}`, {
      params: { append_to_response: 'movie_credits,tv_credits' },
    });
    return response.data;
  } catch (error) {
    // Check if it's a known director and return mock data
    const mockDirector = getMockDirectorData(personId);
    if (mockDirector) {
      return mockDirector;
    }
    return null;
  }
};

export const fetchPopularPeople = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/person/popular', { params: { page } });
    return response.data.results;
  } catch (error) {
    return [];
  }
};

// ============================================================================
// WATCH PROVIDERS API
// ============================================================================
// TMDB's /movie/{id}/watch/providers endpoint returns every country that has
// availability data for the movie, grouped by monetisation type (flatrate,
// rent, buy, free, ads). Each provider carries a logo_path and an optional
// link that takes the user to the platform's deep page for the movie.
//
// The endpoint is hit on-demand (not on the movie detail's main load) and
// results are cached in-memory + localStorage so the same movie × country
// combination never refetches within the cache TTL.

const WATCH_PROVIDER_CACHE_KEY = 'tmdb_watch_provider_cache_v1';
const WATCH_PROVIDER_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const WATCH_PROVIDER_LOGO_BASE = 'https://image.tmdb.org/t/p';

// Supported country list shown in the country selector. Each entry has the
// ISO-3166-1 code TMDB expects, the human-friendly label, and a flag emoji
// used in the UI. Keep the codes aligned with TMDB's `/watch/providers/regions`
// response — the selector always renders even if TMDB has no data for that
// region (the section then renders the empty state).
export const SUPPORTED_COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
];

// Best-effort country detection from the browser locale / timezone. TMDB
// returns no results for unknown regions — the caller is expected to fall back
// to 'US' or 'IN' when this resolves to a country we don't track.
export const detectUserCountry = () => {
  if (typeof navigator === 'undefined') return 'US';
  try {
    // Intl.Locale exposes a region subtag (e.g. "en-IN" -> "IN"). Works in
    // every modern browser; we still fall back to a timezone guess.
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const region = locale.split('-')[1]?.toUpperCase();
    if (region && /^[A-Z]{2}$/.test(region)) return region;

    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    if (tz.includes('kolkata') || tz.includes('calcutta') || tz.includes('asia/calcutta')) return 'IN';
    if (tz.includes('london')) return 'GB';
    if (tz.includes('tokyo')) return 'JP';
    if (tz.includes('seoul')) return 'KR';
    if (tz.includes('sydney') || tz.includes('australia')) return 'AU';
    if (tz.includes('berlin') || tz.includes('europe/')) return 'DE';
    if (tz.includes('paris')) return 'FR';
    if (tz.includes('rome') || tz.includes('italy')) return 'IT';
    if (tz.includes('america/')) return 'US';
  } catch (_) {
    // ignore
  }
  return 'US';
};

const loadWatchProviderCache = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(WATCH_PROVIDER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

const saveWatchProviderCache = (cache) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WATCH_PROVIDER_CACHE_KEY, JSON.stringify(cache));
  } catch (_) {
    // localStorage may be full or unavailable — ignore
  }
};

const isCacheEntryFresh = (entry) =>
  entry && typeof entry.fetchedAt === 'number' &&
  Date.now() - entry.fetchedAt < WATCH_PROVIDER_CACHE_TTL_MS;

// Fetch raw watch-provider data for a movie. Returns the full TMDB response
// shape (`{ results: { [country]: { flatrate, rent, buy, free, ads, link } } }`)
// so the caller can switch countries without re-hitting the network.
export const fetchWatchProviders = async (movieId) => {
  if (!movieId) return null;

  const cache = loadWatchProviderCache();
  const cacheKey = `movie:${movieId}`;
  const cached = cache[cacheKey];
  if (cached && isCacheEntryFresh(cached)) {
    return cached.data;
  }

  try {
    const { data } = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    cache[cacheKey] = { fetchedAt: Date.now(), data };
    saveWatchProviderCache(cache);
    return data;
  } catch (_) {
    // Return whatever we last had, even if stale, before giving up entirely.
    if (cached?.data) return cached.data;
    return null;
  }
};

// Group TMDB's country-keyed response into the per-country shape the UI
// expects. Returns null when the country has no availability so the empty
// state can render. Unknown monetization buckets are ignored on purpose — we
// only render the four the spec calls out (streaming, rent, buy, free).
export const getProvidersForCountry = (rawProviders, countryCode) => {
  if (!rawProviders?.results || !countryCode) return null;
  const country = rawProviders.results[countryCode];
  if (!country) return null;

  // TMDB returns both `free` (legally free with sub) and `ads` (free with ads).
  // Surface them under one "Free" bucket per the spec.
  const free = [
    ...(Array.isArray(country.free) ? country.free : []),
    ...(Array.isArray(country.ads) ? country.ads : []),
  ];

  return {
    link: country.link || null,
    streaming: Array.isArray(country.flatrate) ? country.flatrate : [],
    rent: Array.isArray(country.rent) ? country.rent : [],
    buy: Array.isArray(country.buy) ? country.buy : [],
    free,
  };
};

// Build a fully-qualified logo URL for a TMDB provider object. TMDB stores
// provider logos as relative paths under image.tmdb.org/t/p/.
export const getProviderLogoUrl = (provider, size = 'w92') => {
  if (!provider?.logo_path) return null;
  if (provider.logo_path.startsWith('http')) return provider.logo_path;
  return `${WATCH_PROVIDER_LOGO_BASE}/${size}${provider.logo_path}`;
};

// Fetch crew members from a specific department
export const fetchCrewByDepartment = async (department, page = 1) => {
  try {
    // Get popular movies
    const moviesResponse = await tmdbApi.get('/discover/movie', {
      params: {
        sort_by: 'popularity.desc',
        page,
        'primary_release_date.gte': '1900-01-01',
        'primary_release_date.lte': '2026-12-31',
        'vote_count.gte': 100,
      },
    });

    const movies = moviesResponse.data.results.slice(0, 10);
    const seenIds = new Set();
    const crewList = [];

    for (const movie of movies) {
      try {
        const creditsResponse = await tmdbApi.get(`/movie/${movie.id}/credits`);
        const crew = creditsResponse.data.crew || [];

        for (const person of crew) {
          if (person.department === department && !seenIds.has(person.id)) {
            seenIds.add(person.id);
            crewList.push({
              ...person,
              known_for: [movie],
            });
          }
        }
      } catch (e) {
        // Skip this movie if credits fail
      }

      if (crewList.length >= 20) break;
    }

    return crewList.slice(0, 20);
  } catch (error) {
    return [];
  }
};
