import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Tooltip,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import socketService from '../../services/SocketService';
import chatService from '../../services/ChatService';
import { useAuth } from '../../context/AuthProvider';

const ExpertChat = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const connectionIntervalRef = useRef(null);

  // Get current user from auth context
  const { user: currentUser, loading: authLoading } = useAuth();

  // Debug log when component mounts
  useEffect(() => {
    console.log('🚀 ExpertChat component mounted');
    console.log('👤 Current user:', currentUser);
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat rooms
  const loadChatRooms = useCallback(async () => {
    try {
      const userType = currentUser?.role === 'Customer' ? 'Customer' : 'NutrientExpert';
      const response = await chatService.getChatRooms(userType);
      setChatRooms(response?.rooms || []);
    } catch (err) {
      console.error('❌ Error loading chat rooms:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
    }
  }, [currentUser?.role]);

  // Load available customers
  const loadAvailableCustomers = useCallback(async () => {
    try {
      const response = await chatService.getAvailableUsers();
      setCustomers(response?.users || []);
    } catch (err) {
      console.error('❌ Error loading available customers:', err);
      setError('Không thể tải danh sách khách hàng');
    }
  }, []);

  // Load messages for selected customer
  const loadMessages = async (roomId) => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(roomId, 1, 50);
      setMessages(response?.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when component mounts or user changes
  useEffect(() => {
    const loadInitialData = async () => {
      // Only load data if auth is not loading and we have a valid user
      if (!authLoading && currentUser && currentUser._id) {
        setLoading(true);
        try {
          await Promise.all([
            loadChatRooms(),
            loadAvailableCustomers()
          ]);
        } catch (err) {
          console.error('❌ Error loading initial data:', err);
          setError('Không thể tải dữ liệu ban đầu');
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !currentUser) {
        setError('Vui lòng đăng nhập để sử dụng tính năng chat');
      }
    };

    loadInitialData();
  }, [authLoading, currentUser?._id, currentUser?.role, loadChatRooms, loadAvailableCustomers]);

  // Initialize socket connection
  useEffect(() => {
    if (!authLoading && currentUser && currentUser._id) {
      console.log('🔌 Socket: Initializing connection for user:', currentUser._id);
      
      const socket = socketService.connect();
      
      // Set connection status immediately
      setIsConnected(socketService.getConnectionStatus());
      
      // Also listen for connection status changes
      const checkConnection = () => {
        const status = socketService.getConnectionStatus();
        console.log('🔌 Socket: Connection status check:', status);
        setIsConnected(status);
      };
      
      // Check connection status periodically
      connectionIntervalRef.current = setInterval(checkConnection, 1000);

      // Join expert room
      socketService.joinExpertRoom(currentUser._id);

      // Listen for messages
      socketService.onMessage((message) => {
        console.log('📨 Socket: Received message:', message.roomId, 'sender:', message.senderId, 'current user:', currentUser._id);
        
        // Only add message if it's not from current user (to avoid duplicates)
        if (message.senderId !== currentUser._id) {
          console.log('📨 Socket: Adding message from other user');
          
          // If we have a selected customer and this message is for that room, add it
          if (selectedCustomer && message.roomId === selectedCustomer.roomId) {
            console.log('📨 Socket: Adding to current chat room');
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          } else {
            console.log('📨 Socket: Message not for current room, but keeping for potential future display');
            // You could add logic here to show notification or update room list
          }
        } else {
          console.log('📨 Socket: Ignoring own message');
        }
      });

    // Listen for typing indicators
    socketService.onTyping((data) => {
      if (data.userId !== currentUser._id) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
        setIsTyping(true);
      }
    });

    socketService.onStopTyping((data) => {
      if (data.userId !== currentUser._id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
        setIsTyping(typingUsers.length > 1);
      }
    });

    // Listen for user status changes
    socketService.onUserStatus((data) => {
      setOnlineUsers(prev => {
        if (data.isOnline) {
          return [...prev.filter(id => id !== data.userId), data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    });
    }

    // Cleanup on unmount
    return () => {
      if (connectionIntervalRef.current) {
        clearInterval(connectionIntervalRef.current);
      }
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [authLoading, currentUser?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || !currentUser) return;

    // Use the roomId from selectedCustomer
    const roomId = selectedCustomer.roomId;
    
    const messageData = {
      roomId: roomId,
      receiverId: selectedCustomer._id,
      content: newMessage.trim(),
      messageType: 'text',
    };

    // Add message to local state immediately for better UX
    const tempMessage = {
      id: `temp_${Date.now()}`,
      ...messageData,
      senderId: currentUser._id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      // Always try socket first
      console.log('📤 Socket: Attempting to send message to room:', roomId);
      console.log('📤 Socket: Connection status:', isConnected);
      console.log('📤 Socket: Message data:', {
        roomId: roomId,
        senderId: currentUser._id,
        receiverId: selectedCustomer._id,
        content: newMessage.trim(),
        messageType: 'text',
      });
      
      socketService.sendMessage({
        roomId: roomId,
        senderId: currentUser._id,
        receiverId: selectedCustomer._id,
        content: newMessage.trim(),
        messageType: 'text',
      });

      // Stop typing indicator
      if (isConnected) {
        socketService.sendStopTyping(currentUser._id, selectedCustomer._id);
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Không thể gửi tin nhắn: ' + (err.response?.data?.message || err.message));
      // Remove the temp message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!selectedCustomer || !isConnected) return;

    // Send typing indicator
    socketService.sendTyping(currentUser._id, selectedCustomer._id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(currentUser._id, selectedCustomer._id);
    }, 1000);
  };

  // Handle customer selection
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setMessages([]);
    
    // Try to find existing room or create new one
    const existingRoom = (chatRooms || []).find(room => 
      room?.expertId?._id === currentUser._id && room?.customerId?._id === customer._id
    );
    
    if (existingRoom) {
      // Set the selected customer with the correct roomId
      const roomId = existingRoom.roomId;
      const customerWithRoomId = { ...customer, roomId: roomId };
      setSelectedCustomer(customerWithRoomId);
      
      // Join the room via socket
      if (isConnected) {
        console.log('🔌 Socket: Joining room:', roomId);
        socketService.joinRoom(roomId, currentUser._id);
      }
      
      await loadMessages(roomId);
    } else {
      // Create new room
      try {
        const response = await chatService.createChatRoom(customer._id);
        const newRoom = response.room;
        setChatRooms(prev => [...prev, newRoom]);
        
        // Set the selected customer with the correct roomId
        const customerWithRoomId = { ...customer, roomId: newRoom.roomId };
        setSelectedCustomer(customerWithRoomId);
        
        // Join the room via socket
        if (isConnected) {
          console.log('🔌 Socket: Joining new room:', newRoom.roomId);
          socketService.joinRoom(newRoom.roomId, currentUser._id);
        }
        
        await loadMessages(newRoom.roomId);
      } catch (err) {
        console.error('❌ Error creating chat room:', err);
        setError('Không thể tạo cuộc trò chuyện');
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (currentUser && currentUser._id) {
      setLoading(true);
      try {
        await Promise.all([
          loadChatRooms(),
          loadAvailableCustomers()
        ]);
      } catch (err) {
        console.error('❌ Error during manual refresh:', err);
        setError('Không thể làm mới dữ liệu');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
      <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            m: 2,
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            borderRadius: 3,
            border: '1px solid #e0e0e0',
          }}
      >
    <Box sx={{ height: '80vh', display: 'flex', bgcolor: '#f5f5f5' }}>
      {/* Sidebar - Customer List */}
      <Paper
        elevation={2}
        sx={{
          width: 350,
          height: '100%',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#4CAF50',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {currentUser?.fullname || 'Expert'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Nutrition Expert
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton 
                size="small" 
                onClick={handleRefresh}
                disabled={loading}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Test Socket Connection">
              <IconButton 
                size="small" 
                onClick={() => {
                  console.log('🧪 Testing socket connection...');
                  console.log('🧪 Socket service:', socketService);
                  console.log('🧪 Connection status:', socketService.getConnectionStatus());
                  console.log('🧪 Socket instance:', socketService.socket);
                  
                  // Force reconnect
                  console.log('🧪 Force reconnecting...');
                  socketService.disconnect();
                  setTimeout(() => {
                    const newSocket = socketService.connect();
                    console.log('🧪 New socket:', newSocket);
                    console.log('🧪 New connection status:', socketService.getConnectionStatus());
                  }, 1000);
                  
                  // Test sending a message
                  if (selectedCustomer) {
                    socketService.sendMessage({
                      roomId: selectedCustomer.roomId,
                      senderId: currentUser._id,
                      receiverId: selectedCustomer._id,
                      content: 'Test message from debug button',
                      messageType: 'text',
                    });
                  }
                }}
                sx={{ color: 'white' }}
              >
                <Typography variant="caption">TEST</Typography>
              </IconButton>
            </Tooltip>
            <Chip
              label={isConnected ? 'Online' : 'Offline'}
              color={isConnected ? 'success' : 'default'}
              size="small"
              icon={isConnected ? <OnlineIcon /> : <OfflineIcon />}
            />
          </Box>
        </Box>

        {/* Customer List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ p: 2, color: '#666', fontWeight: 'bold' }}>
            Khách hàng ({customers.length})
            {loading && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Typography>
          {authLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Đang tải thông tin người dùng...
                </Typography>
              </Box>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {customers.map((customer) => (
              <ListItem
                key={customer._id}
                button
                onClick={() => handleSelectCustomer(customer)}
                sx={{
                  bgcolor: selectedCustomer?._id === customer._id ? '#E8F5E9' : 'transparent',
                  '&:hover': { bgcolor: '#F1F8E9' },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      customer.isOnline ? (
                        <OnlineIcon sx={{ color: '#4CAF50', fontSize: 12 }} />
                      ) : null
                    }
                  >
                    <Avatar sx={{ bgcolor: '#4CAF50' }}>
                      {customer.fullname?.charAt(0) || customer.email?.charAt(0) || 'C'}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={customer.fullname || customer.email}
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                        {customer.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Available for consultation
                      </Typography>
                    </Box>
                  }
                />
                {customer.isOnline && (
                  <ListItemSecondaryAction>
                    <Chip label="Online" color="success" size="small" />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 0,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  selectedCustomer.isOnline ? (
                    <OnlineIcon sx={{ color: '#4CAF50', fontSize: 12 }} />
                  ) : null
                }
              >
                <Avatar sx={{ bgcolor: '#4CAF50' }}>
                  {selectedCustomer.fullname?.charAt(0) || selectedCustomer.email?.charAt(0) || 'C'}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedCustomer.fullname || selectedCustomer.email}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {selectedCustomer.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Paper>

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser?._id;
                return (
                  <Fade key={message.id} in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          maxWidth: '70%',
                          p: 2,
                          bgcolor: isOwnMessage ? '#4CAF50' : '#f0f0f0',
                          color: isOwnMessage ? 'white' : 'text.primary',
                          borderRadius: 3,
                          // Add chat bubble tail
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            width: 0,
                            height: 0,
                            border: '8px solid transparent',
                            ...(isOwnMessage ? {
                              right: '-16px',
                              borderLeftColor: '#4CAF50',
                              transform: 'translateY(-50%)',
                            } : {
                              left: '-16px',
                              borderRightColor: '#f0f0f0',
                              transform: 'translateY(-50%)',
                            }),
                          },
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: isOwnMessage ? 'right' : 'left',
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && typingUsers.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {selectedCustomer.fullname || selectedCustomer.email} đang nhập...
                  </Typography>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IconButton size="small">
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder={selectedCustomer ? "Nhập tin nhắn..." : "Chọn khách hàng để bắt đầu trò chuyện"}
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                disabled={!selectedCustomer}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton size="small" disabled={!selectedCustomer}>
                <EmojiIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !selectedCustomer}
                sx={{
                  bgcolor: '#4CAF50',
                  color: 'white',
                  '&:hover': { bgcolor: '#45a049' },
                  '&:disabled': { bgcolor: '#ccc' },
                }}
              >
                <SendIcon />
              </IconButton>
            </Paper>
          </>
        ) : authLoading ? (
          /* Auth Loading */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              bgcolor: '#fafafa',
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 'bold' }}>
              Đang tải thông tin người dùng...
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', textAlign: 'center' }}>
              Vui lòng đợi trong giây lát
            </Typography>
          </Box>
        ) : !currentUser ? (
          /* No User */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              bgcolor: '#fafafa',
            }}
          >
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#f44336' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ color: '#666', fontWeight: 'bold' }}>
              Chưa đăng nhập
            </Typography>
            <Typography variant="body1" sx={{ color: '#999', textAlign: 'center' }}>
              Vui lòng đăng nhập để sử dụng tính năng chat
            </Typography>
          </Box>
        ) : (
          /* No Customer Selected */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              bgcolor: '#fafafa',
            }}
          >
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#4CAF50' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ color: '#666', fontWeight: 'bold' }}>
              Chào mừng đến với Expert Chat
            </Typography>
            <Typography variant="body1" sx={{ color: '#999', textAlign: 'center' }}>
              Chọn một khách hàng từ danh sách bên trái để bắt đầu cuộc trò chuyện
            </Typography>
            <Chip
              label={isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
              color={isConnected ? 'success' : 'default'}
              icon={isConnected ? <OnlineIcon /> : <CircularProgress size={16} />}
            />
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
        >
          {error}
        </Alert>
      )}
    </Box>
      </Box>
  );
};

export default ExpertChat;
