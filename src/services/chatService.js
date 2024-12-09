import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

class ChatService {
  
  

  async sendQuery(query) {
    try {
      const response = await axios.post(`${API_URL}/query`, { query });
      return response.data;
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();