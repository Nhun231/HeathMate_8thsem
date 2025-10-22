import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      // Connect to backend Socket.IO server
      this.socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join expert room
  joinExpertRoom(expertId) {
    if (this.socket) {
      this.socket.emit('join_expert_room', { expertId });
    }
  }

  // Join customer room
  joinCustomerRoom(customerId) {
    if (this.socket) {
      this.socket.emit('join_customer_room', { customerId });
    }
  }

  // Join user room (generic for both customer and expert)
  joinUserRoom(userId, userType = 'customer') {
    if (this.socket) {
      this.socket.emit('join_user_room', { userId, userType });
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  // Listen for new messages
  onMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Listen for user typing
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  // Listen for user stopped typing
  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }

  // Send typing indicator
  sendTyping(userId, roomId) {
    if (this.socket) {
      this.socket.emit('typing', { userId, roomId });
    }
  }

  // Send stop typing indicator
  sendStopTyping(userId, roomId) {
    if (this.socket) {
      this.socket.emit('stop_typing', { userId, roomId });
    }
  }

  // Listen for user online/offline status
  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on('user_status', callback);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
