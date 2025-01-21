import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

// app을 HTTP server를 위한 function handler로 설정
const app = express();
const server = createServer(app);

// socket.io로 서버 생성
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

// static file(CSS 등)을 적용하도록 설정
app.use(express.static(__dirname));

// route hanler '/'를 홈으로 정의
app.get('/', (req, res) => {
    // res.send('<h1>Hello World</h1>');
    // 요청 수신 시 index.html 파일 전송
    res.sendFile(join(__dirname, 'index.html'));
});

// 모든 연결된 소켓에 메세지 전송
io.emit('hello', 'world');

// client 연결 시 client socket을 얻는다.
io.on('connection', (socket) => {
    console.log('a user connected');

    // 메세지를 emit하는 socket 이외의 socket에 메세지 전송
    socket.broadcast.emit('hi');

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        // chat message를 모든 사람에게 전송
        io.emit('chat message', msg);
    });

    // client가 callback 함수를 함께 보낸 경우
    socket.on('request', (arg1, arg2, callback) => {
        console.log(arg1);
        console.log(arg2);
        callback({ // 정상 응답 시 반환할 객체
            status: 'ok'
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // room (특정 room에 속한 사용자에게만 전송)
    socket.join('some room'); // room 합류
    // room 내부에 broadcast
    io.to('some room').emit('hello', 'world');
    // room에 속하지 않은 client에 broadcast
    io.except('some room').emit('hello', 'world');
    // room 탈퇴
    socket.leave('some room');
});

// 서버가 port 3000을 listen하도록 설정
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});