import axios from 'axios';
import type { GiphyResponse } from '../types/Gif';

class GifService {
  private readonly baseUrl = 'https://api.giphy.com/v1/gifs';
  
  private readonly apiKey = import.meta.env.VITE_GIPHY_API_KEY || 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';

  async searchGifs(query: string, limit = 20, offset = 0): Promise<GiphyResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          api_key: this.apiKey,
          q: query,
          limit,
          offset,
          rating: 'g',
          lang: 'en'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to search GIFs');
    }
  }

  async getTrendingGifs(limit = 20, offset = 0): Promise<GiphyResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/trending`, {
        params: {
          api_key: this.apiKey,
          limit,
          offset,
          rating: 'g'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch trending GIFs');
    }
  }
}

export const gifService = new GifService();
