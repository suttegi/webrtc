import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
