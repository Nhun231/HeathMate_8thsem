import React from "react";
import { Box } from "@mui/material";
import CustomerPage from "../homepage/CustomerPage"
import Footer from "../common/Footer";
import Header from "../common/Header";

const HomePage = () => {
    return (
        <Box >
            <main>
                <CustomerPage />
            </main>
        </Box>
    );
};

export default HomePage;