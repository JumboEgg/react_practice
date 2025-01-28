import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('client connected : ', socket.id);
    socket.on('message', (name, message) => {
        io.emit('message', name, message);
    });
});

server.listen(3869, () => {
    console.log('server running on port 3869');
});