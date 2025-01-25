import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

// static file(CSS 등)을 적용하도록 설정
app.use(express.static(__dirname));

// route hanler '/'를 홈으로 정의
app.get('/', (req, res) => {
    // res.send('<h1>Hello World</h1>');
    // 요청 수신 시 index.html 파일 전송
    res.sendFile(join(__dirname, 'client.html'));
});

function sendDataToRoom(roomId, data) {
    io.to(roomId).emit(data['status'], data);
}

io.sockets.on('connection', (socket) => {
    console.log('client connected');

    // room 입장
    socket.on('join room', (roomId, name) => {
        socket.join(roomId);
        socket.room = roomId;
        socket.name = name;
        io.to(roomId).emit('user join', name);
    });

    // 그리기 정보 전달 시 수행
    socket.on('message', (data) => {
        // 그리기 정보를 room에 전달한다.
        sendDataToRoom(socket.room, data);
    });

    // room 퇴장
    socket.on('leave room', () => {
        let roomId = socket.room;
        socket.leave(roomId); // room 연결 종료
        socket.room = ''; // room 정보 업데이트
        console.log(`${roomId} -> ${socket.room}`);
        io.to(roomId).emit('user leave', socket.name);
    });
});

const port = 3000;

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});