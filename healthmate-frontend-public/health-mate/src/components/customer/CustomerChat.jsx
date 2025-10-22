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
  Videocam as VideoIcon,
  Phone as PhoneIcon,
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

const CustomerChat = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
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

  // Mock current user data (will be replaced with real auth data)
  const currentUser = {
    id: 'customer_1',
    name: 'Nguyễn Văn Customer',
    avatar: null,
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load available users (experts)
  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAvailableUsers();
      setAvailableUsers(response.users || []);
    } catch (err) {
      console.error('Error loading available users:', err);
      setError('Không thể tải danh sách chuyên gia');
    } finally {
      setLoading(false);
    }
  };

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      const response = await chatService.getChatRooms();
      setChatRooms(response.rooms || []);
    } catch (err) {
      console.error('Error loading chat rooms:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
    }
  };

  // Load messages for selected user
  const loadMessages = async (roomId) => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(roomId);
      setMessages(response.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();
    
    // Set connection status
    setIsConnected(socketService.getConnectionStatus());

    // Join customer room
    socketService.joinCustomerRoom(currentUser.id);

    // Listen for messages
    socketService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing indicators
    socketService.onTyping((data) => {
      if (data.userId !== currentUser.id) {
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
      if (data.userId !== currentUser.id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
        setIsTyping(typingUsers.length > 1);
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
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      roomId: selectedUser.roomId || `room_${currentUser.id}_${selectedUser.id}`,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      senderName: currentUser.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    try {
      // Save message to database
      await chatService.sendMessage(messageData);
      
      // Add message to local state immediately
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');

      // Send via socket
      socketService.sendMessage(messageData);

      // Stop typing indicator
      socketService.sendStopTyping(currentUser.id, selectedUser.id);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn');
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!selectedUser) return;

    // Send typing indicator
    socketService.sendTyping(currentUser.id, selectedUser.id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(currentUser.id, selectedUser.id);
    }, 1000);
  };

  // Handle user selection
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    
    // Try to find existing room or create new one
    const existingRoom = chatRooms.find(room => 
      room.participants.some(p => p.id === user.id)
    );
    
    if (existingRoom) {
      await loadMessages(existingRoom.id);
    } else {
      // Create new room
      try {
        const newRoom = await chatService.createChatRoom(user.id);
        setChatRooms(prev => [...prev, newRoom]);
        setSelectedUser({ ...user, roomId: newRoom.id });
      } catch (err) {
        console.error('Error creating chat room:', err);
        setError('Không thể tạo cuộc trò chuyện');
      }
    }
  };

  // Handle starting new chat
  const handleStartNewChat = async (user) => {
    try {
      const newRoom = await chatService.createChatRoom(user.id);
      setChatRooms(prev => [...prev, newRoom]);
      setSelectedUser({ ...user, roomId: newRoom.id });
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
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f5f5f5' }}>
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
            bgcolor: '#2196F3',
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
              {currentUser.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Khách hàng
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
            Cuộc trò chuyện ({chatRooms.length})
          </Typography>
          <List>
            {chatRooms.map((room) => {
              const otherUser = room.participants.find(p => p.id !== currentUser.id);
              return (
                <ListItem
                  key={room.id}
                  button
                  onClick={() => handleSelectUser({ ...otherUser, roomId: room.id })}
                  sx={{
                    bgcolor: selectedUser?.id === otherUser?.id ? '#E3F2FD' : 'transparent',
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
                      <Avatar sx={{ bgcolor: '#2196F3' }}>
                        {otherUser?.name?.charAt(0) || 'U'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={otherUser?.name || 'Unknown User'}
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
                <Tooltip title="Gọi video">
                  <IconButton size="small">
                    <VideoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gọi thoại">
                  <IconButton size="small">
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
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
              {loading && messages.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                messages.map((message) => (
                  <Fade key={message.id} in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.senderId === currentUser.id ? '#2196F3' : 'white',
                          color: message.senderId === currentUser.id ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: 'right',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Paper>
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
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton size="small">
                <EmojiIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                sx={{
                  bgcolor: '#2196F3',
                  color: 'white',
                  '&:hover': { bgcolor: '#1976D2' },
                  '&:disabled': { bgcolor: '#ccc' },
                }}
              >
                <SendIcon />
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
                  primary={user.name}
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
  );
};

export default CustomerChat;
