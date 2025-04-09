import React, { useState } from 'react';

function SongTrackerApp() {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [notification, setNotification] = useState('');
  const [filter, setFilter] = useState('');
  const [sortOption, setSortOption] = useState('Recently Added');
  const [statusFilter, setStatusFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const updateStatus = (id, status) => {
    const updatedSongs = songs.map(song =>
      song.id === id ? { ...song, status } : song
    );
    setSongs(updatedSongs);
  };

  const updateNotes = (id, notes) => {
    const updatedSongs = songs.map(song =>
      song.id === id ? { ...song, notes } : song
    );
    setSongs(updatedSongs);
  };

  const addSong = (song) => {
    if (!song.trackName) return;
    const alreadyExists = songs.some(
      s => s.title.toLowerCase() === song.trackName.toLowerCase() &&
           s.artist.toLowerCase() === song.artistName.toLowerCase()
    );
    if (alreadyExists) {
      setNotification('Song already in your list');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    setSongs([...songs, {
      id: Date.now(),
      title: song.trackName,
      artist: song.artistName,
      album: song.collectionName,
      genre: song.primaryGenreName,
      artwork: song.artworkUrl100,
      status: 'Not Started',
      difficulty: 'Medium',
      notes: '',
      dateAdded: new Date(),
      sections: [],
      structure: song.trackName.toLowerCase() === 'breed'
        ? ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Verse 3', 'Chorus 3', 'Outro']
        : ['Intro',],
      links: {
        spotify: `https://open.spotify.com/search/${encodeURIComponent(song.trackName + ' ' + song.artistName)}`,
        apple: `https://music.apple.com/us/search?term=${encodeURIComponent(song.trackName + ' ' + song.artistName)}`,
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(song.trackName + ' ' + song.artistName)}`
      }
    }]);
    setNotification('Added to Liked Songs');
    setActiveTab('Search');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {notification && (
        <div className={`mb-4 p-2 rounded text-center ${notification === 'Song already in your list' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
          {notification}
        </div>
      )}

      <nav className="mb-6 p-4 bg-gray-100 rounded">
        <ul className="flex justify-around">
          {['Home', 'Search', 'My Songs', 'Progress', 'Insights', 'Profile'].map(tab => (
            <li
              key={tab}
              className={`font-semibold cursor-pointer ${activeTab === tab ? 'text-blue-500' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </nav>

      {activeTab === 'Search' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Search Songs</h1>
          <div className="flex mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search iTunes"
              className="flex-grow p-2 border rounded"
            />
            <button onClick={() => {
              fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song`)
                .then(response => response.json())
                .then(data => {
                  if (data && Array.isArray(data.results)) {
                    setSearchResults(data.results);
                  } else {
                    setSearchResults([]);
                  }
                })
                .catch(err => {
                  console.error('Failed to fetch iTunes song data:', err);
                  setSearchResults([]);
                });
            }} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">
              Search
            </button>
          </div>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index} className="border-b py-2 flex justify-between items-center">
                <div className="flex items-center">
                  <img src={result.artworkUrl100} alt="album artwork" className="w-12 h-12 mr-2 rounded" />
                  {result.trackName} - {result.artistName}
                </div>
                <button onClick={() => addSong(result)} className="ml-2 px-2 py-1 bg-blue-500 text-white rounded">
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'My Songs' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by artist, genre, or title"
              className="flex-grow p-2 border rounded"
            />
            <select onChange={(e) => setSortOption(e.target.value)} value={sortOption} className="px-4 py-2 bg-gray-500 text-white rounded">
              <option>Recently Added</option>
              <option>Title</option>
              <option>Artist</option>
              <option>Album</option>
            </select>
            <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="px-4 py-2 border rounded">
              <option value="All">All Progress</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Mastered">Mastered</option>
            </select>
            <select onChange={(e) => setDifficultyFilter(e.target.value)} value={difficultyFilter} className="px-4 py-2 border rounded">
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <h2 className="text-xl font-semibold mb-4">My Songs</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {songs
              .filter(song => {
                const filterLower = filter.toLowerCase();
                const matchesText =
                  song.artist.toLowerCase().includes(filterLower) ||
                  song.genre.toLowerCase().includes(filterLower) ||
                  song.title.toLowerCase().includes(filterLower);
                const matchesStatus = statusFilter === 'All' || song.status === statusFilter;
                const matchesDifficulty = difficultyFilter === 'All' || song.difficulty === difficultyFilter;
                return matchesText && matchesStatus && matchesDifficulty;
              })
              .sort((a, b) => {
                switch (sortOption) {
                  case 'Title': return a.title.localeCompare(b.title);
                  case 'Artist': return a.artist.localeCompare(b.artist);
                  case 'Album': return a.album.localeCompare(b.album);
                  case 'Recently Added':
                  default: return b.dateAdded - a.dateAdded;
                }
              })
              .map(song => (
              <li key={song.id} id={`progress-${song.id}`} className="p-4 border rounded bg-white shadow flex items-center gap-4">
                <img src={song.artwork} alt="album artwork" className="w-16 h-16 rounded object-cover" />
                <div className="flex-grow">
                  <div className="font-semibold text-base cursor-pointer text-blue-600 hover:underline" onClick={() => {
  setActiveTab('Progress');
  setTimeout(() => {
    const el = document.getElementById(`progress-${song.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}}>{song.title}</div>
                  <div className="text-sm text-gray-600">{song.artist}</div>
                  <div className="text-xs text-gray-500">{song.album} | {song.genre}</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <h4 className="font-semibold text-xs text-gray-700">Status</h4>
                      <p className="text-xs text-gray-500">{song.status}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-gray-700">Difficulty</h4>
                      <p className="text-xs text-gray-500">{song.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <a href={song.links?.spotify} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" alt="Spotify" className="w-5 h-5" />
                    </a>
                    <a href={song.links?.apple} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Music" className="w-5 h-5" />
                    </a>
                    <a href={song.links?.youtube} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" alt="YouTube" className="w-10 h-5" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'Home' && (
  <div className="text-center mb-6">
    <h1 className="text-3xl font-bold">Welcome Back!</h1>
    <p className="text-gray-600">Start tracking your music progress or search for a new song to learn.</p>
  </div>
)}
{activeTab === 'Home' && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="md:col-span-1 space-y-4">
      <div className="bg-white p-4 rounded shadow min-h-[400px]">
        <h2 className="text-lg font-bold mb-2">Recent Activity</h2>
        <ul className="text-sm text-gray-600 space-y-2">
  {songs
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 5)
    .map(song => {
      const timeAgo = Math.floor((Date.now() - new Date(song.dateAdded)) / (1000 * 60 * 60 * 24));
      const timeLabel = timeAgo === 0 ? 'Today' : `${timeAgo} day${timeAgo > 1 ? 's' : ''} ago`;
      return (
        <li key={song.id} className="flex items-center gap-3 cursor-pointer" onClick={() => {
          setActiveTab('Progress');
          setTimeout(() => {
            const el = document.getElementById(`progress-${song.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}>
          <img src={song.artwork} alt="art" className="w-8 h-8 rounded object-cover" />
          <div className="flex-grow">
            <div className="font-medium text-sm truncate max-w-[120px]">{song.title}</div>
            <div className="text-xs text-gray-500 truncate">{song.artist}</div>
          </div>
          <div className="text-xs text-gray-400">{timeLabel}</div>
        </li>
      );
    })}
</ul>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded shadow">Add Song</button>
      <button className="w-full bg-gray-700 text-white py-2 rounded shadow">Continue Practice</button>
    </div>
    <div className="md:col-span-3 space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Milestones</h2>
        <p className="text-sm text-gray-600">Track your completed and current goals here.</p>
      </div>
      <div className="bg-white p-6 rounded shadow">
  <h2 className="text-xl font-bold mb-4">My Songs</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {[...songs].sort(() => 0.5 - Math.random()).slice(0, 6).map(song => (
      <div key={song.id} className="bg-gray-50 rounded shadow p-4">
        <img src={song.artwork} alt="cover" className="rounded w-full h-48 object-cover mb-2" />
        <div className="font-semibold text-sm truncate">{song.title}</div>
        <div className="text-xs text-gray-500 truncate">{song.artist}</div>
      </div>
    ))}
  </div>
</div>
  </div>
</div>
      )}
{activeTab === 'Progress' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by artist, genre, or title"
              className="flex-grow p-2 border rounded"
            />
            <select onChange={(e) => setSortOption(e.target.value)} value={sortOption} className="px-4 py-2 bg-gray-500 text-white rounded">
              <option>Recently Added</option>
              <option>Title</option>
              <option>Artist</option>
              <option>Album</option>
            </select>
            <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="px-4 py-2 border rounded">
              <option value="All">All Progress</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Mastered">Mastered</option>
            </select>
            <select onChange={(e) => setDifficultyFilter(e.target.value)} value={difficultyFilter} className="px-4 py-2 border rounded">
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          <ul className="space-y-4">
            {songs.map(song => (
              <li key={song.id} className="p-4 border rounded bg-white shadow flex items-center gap-4">
                <img src={song.artwork} alt="album artwork" className="w-16 h-16 rounded object-cover" />
                <div className="flex-grow">
                  <div className="font-semibold text-base">{song.title}</div>
                  <div className="text-sm text-gray-600">{song.artist}</div>
                  <div className="text-xs text-gray-500">{song.album} | {song.genre}</div>
                  <div className="mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
  {song.structure.map(section => (
    <label key={section} className="text-xs flex items-center gap-1">
      <input
        type="checkbox"
        checked={song.sections?.includes(section)}
        onChange={(e) => {
          const updatedSections = e.target.checked
            ? [...(song.sections || []), section]
            : (song.sections || []).filter(s => s !== section);
          setSongs(prev => prev.map(s => s.id === song.id ? { ...s, sections: updatedSections } : s));
        }}
      />
      {section}
    </label>
  ))}
</div>
<div className="mt-2 flex items-center gap-2">
  <input
    type="text"
    placeholder="Add section"
    className="text-xs p-1 border rounded w-2/3"
    onKeyDown={(e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        const newSection = e.target.value.trim();
        const updatedStructure = [...(song.structure || []), newSection];
        setSongs(prev => prev.map(s =>
          s.id === song.id ? { ...s, structure: updatedStructure } : s
        ));
        e.target.value = '';
      }
    }}
  />
  <button
    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
    onClick={() => {
      const updatedStructure = song.structure.slice(0, -1);
      setSongs(prev => prev.map(s =>
        s.id === song.id ? { ...s, structure: updatedStructure } : s
      ));
    }}
  >Remove Last</button>
</div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <a href={song.links?.spotify} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" alt="Spotify" className="w-5 h-5" />
                    </a>
                    <a href={song.links?.apple} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Music" className="w-5 h-5" />
                    </a>
                    <a href={song.links?.youtube} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" alt="YouTube" className="w-10 h-5" />
                    </a>
                  </div>
                </div>
                <div className="w-40 flex flex-col gap-2">
                  <select
                    value={song.status}
                    onChange={(e) => updateStatus(song.id, e.target.value)}
                    className={`text-xs p-1 border rounded ${
                      song.status === 'Not Started' ? 'bg-red-200' :
                      song.status === 'In Progress' ? 'bg-yellow-200' :
                      song.status === 'Mastered' ? 'bg-green-200' : ''
                    }`}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Mastered</option>
                  </select>
                  <select
                    value={song.difficulty}
                    onChange={(e) => {
                      const updatedSongs = songs.map(s =>
                        s.id === song.id ? { ...s, difficulty: e.target.value } : s
                      );
                      setSongs(updatedSongs);
                    }}
                    className="text-xs p-1 border rounded"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Expert</option>
                  </select>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        song.status === 'Not Started' ? 'bg-red-500 w-1/4' :
                        song.status === 'In Progress' ? 'bg-yellow-400 w-2/4' :
                        song.status === 'Mastered' ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                  <textarea
                    className="p-2 text-sm border rounded"
                    placeholder="Notes..."
                    value={song.notes || ''}
                    onChange={(e) => updateNotes(song.id, e.target.value)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SongTrackerApp;
