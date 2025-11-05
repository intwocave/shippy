// packages/backend/src/sockets/chat.handler.ts

import { Server, Socket } from 'socket.io';
import logger from '../utils/logger.js';
import * as chatService from '../services/chat.service.js';
import { generateText } from '../services/ai.service.js';

/**
 * `chatHandler` 함수는 Socket.IO 서버 인스턴스와 개별 소켓에 대한
 * 실시간 채팅 관련 이벤트 리스너를 설정합니다.
 */
export const chatHandler = (io: Server, socket: Socket) => {
  logger.info(`New client connected to chat: ${socket.id}`);

  /**
   * 'join_room' 이벤트 리스너
   * 클라이언트가 특정 프로젝트 채팅방에 참여할 때 호출됩니다.
   * @param projectId 참여할 프로젝트의 ID
   */
  const joinRoom = (projectId: string) => {
    socket.join(projectId);
    logger.info(`Socket ${socket.id} joined room ${projectId}`);
  };

  /**
   * 'leave_room' 이벤트 리스너
   * 클라이언트가 특정 프로젝트 채팅방에서 나갈 때 호출됩니다.
   * @param projectId 나갈 프로젝트의 ID
   */
  const leaveRoom = (projectId: string) => {
    socket.leave(projectId);
    logger.info(`Socket ${socket.id} left room ${projectId}`);
  };

  /**
   * 'chat_message' 이벤트 리스너
   * 클라이언트로부터 새로운 채팅 메시지를 받았을 때 호출됩니다.
   * 받은 메시지를 데이터베이스에 저장하고 해당 채팅방의 모든 클라이언트에게 전송합니다.
   * @param message 수신된 메시지 객체
   * @param projectId 메시지가 속한 프로젝트의 ID
   */
  const handleChatMessage = async (message: {
    content: string;
    authorId: number;
    projectId: number;
  }) => {
    try {
      const savedMessage = await chatService.createMessage(message);
      // 메시지를 보낸 클라이언트를 포함한 방의 모든 사람에게 메시지를 브로드캐스트합니다.
      io.to(String(savedMessage.projectId)).emit('new_message', savedMessage);
      logger.info(`Message from ${message.authorId} in room ${savedMessage.projectId}: ${message.content}`);
    } catch (error) {
      logger.error('Error handling chat message:', error);
      // 필요한 경우 에러를 클라이언트에게 다시 보낼 수 있습니다.
      socket.emit('chat_error', '메시지 저장에 실패했습니다.');
    }
  };

  const handleAiCommand = async (data: { command: string; projectId: string; text?: string }) => {
    const { command, projectId, text } = data;
    logger.info(`AI command '${command}' received for project ${projectId}`);

    try {
      let responseText = '';

      if (command === 'summarize') {
        const messages = await chatService.getMessagesByProjectId(Number(projectId));
        const chatHistory = messages.map(msg => `${msg.author.name}: ${msg.content}`).join('\n');
        const prompt = `다음 대화 내용을 한글로 요약해줘. 각 사람의 의견을 종합하고 핵심 내용을 간결하게 정리해줘.\n\n---\n${chatHistory}\n---'`;
        responseText = await generateText(prompt);
      } else if (command === 'prompt' && text) {
        responseText = await generateText(text);
      }
      else {
        throw new Error('Invalid AI command.');
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        content: responseText,
        createdAt: new Date(),
        author: { name: 'AI Assistant' },
        authorId: 'ai-assistant',
        projectId: Number(projectId),
        isAIMessage: true // AI 메시지임을 구분하기 위한 플래그
      };

      io.to(projectId).emit('new_message', aiMessage);
      logger.info(`AI response sent to room ${projectId}`);

    } catch (error) {
      logger.error('Error handling AI command:', error);
      const errorMessage = {
        id: `ai-err-${Date.now()}`,
        content: 'AI 어시스턴트가 응답하지 못했습니다.',
        createdAt: new Date(),
        author: { name: 'AI Assistant' },
        authorId: 'ai-assistant',
        projectId: Number(projectId),
        isAIMessage: true,
        isError: true
      };
      socket.emit('new_message', errorMessage); // 에러는 요청한 사용자에게만 보냄
    }
  };


  // 이벤트 리스너 등록
  socket.on('join_room', joinRoom);
  socket.on('leave_room', leaveRoom);
  socket.on('chat_message', handleChatMessage);
  socket.on('ai_command', handleAiCommand);

  // 소켓 연결 해제 시
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
};