import React from "react";
import { Box } from "@mui/material";
import HomePageComponent from "../homepage/HomePage";
import Footer from "../common/Footer";
import Header from "../common/Header";

const HomePage = () => {
    return (
        <Box >
            <Header />
            <main>
                <HomePageComponent />
            </main>
            <Footer />
        </Box>
    );
};

export default HomePage;