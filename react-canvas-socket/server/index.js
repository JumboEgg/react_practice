import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

// function sendDataToRoom(roomId, data) {
//     io.to(roomId).emit(data['status'], data);
// }

io.on('connection', (socket) => {
    console.log('client connected : ', socket.id);
    socket.on('message', (name, message) => {
        io.emit('message', name, message);
    });

    socket.on('join room', (roomId, name) => {
        socket.join(roomId);
        socket.room = roomId;
        socket.name = name;
        io.to(roomId).emit('user join', name);
    });
    
    // 그리기 정보 전달 시 수행
    socket.on('message', (data) => {
        // 그리기 정보를 room에 전달한다.
        // sendDataToRoom(socket.room, data);

        // 임시 기능을 위해 연결된 모든 client에 전송
        io.emit(data['status'], data);
    });

    socket.on('leave room', () => {
        let roomId = socket.room;
        socket.leave(roomId); // room 연결 종료
        socket.room = ''; // room 정보 업데이트
        console.log(`${roomId} -> ${socket.room}`);
        io.to(roomId).emit('user leave', socket.name);
    });
});

server.listen(3869, () => {
    console.log('server running on port 3869');
});