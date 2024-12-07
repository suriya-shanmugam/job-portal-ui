import axios from 'axios';

class ChatService {
  constructor() {
    this.baseURL = 'http://localhost:5000';
  }

  async sendQuery(query) {
    try {
      const response = await axios.post(`${this.baseURL}/query`, { query });
      return response.data;
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();