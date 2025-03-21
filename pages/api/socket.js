import { Server } from "socket.io";

const SocketHandler = (req, res) => {
    console.log("called api");

    if (res.socket.server.io) {
        console.log("socket already running");
    } else {
        const io = new Server(res.socket.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log("server is connected");

            socket.on('join-room', (roomId, userId) => {
                console.log(`A new user ${userId} joined room ${roomId}`);
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-connected', userId);
            });

            socket.on('user-toggle-audio', (userId, roomId) => {
                socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
            });

            socket.on('user-toggle-video', (userId, roomId) => {
                socket.broadcast.to(roomId).emit('user-toggle-video', userId);
            });

            socket.on('user-leave', (userId, roomId) => {
                socket.broadcast.to(roomId).emit('user-leave', userId);
            });

            socket.on('draw', ({ roomId, x0, y0, x1, y1, color, lineWidth }) => {
                console.log(`DRAW from ${socket.id} to room ${roomId}`);
                socket.to(roomId).emit('draw', { x0, y0, x1, y1, color, lineWidth });
            });

            socket.on('clear-board', (roomId) => {
                console.log(`Clearing board in room ${roomId}`);
                socket.to(roomId).emit('clear-board');
            });

            socket.on('chat-message', ({ roomId, message, userId }) => {
                console.log(`Message from ${userId} in room ${roomId}: ${message}`);
                socket.to(roomId).emit('chat-message', { message, userId });
            });
            
        });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Socket initialized' }));
};

export default SocketHandler;
