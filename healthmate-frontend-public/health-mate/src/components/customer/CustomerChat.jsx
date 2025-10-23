import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import socketService from '../../services/SocketService';
import chatService from '../../services/ChatService';
import { useAuth } from '../../context/AuthProvider';

const CustomerChat = () => {
  // Get real user data from auth context
  const { user, loading: authLoading } = useAuth();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Current user data from auth
  const currentUser = user ? {
    _id: user._id,
    fullname: user.fullname,
    avatar: user.avatar || null,
    role: user.roleId?.name || 'Customer'
  } : null;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load available users (experts)
  const loadAvailableUsers = async () => {
    try {
      console.log('🔍 Loading available users...');
      setLoading(true);
      const response = await chatService.getAvailableUsers();
      console.log('📡 Available users response:', response);
      setAvailableUsers(response?.users || []);
      console.log('✅ Available users loaded:', response?.users || []);
    } catch (err) {
      console.error('❌ Error loading available users:', err);
      setError('Không thể tải danh sách chuyên gia');
      setAvailableUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      const userType = currentUser?.role === 'Customer' ? 'Customer' : 'NutrientExpert';
      console.log('🔍 Loading chat rooms for user type:', userType);
      const response = await chatService.getChatRooms(userType);
      console.log('📡 Chat rooms response:', response);
      setChatRooms(response?.rooms || []);
      console.log('✅ Chat rooms loaded:', response?.rooms || []);
    } catch (err) {
      console.error('❌ Error loading chat rooms:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
      setChatRooms([]); // Set empty array on error
    }
  };

  // Load messages for selected user
  const loadMessages = async (roomId) => {
    try {
      console.log('🔍 Loading messages for roomId:', roomId);
      setLoading(true);
      const response = await chatService.getMessages(roomId, 1, 50);
      console.log('📡 Messages response:', response);
      setMessages(response?.messages || []);
      console.log('✅ Messages loaded:', response?.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Không thể tải tin nhắn');
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    console.log('🚀 useEffect triggered with currentUser:', currentUser);
    // Only initialize if we have a valid user
    if (!currentUser || !currentUser._id) {
      console.log('❌ No valid user, skipping initialization');
      return;
    }

    console.log('✅ Valid user found, initializing...');
    socketService.connect();
    
    // Set connection status
    setIsConnected(socketService.getConnectionStatus());

    // Join customer room
    socketService.joinCustomerRoom(currentUser._id);

    // Listen for messages
    socketService.onMessage((message) => {
      console.log('📨 Socket: Customer received message:', message.roomId, 'sender:', message.senderId, 'current user:', currentUser._id);
      
      // Only add message if it's not from current user (to avoid duplicates)
      if (message.senderId !== currentUser._id) {
        console.log('📨 Socket: Adding message from other user');
        
        // If we have a selected user and this message is for that room, add it
        if (selectedUser && message.roomId === selectedUser.roomId) {
          console.log('📨 Socket: Adding to current chat room');
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        } else {
          console.log('📨 Socket: Message not for current room, but keeping for potential future display');
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
        setTypingUsers(prev => {
          const filtered = prev.filter(id => id !== data.userId);
          setIsTyping(filtered.length > 0);
          return filtered;
        });
      }
    });

    // Load initial data
    loadAvailableUsers();
    loadChatRooms();

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [currentUser?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    // Use the roomId from selectedUser
    const roomId = selectedUser.roomId;
    
    const messageData = {
      roomId: roomId,
      receiverId: selectedUser._id,
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
      console.log('📤 Socket: Customer attempting to send message to room:', roomId);
      console.log('📤 Socket: Connection status:', isConnected);
      
      socketService.sendMessage({
        roomId: roomId,
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        content: newMessage.trim(),
        messageType: 'text',
      });

      // Stop typing indicator
      if (isConnected) {
        socketService.sendStopTyping(currentUser._id, selectedUser._id);
      }
    } catch (err) {
      setError('Không thể gửi tin nhắn: ' + (err.response?.data?.message || err.message));
      // Remove the temp message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    console.log('⌨️ Typing detected:', e.target.value);
    setNewMessage(e.target.value);

    if (!selectedUser || !currentUser) {
      console.log('❌ No selectedUser or currentUser, skipping typing indicator');
      return;
    }

    // Send typing indicator only if connected
    if (isConnected) {
      socketService.sendTyping(currentUser._id, selectedUser._id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (currentUser && selectedUser && isConnected) {
        socketService.sendStopTyping(currentUser._id, selectedUser._id);
      }
    }, 1000);
  };

  // Handle user selection
  const handleSelectUser = async (user) => {
    console.log('👤 User selected:', user);
    setSelectedUser(user);
    setMessages([]);
    
    // Try to find existing room or create new one
    const existingRoom = (chatRooms || []).find(room => 
      room?.expertId?._id === user._id || room?.customerId?._id === user._id
    );
    
    console.log('🔍 All chat rooms:', chatRooms);
    console.log('🔍 Looking for user._id:', user._id);
    console.log('🔍 Existing room found:', existingRoom);
    console.log('🔍 RoomId from existing room:', existingRoom?.roomId);
    
    if (existingRoom) {
      // Set the selected user with the correct roomId
      const roomId = existingRoom.roomId;
      const userWithRoomId = { ...user, roomId: roomId };
      setSelectedUser(userWithRoomId);
      
      // Join the room via socket
      if (isConnected) {
        console.log('🔌 Socket: Customer joining room:', roomId);
        socketService.joinRoom(roomId, currentUser._id);
      }
      
      await loadMessages(roomId);
    } else {
      // Create new room
      try {
        const response = await chatService.createChatRoom(user._id);
        const newRoom = response.room;
        console.log('✅ New room created:', newRoom);
        setChatRooms(prev => [...prev, newRoom]);
        
        // Set the selected user with the correct roomId
        const userWithRoomId = { ...user, roomId: newRoom.roomId };
        setSelectedUser(userWithRoomId);
        
        // Join the room via socket
        if (isConnected) {
          console.log('🔌 Socket: Customer joining new room:', newRoom.roomId);
          socketService.joinRoom(newRoom.roomId, currentUser._id);
        }
        
        await loadMessages(newRoom.roomId);
      } catch (err) {
        console.error('❌ Error creating chat room:', err);
        setError('Không thể tạo cuộc trò chuyện');
      }
    }
  };

  // Handle starting new chat
  const handleStartNewChat = async (user) => {
    try {
      const response = await chatService.createChatRoom(user._id);
      const newRoom = response.room;
      setChatRooms(prev => [...prev, newRoom]);
      setSelectedUser({ ...user, roomId: newRoom.roomId });
      setShowUserDialog(false);
      setMessages([]);
    } catch (err) {
      console.error('Error starting new chat:', err);
      setError('Không thể bắt đầu cuộc trò chuyện');
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter users based on search
  const filteredUsers = (availableUsers || []).filter(user =>
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if user is not authenticated
  if (!user || !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">
          Bạn cần đăng nhập để sử dụng tính năng chat
        </Alert>
      </Box>
    );
  }

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
      {/* Sidebar - Chat Rooms & Available Users */}
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
              {currentUser.fullname}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {currentUser.role === 'Customer' ? 'Khách hàng' : currentUser.role}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={isConnected ? 'Online' : 'Offline'}
              color={isConnected ? 'success' : 'default'}
              size="small"
              icon={isConnected ? <OnlineIcon /> : <OfflineIcon />}
            />
          </Box>
        </Box>

        {/* Search and New Chat Button */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />
              }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setShowUserDialog(true)}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              Mới
            </Button>
          </Box>
        </Box>

        {/* Chat Rooms List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ p: 2, color: '#666', fontWeight: 'bold' }}>
            Cuộc trò chuyện ({(chatRooms || []).length})
          </Typography>
          <List>
            {(chatRooms || []).map((room) => {
              // Get the other user (expert if current user is customer, customer if current user is expert)
              const otherUser = currentUser?.role === 'Customer' 
                ? room?.expertId 
                : room?.customerId;
              return (
                <ListItem
                  key={room.roomId}
                  button
                  onClick={() => handleSelectUser({ ...otherUser, roomId: room.roomId })}
                  sx={{
                    bgcolor: selectedUser?._id === otherUser?._id ? '#E8F5E8' : 'transparent',
                    '&:hover': { bgcolor: '#F5F5F5' },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        otherUser?.isOnline ? (
                          <OnlineIcon sx={{ color: '#4CAF50', fontSize: 12 }} />
                        ) : null
                      }
                    >
                      <Avatar sx={{ bgcolor: '#4CAF50' }}>
                        {otherUser?.fullname?.charAt(0) || 'U'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={otherUser?.fullname || 'Unknown User'}
                    secondary={
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                          {room.lastMessage || 'Chưa có tin nhắn'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {room.lastMessageTime ? formatTime(room.lastMessageTime) : ''}
                        </Typography>
                      </Box>
                    }
                  />
                  {room.unreadCount > 0 && (
                    <ListItemSecondaryAction>
                      <Badge badgeContent={room.unreadCount} color="error">
                        <ChatIcon />
                      </Badge>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Paper>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
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
                  selectedUser.isOnline ? (
                    <OnlineIcon sx={{ color: '#4CAF50', fontSize: 12 }} />
                  ) : null
                }
              >
                <Avatar sx={{ bgcolor: '#2196F3' }}>
                  {selectedUser.name?.charAt(0) || 'U'}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {selectedUser.specialty || 'Chuyên gia dinh dưỡng'}
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
                bgcolor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              {loading && (messages || []).length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (messages || []).length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mt: 8,
                  gap: 2 
                }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: '#e0e0e0' }}>
                    <ChatIcon sx={{ fontSize: 30, color: '#999' }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ color: '#666', textAlign: 'center' }}>
                    Chưa có tin nhắn nào
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', textAlign: 'center' }}>
                    Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
                  </Typography>
                </Box>
              ) : (
                (messages || []).map((message) => (
                  <Fade key={message.id || message._id} in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.senderId === currentUser?._id ? 'flex-end' : 'flex-start',
                        mb: 2,
                        px: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.senderId === currentUser?._id ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            bgcolor: message.senderId === currentUser?._id ? '#4CAF50' : '#f5f5f5',
                            color: message.senderId === currentUser?._id ? 'white' : 'text.primary',
                            borderRadius: 4,
                            border: message.senderId === currentUser?._id ? 'none' : '1px solid #e0e0e0',
                            boxShadow: message.senderId === currentUser?._id 
                              ? '0 2px 8px rgba(76, 175, 80, 0.3)' 
                              : '0 2px 8px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            '&::before': message.senderId === currentUser?._id ? {
                              content: '""',
                              position: 'absolute',
                              right: -8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 0,
                              height: 0,
                              borderLeft: '8px solid #4CAF50',
                              borderTop: '8px solid transparent',
                              borderBottom: '8px solid transparent',
                            } : {
                              content: '""',
                              position: 'absolute',
                              left: -8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 0,
                              height: 0,
                              borderRight: '8px solid #f5f5f5',
                              borderTop: '8px solid transparent',
                              borderBottom: '8px solid transparent',
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                            {message.content}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            px: 1,
                            opacity: 0.6,
                            fontSize: '0.75rem',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && typingUsers.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {selectedUser.name} đang nhập...
                  </Typography>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
                bgcolor: 'white',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <IconButton 
                size="small"
                sx={{ 
                  color: '#666',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                disabled={!selectedUser}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 6,
                    bgcolor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      border: '1px solid #4CAF50',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #4CAF50',
                      bgcolor: 'white',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.5,
                    px: 2,
                  },
                }}
              />
              <IconButton 
                size="small"
                sx={{ 
                  color: '#666',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <EmojiIcon />
              </IconButton>
              <IconButton
                size="medium"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !selectedUser}
                sx={{
                  bgcolor: newMessage.trim() && selectedUser ? '#4CAF50' : '#ccc',
                  color: 'white',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  '&:hover': { 
                    bgcolor: newMessage.trim() && selectedUser ? '#45a049' : '#ccc',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': { 
                    bgcolor: '#ccc',
                    transform: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Paper>
          </>
        ) : (
          /* No User Selected */
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
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#2196F3' }}>
              <ChatIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ color: '#666', fontWeight: 'bold' }}>
              Chào mừng đến với Chat Support
            </Typography>
            <Typography variant="body1" sx={{ color: '#999', textAlign: 'center' }}>
              Chọn một chuyên gia từ danh sách bên trái để bắt đầu cuộc trò chuyện
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowUserDialog(true)}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              Bắt đầu cuộc trò chuyện mới
            </Button>
            <Chip
              label={isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
              color={isConnected ? 'success' : 'default'}
              icon={isConnected ? <OnlineIcon /> : <CircularProgress size={16} />}
            />
          </Box>
        )}
      </Box>

      {/* Available Users Dialog */}
      <Dialog open={showUserDialog} onClose={() => setShowUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chọn chuyên gia để trò chuyện</DialogTitle>
        <DialogContent>
          <List>
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleStartNewChat(user)}
                sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#2196F3' }}>
                    {user.name?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name || 'Unknown User'}
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {user.specialty || 'Chuyên gia dinh dưỡng'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {user.experience ? `${user.experience} năm kinh nghiệm` : ''}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={user.isOnline ? 'Online' : 'Offline'}
                    color={user.isOnline ? 'success' : 'default'}
                    size="small"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

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

export default CustomerChat;
