import { Server, Socket } from 'socket.io';

// 방마다 어떤 유저(소켓 ID와 사용자 정보)들이 있는지 기록
const rooms: Record<string, { sid: string, user: any }[]> = {};

export default (io: Server, socket: Socket) => {

  // 유저가 특정 방에 WebRTC 참가를 요청
  socket.on('webrtc:join', (payload: { roomId: string, user: any }) => {
    const { roomId, user } = payload;
    
    // 기존 방 참여자 목록 가져오기
    const otherUsers = rooms[roomId] || [];
    
    // 새로운 참여자에게 기존 참여자 목록 전송
    socket.emit('webrtc:all-users', { users: otherUsers });

    // 새로운 참여자를 방에 추가
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push({ sid: socket.id, user });

    // 기존 참여자들에게 새로운 참여자 알림
    otherUsers.forEach(userData => {
      io.to(userData.sid).emit('webrtc:user-joined', { sid: socket.id, user });
    });

    // 방에 입장했음을 socket에 join하여 그룹화
    socket.join(roomId);
  });

  // Offer를 특정 대상에게 전달
  socket.on('webrtc:offer', (payload: { target: string, sdp: any, from: string, roomId: string }) => {
    io.to(payload.target).emit('webrtc:offer', { sdp: payload.sdp, from: payload.from });
  });

  // Answer를 특정 대상에게 전달
  socket.on('webrtc:answer', (payload: { target: string, sdp: any, from: string, roomId: string }) => {
    io.to(payload.target).emit('webrtc:answer', { sdp: payload.sdp, from: payload.from });
  });

  // ICE Candidate를 특정 대상에게 전달
  socket.on('webrtc:ice-candidate', (payload: { target: string, candidate: any, from: string, roomId: string }) => {
    io.to(payload.target).emit('webrtc:ice-candidate', { candidate: payload.candidate, from: payload.from });
  });

  // 유저가 방을 나갈 때
  const handleLeave = (roomId: string) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(userData => userData.sid !== socket.id);
      // 방에 남아있는 다른 유저들에게 내가 나갔다고 알림
      socket.to(roomId).emit('webrtc:user-left', { sid: socket.id });
    }
  }

  socket.on('webrtc:leave', (payload: { roomId: string }) => {
    handleLeave(payload.roomId)
  });

  // 소켓 연결이 끊어졌을 때 모든 방에서 해당 유저 제거
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      handleLeave(roomId);
    }
  });
};