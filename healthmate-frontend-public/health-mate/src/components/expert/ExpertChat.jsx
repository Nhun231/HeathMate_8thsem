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
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import socketService from '../../services/SocketService';
import chatService from '../../services/ChatService';
import { useAuth } from '../../context/AuthProvider';
import {useNavigate} from "react-router-dom";

const ExpertChat = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedCustomerRef = useRef(null);
  // Get current user from auth context
  const { user: currentUser, loading: authLoading } = useAuth();

  // Keep ref in sync with state
  useEffect(() => {
    selectedCustomerRef.current = selectedCustomer;
  }, [selectedCustomer]);


  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Load chat rooms
  const loadChatRooms = useCallback(async () => {
    try {
      const userType = currentUser?.role === 'Customer' ? 'Customer' : 'NutritionExpert';
      const response = await chatService.getChatRooms(userType);
      const rooms = response?.rooms || [];
      // Sort by lastMessageAt (newest first)
      const sortedRooms = rooms.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
      setChatRooms(sortedRooms);
    } catch (err) {
      setError('Không thể tải danh sách cuộc trò chuyện');
    }
  }, [currentUser?.role]);

  // Update chat room when a new message is received
  const updateChatRoomOnMessage = useCallback((message) => {
    setChatRooms(prev => {
      const roomIndex = prev.findIndex(room => room.roomId === message.roomId);
      
      if (roomIndex >= 0) {
        // Update the room with new message info
        const updatedRooms = [...prev];
        updatedRooms[roomIndex] = {
          ...updatedRooms[roomIndex],
          lastMessage: message.content,
          lastMessageAt: message.timestamp,
        };
        
        // Move updated room to top and sort by lastMessageAt
        const updatedRoom = updatedRooms[roomIndex];
        const otherRooms = updatedRooms.filter((_, idx) => idx !== roomIndex);
        
        // Sort all rooms by lastMessageAt (newest first)
        const allRooms = [updatedRoom, ...otherRooms].sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });
        
        return allRooms;
      }
      
      return prev;
    });
  }, []);

  // Load messages for selected customer
  const loadMessages = async (roomId) => {
    try {
      setLoading(true);
      
      // Load existing messages from database
      const response = await chatService.getMessages(roomId);
      const loadedMessages = response?.messages || [];
      
      setMessages(loadedMessages);
      
      // Scroll to bottom to show latest messages
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      setError('Không thể tải tin nhắn');
      setMessages([]); // Only clear on error
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
          await loadChatRooms();
        } catch (err) {
          setError('Không thể tải dữ liệu ban đầu');
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !currentUser) {
        setError('Vui lòng đăng nhập để sử dụng tính năng chat');
      }
    };

    loadInitialData();
  }, [authLoading, currentUser?._id, currentUser?.role, loadChatRooms]);

  // Initialize socket connection and message handler
  useEffect(() => {
    if (!authLoading && currentUser && currentUser._id) {
      const socket = socketService.connect();
      setIsConnected(true);

      // Join expert room
      socketService.joinExpertRoom(currentUser._id);

      // Create message handler function that has access to latest state
      const handleIncomingMessage = (message) => {
        // Update chat rooms list with new message info
        updateChatRoomOnMessage(message);
        
        // Get current selected customer from ref (always up-to-date)
        const currentSelectedCustomer = selectedCustomerRef.current;
        
        // Normalize roomId for comparison (convert to string and trim)
        const messageRoomId = String(message.roomId || '').trim();
        const selectedRoomId = currentSelectedCustomer ? String(currentSelectedCustomer.roomId || '').trim() : '';
        
        // Only add message if it's for the currently selected room
        if (currentSelectedCustomer && messageRoomId && messageRoomId === selectedRoomId) {
          // Use functional update to ensure we have latest state
          setMessages(prev => {
            // Create a deep copy to ensure React detects the change
            const currentMessages = [...prev];
            
            // Check if this is updating a temp message (same content and recent timestamp)
            const tempMessageIndex = currentMessages.findIndex(msg => 
              msg.id?.startsWith('temp_') && 
              msg.content === message.content &&
              String(msg.senderId) === String(message.senderId)
            );
            
            if (tempMessageIndex >= 0) {
              // Replace temp message with real one - create new array
              const updated = [...currentMessages];
              updated[tempMessageIndex] = { ...message }; // Create new object reference
              return updated;
            }
            
            // Check if message already exists (by actual ID)
            const existingMessage = currentMessages.find(msg => 
              (msg.id && msg.id === message.id) || 
              (msg._id && msg._id === message._id)
            );
            
            if (existingMessage) {
              return currentMessages; // Return same array reference if no change
            }
            
            // Check if duplicate by content + timestamp + sender (within 1 second)
            const recentDuplicate = currentMessages.find(msg => {
              const timeDiff = Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime());
              return timeDiff < 1000 && 
                     msg.content === message.content && 
                     String(msg.senderId) === String(message.senderId);
            });
            
            if (recentDuplicate) {
              return currentMessages;
            }
            
            // Add new message - create completely new array with new message object
            const newMessageObj = {
              id: message.id || message._id || `msg_${Date.now()}_${Math.random()}`,
              _id: message._id || message.id,
              roomId: message.roomId,
              senderId: message.senderId,
              receiverId: message.receiverId,
              content: message.content,
              messageType: message.messageType || 'text',
              timestamp: message.timestamp,
              isRead: message.isRead || false
            };
            
            return [...currentMessages, newMessageObj];
          });
          
          // Force scroll after state update with multiple attempts
          setTimeout(() => scrollToBottom(), 50);
          setTimeout(() => scrollToBottom(), 150);
          setTimeout(() => scrollToBottom(), 300);
        }
      };

      // Register the message handler
      socketService.onMessage(handleIncomingMessage);
      
      // Return cleanup function
      return () => {
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    }
  }, [authLoading, currentUser?._id, updateChatRoomOnMessage]);

  // Scroll to bottom when messages change - use messages.length as dependency to ensure updates
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToBottom();
        // Also try after a short delay
        setTimeout(() => scrollToBottom(), 100);
      });
    }
  }, [messages.length, messages]);

  // Handle sending message (Pure WebSocket)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || !currentUser) {
      return;
    }

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
    
    // Update chat room list immediately with temp message
    updateChatRoomOnMessage({
      roomId: roomId,
      content: newMessage.trim(),
      timestamp: tempMessage.timestamp,
    });
    
    setNewMessage('');

    try {
      socketService.sendMessage({
        roomId: roomId,
        senderId: currentUser._id,
        receiverId: selectedCustomer._id,
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

  // Handle customer selection from chat room
  const handleSelectCustomer = async (customerWithRoom) => {
    setSelectedCustomer(customerWithRoom);
    setMessages([]);
    
    const roomId = customerWithRoom.roomId;
    
    // Join the room via socket
    if (isConnected) {
      socketService.joinRoom(roomId, currentUser._id);
    }
    
    // Load messages for the room
    await loadMessages(roomId);
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
        await loadChatRooms();
      } catch (err) {
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

  // Format date header
  const formatDateHeader = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to 0:00:00 for comparison
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return 'Hôm nay';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // Check if two timestamps are on different days
  const isDifferentDay = (timestamp1, timestamp2) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() !== date2.getTime();
  };
  const navigate = useNavigate();
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
          </Box>
        </Box>

        {/* Chat Rooms List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ p: 2, color: '#666', fontWeight: 'bold' }}>
            Cuộc trò chuyện ({(chatRooms || []).length})
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
              {(chatRooms || []).map((room) => {
                // Get customer info from chat room
                const customer = room?.customerId;
                return (
                <ListItem
                  key={room.roomId}
                  button
                  onClick={() => handleSelectCustomer({ ...customer, roomId: room.roomId })}
                  sx={{
                    bgcolor: selectedCustomer?.roomId === room.roomId ? '#E8F5E9' : 'transparent',
                    '&:hover': { bgcolor: '#F1F8E9' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4CAF50' }}>
                      {customer?.fullname?.charAt(0) || customer?.email?.charAt(0) || 'C'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={customer?.fullname || customer?.email || 'Unknown Customer'}
                    secondary={
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                          {room.lastMessage || 'Chưa có tin nhắn'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleString('vi-VN') : ''}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
              })}
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
              <Avatar sx={{ bgcolor: '#4CAF50' }}>
                {selectedCustomer.fullname?.charAt(0) || selectedCustomer.email?.charAt(0) || 'C'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedCustomer.fullname || selectedCustomer.email}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Nutrition Expert
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Tooltip title="Xem thông tin khách hàng">
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/customer-progress/${selectedCustomer._id}`)}
                    sx={{ 
                      color: '#4CAF50',
                      '&:hover': { 
                        bgcolor: '#E8F5E9',
                        color: '#45a049'
                      }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>

            {/* Messages Area */}
            <Box
            ref={messagesContainerRef}
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
              {messages && messages.length > 0 ? messages.map((message, index) => {
                // Handle both object and string senderId formats
                const messageSenderId = typeof message.senderId === 'object' 
                  ? message.senderId?._id 
                  : message.senderId;
                const isOwnMessage = messageSenderId?.toString() === currentUser?._id?.toString();
                
                // Check if we need to show a date header
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showDateHeader = !prevMessage || isDifferentDay(prevMessage.timestamp, message.timestamp);
                
                // Create unique key for message
                const messageKey = message.id || message._id || `msg_${message.timestamp}_${index}_${message.content?.substring(0, 10)}`;
                
                return (
                  <React.Fragment key={messageKey}>
                    {showDateHeader && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Chip 
                          label={formatDateHeader(message.timestamp)} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e8f5e9', 
                            color: '#4CAF50',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                    )}
                  <Fade in={true} timeout={300}>
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
                        <Typography variant="body1">{message.content || '(No content)'}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: isOwnMessage ? 'right' : 'left',
                          }}
                        >
                          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'No timestamp'}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                  </React.Fragment>
                );
              }) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mt: 8,
                  gap: 2 
                }}>
                  <Typography variant="h6" sx={{ color: '#666', textAlign: 'center' }}>
                    Chưa có tin nhắn nào
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
