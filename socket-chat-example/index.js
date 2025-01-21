import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';

if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    for (let i=0; i<numCPUs; i++) {
        // CPU마다 server를 하나씩 생성
        cluster.fork({
            PORT: 3000 + i
        });
    }
    // primary thread에 adapter 설정
    setupPrimary();
} else {
    // database 열기
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
    });

    // 'messages' table 생성
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_offset TEXT UNIQUE,
            content TEXT
        );
    `);

    // app을 HTTP server를 위한 function handler로 설정
    const app = express();
    const server = createServer(app);

    // socket.io로 서버 생성
    const io = new Server(server, {
        connectionStateRecovery: {},
        // worker thread마다 adapter 세팅
        adapter: createAdapter()
    });

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
    // io.emit('hello', 'world');

    // client 연결 시 client socket을 얻는다.
    io.on('connection', async (socket) => {
        console.log('a user connected');

        // 메세지를 emit하는 socket 이외의 socket에 메세지 전송
        // socket.broadcast.emit('hi');

        // socket.on('chat message', (msg) => {
        //     console.log('message: ' + msg);
        //     // chat message를 모든 사람에게 전송
        //     io.emit('chat message', msg);
        // });

        // client가 callback 함수를 함께 보낸 경우
        // socket.on('request', (arg1, arg2, callback) => {
        //     console.log(arg1);
        //     console.log(arg2);
        //     callback({ // 정상 응답 시 반환할 객체
        //         status: 'ok'
        //     });
        // });

        socket.on('disconnect', async () => {
            console.log('user disconnected');
        });

        // // room (특정 room에 속한 사용자에게만 전송)
        // socket.join('some room'); // room 합류
        // // room 내부에 broadcast
        // io.to('some room').emit('hello', 'world');
        // // room에 속하지 않은 client에 broadcast
        // io.except('some room').emit('hello', 'world');
        // // room 탈퇴
        // socket.leave('some room');

        // DB에서 정보 받아오기
        socket.on('chat message', async (msg, clientOffset, callback) => {
            console.log(msg);

            let result;
            try { // DB에 메세지와 고유번호 저장
                result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
            } catch (e) { // 저장 실패 시 처리
                if (e.errno === 19) { // SQLite 내부 동작 때문에 삽입 불가한 경우
                    // -> 이미 메세지가 저장되어 있는 경우
                    callback(); // client에게 수신 고지
                }
                return;
            }
            // 메세지와 id emit
            io.emit('chat message', msg, result.lastID);
            callback(); // 정상 처리 시 client 고지
        });
        
        if (!socket.recovered) {
            // 연결 상태 복구에 실패한 경우
            try {
                await db.each('SELECT id, content FROM messages WHERE id > ?',
                    // DB에서 마지막으로 받은 메세지 이후의 항목을 선택
                    [socket.handshake.auth.serverOffset || 0],
                    (_err, row) => {
                        // DB에서 받은 메세지 정보를 전달
                        socket.emit('chat message', row.content, row.id);
                    }
                )
            } catch (e) {
                // 오류 처리
            }
        }
    });

    // 서버가 port를 listen하도록 설정
    // server.listen(3000, () => {
    //     console.log('server running at http://localhost:3000');
    // });

    // 각 core마다 각각 port를 listen한다.
    const port = process.env.PORT;

    server.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
    });
}