import axios from '../api/axios';

// Chat Service for managing messages and chat rooms
class ChatService {
  // Get all chat rooms for current user
  async getChatRooms() {
    try {
      const response = await axios.get('/chat/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  // Get messages for a specific chat room
  async getMessages(roomId, page = 1, limit = 50) {
    try {
      const response = await axios.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(messageData) {
    try {
      const response = await axios.post('/chat/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create a new chat room
  async createChatRoom(participantId) {
    try {
      const response = await axios.post('/chat/rooms', {
        participantId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // Get available users to chat with (experts)
  async getAvailableUsers() {
    try {
      const response = await axios.get('/chat/available-users');
      return response.data;
    } catch (error) {
      console.error('Error fetching available users:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(roomId, messageIds) {
    try {
      const response = await axios.patch(`/chat/rooms/${roomId}/read`, {
        messageIds
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await axios.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await axios.delete(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Update message status
  async updateMessageStatus(messageId, status) {
    try {
      const response = await axios.patch(`/chat/messages/${messageId}`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
