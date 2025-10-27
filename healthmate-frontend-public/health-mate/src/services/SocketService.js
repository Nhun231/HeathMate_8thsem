import { io } from 'socket.io-client';
const BASE_API = import.meta.env.VITE_API_BASE_URL
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
      if (!this.socket) {
        // Connect to backend Socket.IO server with namespace in URL
        const backendUrl = `${BASE_API}/chat`;
        
        this.socket = io(backendUrl, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
        });

      this.socket.on('connect', () => {
        this.isConnected = true;
        
        // Test connection immediately after connecting
        this.socket.emit('test_connection', { 
          message: 'Test from frontend',
          timestamp: new Date().toISOString()
        });
      });

      // Listen for server connection confirmation
      this.socket.on('connection_confirmed', (data) => {
        // Connection confirmed
      });

      // Listen for test connection response
      this.socket.on('test_response', (data) => {
        // Test response received
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      this.socket.on('message_error', (error) => {
        console.error('Message error:', error);
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

  // Join specific chat room
  joinRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, userId });
    } else {
      console.error('🔌 Socket: Cannot join room - not connected');
    }
  }

  // Leave specific chat room
  leaveRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId, userId });
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', messageData);
    } else {
      console.error('Socket not connected, cannot send message');
    }
  }

  // Listen for new messages
  onMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', (message) => {
        callback(message);
      });
      
      // Also listen for any other message events
      this.socket.on('message', (message) => {
        callback(message);
      });
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
    const status = this.isConnected && this.socket && this.socket.connected;
    console.log('🔌 Socket: Connection status check:', {
      isConnected: this.isConnected,
      socketExists: !!this.socket,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      finalStatus: status
    });
    return status;
  }

  // Debug method to check socket state
  debugSocketState() {
    console.log('🔍 Socket Debug State:', {
      socket: this.socket,
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      socketReadyState: this.socket?.readyState,
      socketTransport: this.socket?.io?.engine?.transport?.name,
      socketUrl: this.socket?.io?.uri,
      socketNamespace: this.socket?.nsp?.name
    });
  }

  // Test connection to backend
  testConnection() {
    if (this.socket) {
      console.log('🧪 Socket: Testing connection to backend...');
      this.socket.emit('test_connection', {
        message: 'Hello from frontend',
        timestamp: new Date().toISOString()
      });
      
      // Listen for test response
      this.socket.once('test_response', (data) => {
        console.log('🧪 Socket: Received test response from backend:', data);
      });
    } else {
      console.error('🧪 Socket: Cannot test - not connected');
    }
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
