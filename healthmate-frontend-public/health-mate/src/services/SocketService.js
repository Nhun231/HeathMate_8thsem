import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
      if (!this.socket) {
        // Connect to backend Socket.IO server
        // Backend has /v1 prefix for REST APIs, but socket runs on root with /chat namespace
        const backendUrl = 'http://localhost:9999';
        console.log('🔌 Socket: Connecting to:', backendUrl);
        
        this.socket = io(backendUrl, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
          namespace: '/chat'
        });

      this.socket.on('connect', () => {
        console.log('🔌 Socket: Connected to server');
        console.log('🔌 Socket: Socket ID:', this.socket.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket: Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Socket: Connection error:', error);
        console.error('🔌 Socket: Error details:', error.message);
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('🔌 Socket: Socket error:', error);
      });

      this.socket.on('message_error', (error) => {
        console.error('📤 Socket: Message error from server:', error);
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
      console.log('🔌 Socket: Joining room:', roomId, 'for user:', userId);
      console.log('🔌 Socket: Socket connected:', this.socket.connected);
      console.log('🔌 Socket: Socket ID:', this.socket.id);
      this.socket.emit('join_room', { roomId, userId });
    } else {
      console.error('🔌 Socket: Cannot join room - not connected');
    }
  }

  // Leave specific chat room
  leaveRoom(roomId, userId) {
    if (this.socket) {
      console.log('🚪 Leaving room:', roomId, 'for user:', userId);
      this.socket.emit('leave_room', { roomId, userId });
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket) {
      console.log('📤 Socket: Sending message:', messageData);
      console.log('📤 Socket: Socket connected:', this.socket.connected);
      console.log('📤 Socket: Socket ID:', this.socket.id);
      this.socket.emit('send_message', messageData);
    } else {
      console.error('📤 Socket: Not connected, cannot send message');
    }
  }

  // Listen for new messages
  onMessage(callback) {
    if (this.socket) {
      console.log('📨 Socket: Setting up message listener');
      this.socket.on('new_message', (message) => {
        console.log('📨 Socket: Received message from server:', message);
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
    console.log('🔌 Socket: Getting connection status:', this.isConnected);
    console.log('🔌 Socket: Socket instance:', this.socket);
    if (this.socket) {
      console.log('🔌 Socket: Socket connected:', this.socket.connected);
      console.log('🔌 Socket: Socket ID:', this.socket.id);
    }
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
