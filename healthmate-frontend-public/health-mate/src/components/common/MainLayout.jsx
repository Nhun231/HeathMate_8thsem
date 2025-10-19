import React from "react";
import { Outlet } from "react-router-dom";
import {Box} from "@mui/material";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import FloatingChatBox from "../chatAI/AIChatbot.jsx";
const MainLayout = () => {
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Header />
                <Box sx={{ flexGrow: 1}}>
                    <Outlet  />
                </Box>
                <FloatingChatBox />
                <Footer />
            </Box>

        </>
    );
};

export default MainLayout;
