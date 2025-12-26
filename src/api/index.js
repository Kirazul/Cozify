const BASE_URL = '/api';

const cache = new Map();

async function fetchAPI(endpoint, useCache = false) {
  const cacheKey = endpoint;
  
  if (useCache && cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    
    if (useCache) {
      cache.set(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  search: (query, page = 1) => fetchAPI(`/search/${encodeURIComponent(query)}?page=${page}`),
  
  searchSuggestions: (query) => fetchAPI(`/search-suggestions/${encodeURIComponent(query)}`),
  
  getAnimeInfo: (id) => fetchAPI(`/info/${id}`, true),
  
  getEpisodeSources: (episodeId, type = 'sub', server = 'vidcloud') => 
    fetchAPI(`/watch?episodeId=${encodeURIComponent(episodeId)}&type=${type}&server=${server}`),
  
  getRecentEpisodes: (page = 1) => fetchAPI(`/recent-episodes?page=${page}`),
  
  getTopAiring: () => fetchAPI(`/top-airing`, true),
  
  getSpotlight: () => fetchAPI(`/spotlight`, true),
  
  getGenreList: () => fetchAPI(`/genre/list`, true),
  
  getByGenre: (genre, page = 1) => fetchAPI(`/genre/${genre}?page=${page}`),
  
  getByStudio: (studio, page = 1) => fetchAPI(`/studio/${studio}?page=${page}`),
  
  getSchedule: (date) => fetchAPI(`/schedule/${date}`)
};

export default api;
