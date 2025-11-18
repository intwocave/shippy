// packages/backend/src/sockets/index.ts (채팅 작동을 위한 최종 코드)

import { Server, Socket } from 'socket.io';
import http from 'http';
import { chatHandler } from './chat.handler.js';
import webrtcHandler from './webrtc.handler.js';
import noteHandler from './note.handler.js';
import logger from '../utils/logger.js';

const onlineUsers = new Map<string, string>();

const broadcastOnlineUsers = (io: Server) => {
  const onlineUserIds = Array.from(onlineUsers.keys());
  io.emit('user:online-list', onlineUserIds);
  logger.info(`🌍 온라인 사용자 목록 브로드캐스트: ${onlineUserIds.join(', ')}`);
};

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`✅ 소켓 연결 성공: ${socket.id}`);

    socket.on('user:online', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      logger.info(`👤 ${userId} 온라인`);
      broadcastOnlineUsers(io);
    });

    socket.on('user:offline', (userId: string) => {
      onlineUsers.delete(userId);
      logger.info(`👤 ${userId} 오프라인`);
      broadcastOnlineUsers(io);
    });

    chatHandler(io, socket);
    webrtcHandler(io, socket);
    noteHandler(io, socket);

    socket.on('disconnect', () => {
      logger.info(`❌ 소켓 연결 해제: ${socket.id}`);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          logger.info(`👤 ${userId} 오프라인 (연결 해제)`);
          break;
        }
      }
      broadcastOnlineUsers(io);
    });
  });
};