// packages/backend/src/sockets/index.ts (채팅 작동을 위한 최종 코드)

import { Server, Socket } from 'socket.io';
import http from 'http';
import { chatHandler } from './chat.handler.js';
import webrtcHandler from './webrtc.handler.js';
import noteHandler from './note.handler.js';
import logger from '../utils/logger.js';

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      // 🚨 [수정] 프론트엔드 주소(localhost:5173)를 명시적으로 지정하여 CORS 문제 해결
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`✅ 소켓 연결 성공: ${socket.id}`);

    // 네임스페이스나 룸을 사용하여 핸들러를 분리할 수 있습니다.
    chatHandler(io, socket);
    webrtcHandler(io, socket);
    noteHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`❌ 소켓 연결 해제: ${socket.id}`);
    });
  });
};