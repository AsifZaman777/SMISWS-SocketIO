import express from "express";
import http from "http";
import { Server } from "socket.io";
import WebSocket from "ws";

const app = express();
const server = http.createServer(app);

// Socket.IO server for clients
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//SMISWS socket url
const WS_SERVER_URL = "ws://192.168.100.48:8001";

//handle socket io client connections
io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);

  //create plain WebSocket connection to the SMISWS server
  let ws = null;

  try {
    ws = new WebSocket(WS_SERVER_URL);

    ws.on("open", () => {
      console.log("Connected to WebSocket server");
      socket.emit("connect_status", {
        status: "connected",
        message: "Bridge connected to WebSocket server",
      });
    });

    ws.on("message", (data) => {
      console.log("Message from WS server:", data.toString());
      // Forward message from WebSocket server to Socket.IO client
      socket.emit("message", data.toString());
    });

    ws.on("close", () => {
      console.log("Disconnected from WebSocket server");
      socket.emit("connect_status", {
        status: "disconnected",
        message: "Bridge disconnected from WebSocket server",
      });
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error.message);
      socket.emit("error", { message: error.message });
    });
  } catch (error) {
    console.error("Failed to create WebSocket connection:", error.message);
    socket.emit("error", { message: "Failed to connect to WebSocket server" });
  }

  // Handle messages from Socket.IO client
  socket.on("message", (data) => {
    console.log("Message from Socket.IO client:", data);

    if (ws && ws.readyState === WebSocket.OPEN) {
      // Forward message from Socket.IO client to WebSocket server
      ws.send(data);
    } else {
      console.error("WebSocket not connected, cannot send message");
      socket.emit("error", { message: "WebSocket server not connected" });
    }
  });

  // Handle Socket.IO client disconnect
  socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected:", socket.id);
    if (ws) {
      ws.close();
    }
  });
});

// Start the bridge server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Bridge server running on http://localhost:${PORT}`);
  console.log(
    `Bridging Socket.IO clients to WebSocket server at ${WS_SERVER_URL}`
  );
});
