import React from 'react';
import { Container, Box } from '@mui/material';
import CustomerChat from '../../components/customer/CustomerChat.jsx';

const CustomerChatPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth={false} sx={{ p: 0 }}>
        <CustomerChat />
      </Container>
    </Box>
  );
};

export default CustomerChatPage;
