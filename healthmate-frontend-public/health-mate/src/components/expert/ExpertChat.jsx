import React, { useState, useEffect, useRef } from 'react';
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
  Videocam as VideoIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import socketService from '../../services/SocketService';

const ExpertChat = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Nguyễn Văn A', avatar: null, isOnline: true, lastMessage: 'Tôi cần tư vấn về chế độ ăn kiêng', lastMessageTime: '10:30 AM' },
    { id: '2', name: 'Trần Thị B', avatar: null, isOnline: false, lastMessage: 'Cảm ơn bạn đã tư vấn', lastMessageTime: '9:15 AM' },
    { id: '3', name: 'Lê Văn C', avatar: null, isOnline: true, lastMessage: 'Tôi muốn hỏi về protein', lastMessageTime: '11:45 AM' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mock expert data
  const expert = {
    id: 'expert_1',
    name: 'Dr. Nutrition Expert',
    avatar: null,
    specialty: 'Nutrition & Dietetics',
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();
    
    // Set connection status
    setIsConnected(socketService.getConnectionStatus());

    // Join expert room
    socketService.joinExpertRoom(expert.id);

    // Listen for messages
    socketService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing indicators
    socketService.onTyping((data) => {
      if (data.userId !== expert.id) {
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
      if (data.userId !== expert.id) {
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
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCustomer) return;

    const messageData = {
      id: Date.now().toString(),
      senderId: expert.id,
      receiverId: selectedCustomer.id,
      senderName: expert.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    // Send via socket
    socketService.sendMessage(messageData);

    // Stop typing indicator
    socketService.sendStopTyping(expert.id, selectedCustomer.id);
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!selectedCustomer) return;

    // Send typing indicator
    socketService.sendTyping(expert.id, selectedCustomer.id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(expert.id, selectedCustomer.id);
    }, 1000);
  };

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setMessages([]); // Clear messages for new conversation
    // In real app, you would load conversation history here
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f5f5f5' }}>
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
              {expert.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {expert.specialty}
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

        {/* Customer List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ p: 2, color: '#666', fontWeight: 'bold' }}>
            Khách hàng ({customers.length})
          </Typography>
          <List>
            {customers.map((customer) => (
              <ListItem
                key={customer.id}
                button
                onClick={() => handleSelectCustomer(customer)}
                sx={{
                  bgcolor: selectedCustomer?.id === customer.id ? '#E8F5E9' : 'transparent',
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
                      {customer.name.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={customer.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                        {customer.lastMessage}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {customer.lastMessageTime}
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
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedCustomer.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {selectedCustomer.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
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
              {messages.map((message) => (
                <Fade key={message.id} in={true} timeout={300}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.senderId === expert.id ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: message.senderId === expert.id ? '#4CAF50' : 'white',
                        color: message.senderId === expert.id ? 'white' : 'text.primary',
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
              ))}

              {/* Typing Indicator */}
              {isTyping && typingUsers.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {selectedCustomer.name} đang nhập...
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
  );
};

export default ExpertChat;
