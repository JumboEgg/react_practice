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

io.sockets.on('connection', (socket) => {
    console.log('client connected');

    // 그리기 정보 전달 시 수행
    socket.on('message', (data) => {
        // 그리기 정보를 연결된 모든 client에 반영한다.
        switch (data['status']) {
            case 'start':
                io.sockets.emit('start', data);
                break;
            case 'draw': 
                io.sockets.emit('draw', data);
                break;
            case 'end':
                io.sockets.emit('end', data);
                break;
            case 'erase':
                io.sockets.emit('erase', data);
            default:
                break;
        }
    })
});

const port = 3000;

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});