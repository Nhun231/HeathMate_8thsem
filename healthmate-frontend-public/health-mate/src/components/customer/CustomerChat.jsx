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
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);

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
      setLoading(true);
      const response = await chatService.getAvailableUsers();
      setAvailableUsers(response?.users || []);
    } catch (err) {
      setError('Không thể tải danh sách chuyên gia');
      setAvailableUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      const userType = currentUser?.role === 'Customer' ? 'Customer' : 'NutritionExpert';
      const response = await chatService.getChatRooms(userType);
      setChatRooms(response?.rooms || []);
    } catch (err) {
      setError('Không thể tải danh sách cuộc trò chuyện');
      setChatRooms([]); // Set empty array on error
    }
  };

  // Load messages for selected user
  const loadMessages = async (roomId) => {
    try {
      console.log('📨 Loading messages for room:', roomId);
      setLoading(true);
      
      // Load existing messages from database
      const response = await chatService.getMessages(roomId);
      const loadedMessages = response?.messages || [];
      
      console.log('📨 Loaded', loadedMessages.length, 'messages from database');
      setMessages(loadedMessages);
      
      // Scroll to bottom to show latest messages
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Không thể tải tin nhắn');
      setMessages([]); // Only clear on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    // Only initialize if we have a valid user
    if (!currentUser || !currentUser._id) {
      return;
    }

    const socket = socketService.connect();
    setIsConnected(true);

    // Join customer room
    socketService.joinCustomerRoom(currentUser._id);

    // Listen for messages
    socketService.onMessage((message) => {
      console.log('📨 Socket: Customer received message:', message.roomId, 'sender:', message.senderId, 'current user:', currentUser._id);
      
      // Handle both object and string senderId formats
      const messageSenderId = typeof message.senderId === 'object' 
        ? message.senderId?._id 
        : message.senderId;
        
      console.log('📨 Socket: SenderId extracted:', messageSenderId, 'CurrentUser._id:', currentUser._id);
      console.log('📨 Socket: Are they equal?', messageSenderId === currentUser._id);
      console.log('📨 Socket: String comparison:', messageSenderId?.toString() === currentUser._id?.toString());
      
      // Add message to state, avoiding duplicates
      setMessages(prev => {
        // Check if message already exists (by id or timestamp + content)
        const exists = prev.some(msg => {
          const existingMsgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
          return msg.id === message.id || 
            (msg.timestamp === message.timestamp && 
             msg.content === message.content && 
             existingMsgSenderId === messageSenderId);
        });
        
        if (exists) {
          console.log('📨 Socket: Message already exists, skipping duplicate');
          return prev;
        }
        
        return [...prev, message];
      });
      
      scrollToBottom();
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
    console.log('🔍 Customer: handleSendMessage called');
    console.log('🔍 Customer: newMessage:', newMessage.trim());
    console.log('🔍 Customer: selectedUser:', selectedUser);
    console.log('🔍 Customer: currentUser:', currentUser);
    
    if (!newMessage.trim() || !selectedUser || !currentUser) {
      console.log('❌ Customer: Validation failed - cannot send message');
      return;
    }

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
      console.log('📤 Socket: Customer attempting to send message to room:', roomId);
      socketService.sendMessage({
        roomId: roomId,
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        content: newMessage.trim(),
        messageType: 'text',
      });

    } catch (err) {
      setError('Không thể gửi tin nhắn: ' + (err.response?.data?.message || err.message));
      // Remove the temp message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  // Handle message input
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
  };

  // Handle user selection
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    
    // Try to find existing room or create new one
    const existingRoom = (chatRooms || []).find(room => 
      room?.expertId?._id === user._id || room?.customerId?._id === user._id
    );
    
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
        setChatRooms(prev => [...prev, newRoom]);
        
        // Set the selected user with the correct roomId
        const userWithRoomId = { ...user, roomId: newRoom.roomId };
        setSelectedUser(userWithRoomId);
        
        // Join the room via socket
        if (isConnected) {
          socketService.joinRoom(newRoom.roomId, currentUser._id);
        }
        
        await loadMessages(newRoom.roomId);
      } catch (err) {
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
    user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <Avatar sx={{ bgcolor: '#4CAF50' }}>
                      {otherUser?.fullname?.charAt(0) || 'U'}
                    </Avatar>
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
              <Avatar sx={{ bgcolor: '#2196F3' }}>
                {selectedUser.fullname?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedUser.fullname}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Chuyên gia dinh dưỡng
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
                (messages || []).map((message) => {
                  // Handle both object and string senderId formats
                  const messageSenderId = typeof message.senderId === 'object' 
                    ? message.senderId?._id 
                    : message.senderId;
                  const isOwnMessage = messageSenderId?.toString() === currentUser?._id?.toString();
                  
                  console.log('🔍 Message display check:', {
                    messageSenderId,
                    currentUserId: currentUser?._id,
                    isOwnMessage,
                    messageContent: message.content
                  });
                  
                  return (
                  <Fade key={message.id || message._id} in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        mb: 2,
                        px: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            bgcolor: isOwnMessage ? '#4CAF50' : '#f5f5f5',
                            color: isOwnMessage ? 'white' : 'text.primary',
                            borderRadius: 4,
                            border: isOwnMessage ? 'none' : '1px solid #e0e0e0',
                            boxShadow: isOwnMessage 
                              ? '0 2px 8px rgba(76, 175, 80, 0.3)' 
                              : '0 2px 8px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            '&::before': isOwnMessage ? {
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
                );
                })
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
                key={user._id}
                button
                onClick={() => handleStartNewChat(user)}
                sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#2196F3' }}>
                    {user.fullname?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.fullname || 'Unknown User'}
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {user.roleId?.name || 'Chuyên gia dinh dưỡng'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  }
                />
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
