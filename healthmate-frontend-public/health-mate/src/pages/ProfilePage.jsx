import React from "react";
import { Container, Box } from "@mui/material";
import Profile from "../components/profile/ViewProfile.jsx";
const ProfilePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <Profile />
      </Box>
    </Container>
  );
};

export default ProfilePage;
