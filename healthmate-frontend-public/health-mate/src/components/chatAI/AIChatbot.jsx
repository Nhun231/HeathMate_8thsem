import React, { useState } from "react";
import { Box, Button, Typography, Fade } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "../../styles/chatbounce.css";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

import { aiChatBot } from "../../services/AIChatbot";

const FloatingChatBox = () => {
  const [visible, setVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message:
        "Xin chào! Bạn cần tư vấn dinh dưỡng gì cho ngày hôm nay?",
      sender: "HealthMate Assistant",
      sentTime: "just now",
      direction: "incoming",
    },
  ]);
  const cleanMarkdown = (text) => text.replace(/[#*]/g, "");

  const handleSend = async (input) => {
    if (input.trim() === "") return;

    const newMessage = {
      message: input,
      sender: "Bạn",
      sentTime: "now",
      direction: "outgoing",
      bounce: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("accessToken"); 
      const response = await aiChatBot({ prompt: input }, token);

      const botReply =
        response?.data?.message ||
        response?.data?.reply ||
        "Xin lỗi, tôi chưa hiểu câu hỏi của bạn ";

      setMessages((prev) => [
        ...prev,
        {
          message: botReply,
          sender: "HealthMate AI",
          sentTime: "just now",
          direction: "incoming",
          animate: true,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          message:
            "⚠️ Xin lỗi, hệ thống hiện đang gặp sự cố. Vui lòng thử lại sau!",
          sender: "HealthMate AI",
          sentTime: "just now",
          direction: "incoming",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 30,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#55B359",
            color: "white",
            borderRadius: "50%",
            width: 60,
            height: 60,
            minWidth: 0,
            boxShadow: 4,
            fontSize: 20,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#4edd47ff",
              boxShadow: 6,
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
              boxShadow: 3,
            },
          }}
          onClick={() => setVisible(!visible)}
        >
          <ChatIcon />
        </Button>
      </Box>
      <Fade in={visible} timeout={300}>
        <Box
          sx={{
            position: "fixed",
            bottom: 100,
            right: 30,
            width: 350,
            height: 470,
            zIndex: 1200,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            backgroundColor: "#F1F8E9",
            border: "1px solid #C8E6C9",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#A5D6A7",
              color: "#1B5E20",
              textAlign: "center",
              py: 1.2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              HealthMate Assistant
            </Typography>
            <Typography variant="caption">
              Đồng hành với chế độ ăn uống và sức khỏe của bạn.
            </Typography>
          </Box>

          <MainContainer
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#F1F8E9",
            }}
          >
            <ChatContainer
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <MessageList style={{ flex: 1, overflowY: "auto" }}>
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    className={msg.bounce ? "bounce-enter" : ""}
                    model={{
                      message: cleanMarkdown(msg.message),
                      sentTime: msg.sentTime,
                      sender: msg.sender,
                      direction: msg.direction,
                    }}
                    avatarSymbol={msg.sender === "HealthMate Chat" ? "🤖" : "🧑"}
                    position="single"
                  />
                ))}

                {isTyping && (
                  <Message
                    className="bounce-enter"
                    model={{
                      message: "HealthMate Assistant đang phản hồi ...",
                      sender: "HealthMate AI",
                      direction: "incoming",
                    }}
                    avatarSymbol="🤖"
                    position="single"
                  />
                )}
              </MessageList>

              <MessageInput
                placeholder="Nhập câu hỏi của bạn ..."
                onSend={handleSend}
                attachButton={false}
                disabled={isTyping}
                style={{ backgroundColor: "#ffffff" }}
              />
            </ChatContainer>
          </MainContainer>
        </Box>
      </Fade>
    </>
  );
};

export default FloatingChatBox;
