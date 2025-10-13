// hooks/useContentManager.js
import { useState, useEffect, useCallback } from 'react';
import { BASE_URL, API_KEY } from '../config';

export const useContentManager = (storagePrefix, contentType, initialEndpoint = 'popular') => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentEndpoint, setCurrentEndpoint] = useState(initialEndpoint);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Parse complex endpoints to extract filters
  const parseEndpoint = (endpoint) => {
    const filters = {};
    
    if (endpoint.includes('country-') && endpoint.includes('genre-')) {
      const countryMatch = endpoint.match(/country-([A-Z]{2})/);
      const genreMatch = endpoint.match(/genre-(\d+)/);
      if (countryMatch) filters.country = countryMatch[1];
      if (genreMatch) filters.genre = genreMatch[1];
    } else if (endpoint.startsWith('country-')) {
      const countryMatch = endpoint.match(/country-([A-Z]{2})/);
      if (countryMatch) filters.country = countryMatch[1];
    } else if (endpoint.startsWith('genre-')) {
      const genreMatch = endpoint.match(/genre-(\d+)/);
      if (genreMatch) filters.genre = genreMatch[1];
    }
    
    return filters;
  };

  // Fetch content with full filter support
  const fetchContent = async (endpoint = 'popular', page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      let url;
      const filters = parseEndpoint(endpoint);
      
      // Handle anime TV series endpoints
      if (endpoint === 'anime') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
      } 
      else if (endpoint === 'anime-top_rated') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
      }
      else if (endpoint === 'anime-airing_today') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&air_date.gte=${new Date().toISOString().split('T')[0]}&air_date.lte=${new Date().toISOString().split('T')[0]}&page=${page}`;
      }
      else if (endpoint === 'anime-on_the_air') {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&with_status=0&sort_by=popularity.desc&page=${page}`;
      }
      // Handle anime movie endpoints
      else if (endpoint === 'anime-movie-popular') {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
      }
      else if (endpoint === 'anime-movie-top_rated') {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
      }
      else if (endpoint === 'anime-movie-upcoming') {
        const today = new Date().toISOString().split('T')[0];
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&primary_release_date.gte=${today}&sort_by=popularity.desc&page=${page}`;
      }
      else if (endpoint === 'anime-movie-now_playing') {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=16&with_origin_country=JP&with_original_language=ja&primary_release_date.gte=${thirtyDaysAgo.toISOString().split('T')[0]}&primary_release_date.lte=${thirtyDaysFromNow.toISOString().split('T')[0]}&sort_by=popularity.desc&page=${page}`;
      }
      // Handle combined country + genre filtering
      else if (filters.country && filters.genre) {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_origin_country=${filters.country}&with_genres=${filters.genre}&page=${page}&sort_by=popularity.desc`;
      }
      // Handle genre filtering
      else if (filters.genre) {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_genres=${filters.genre}&page=${page}&sort_by=popularity.desc`;
      } 
      // Handle country filtering
      else if (filters.country) {
        url = `${BASE_URL}/discover/${contentType}?api_key=${API_KEY}&language=en-US&with_origin_country=${filters.country}&page=${page}&sort_by=popularity.desc`;
      } 
      // Handle default endpoints
      else {
        url = `${BASE_URL}/${contentType}/${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`;
      }
      
      console.log('Fetching URL:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key error. Please check the configuration.');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setItems(data.results || []);
      } else {
        setItems(prevItems => [...prevItems, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
      setHasMore(page < (data.total_pages || 1));
      
      if (reset) {
        setCurrentEndpoint(endpoint);
      }

      console.log(`Page ${page} loaded. Total pages: ${data.total_pages}, Has more: ${page < (data.total_pages || 1)}`); // Debug
    } catch (err) {
      setError(`Failed to load content: ${err.message}`);
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search content with genre and country filters
  const searchContent = async (query, genreFilter = null, countryFilter = null, page = 1, reset = true) => {
    if (!query.trim()) {
      fetchContent('popular');
      return;
    }

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      let url = `${BASE_URL}/search/${contentType}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`;
      
      // Add genre filter if provided
      if (genreFilter?.id) {
        url += `&with_genres=${genreFilter.id}`;
      }
      
      // Add country filter if provided
      if (countryFilter?.iso_3166_1) {
        url += `&with_origin_country=${countryFilter.iso_3166_1}`;
      }

      console.log('Search URL:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setItems(data.results || []);
      } else {
        setItems(prevItems => [...prevItems, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
      setHasMore(page < (data.total_pages || 1));
      
      if (reset) {
        setCurrentEndpoint('search');
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error('Error searching content:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more content
  const loadMoreContent = useCallback(() => {
    if (!hasMore || loadingMore) return;
    
    const nextPage = currentPage + 1;
    
    if (currentEndpoint === 'search' && searchTerm) {
      searchContent(searchTerm, selectedGenre, selectedCountry, nextPage, false);
    } else {
      fetchContent(currentEndpoint, nextPage, false);
    }
  }, [currentPage, hasMore, loadingMore, currentEndpoint, searchTerm, selectedGenre, selectedCountry]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMoreContent();
    }
  }, [loadMoreContent]);

  // Handle item click
  const handleItemClick = (itemId, navigate) => {
    navigate(`/${contentType}/${itemId}`);
  };

  // Initial load
  useEffect(() => {
    fetchContent(initialEndpoint);
  }, []);

  return {
    items,
    loading,
    loadingMore,
    error,
    searchTerm,
    currentPage,
    totalPages,
    currentEndpoint,
    hasMore,
    selectedGenre,
    selectedCountry,
    setSearchTerm,
    setSelectedGenre,
    setSelectedCountry,
    fetchContent,
    searchContent,
    loadMoreContent,
    handleScroll,
    handleItemClick
  };
};