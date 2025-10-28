import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import ExpertChat from "../../components/expert/ExpertChat.jsx";


const ExpertChatPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth={false} sx={{ p: 0 }}>
        <ExpertChat />
      </Container>
    </Box>
  );
};

export default ExpertChatPage;
