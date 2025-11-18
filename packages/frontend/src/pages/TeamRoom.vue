<template>
  <div class="team-room-layout">
    
    <div class="team-sidebar">
      <h2>내 팀 목록</h2>
      <div v-if="loadingTeams" class="status">팀 목록 로딩 중...</div>
      <ul v-else-if="teams.length > 0" class="team-list">
        <li v-for="team in teams" :key="team.projectId" 
            :class="['team-item', { 'is-active': selectedProjectId === team.projectId }]"
            @click="selectTeam(team.projectId)">
          {{ team.project.title }}
        </li>
      </ul>
      <p v-else class="status">참여 중인 팀이 없습니다.</p>
    </div>

    <div class="chat-main">
      
      <div v-if="!selectedProjectId" class="chat-placeholder">
        <p>왼쪽에서 팀을 선택하여 채팅을 시작하세요.</p>
      </div>

      <div v-else class="chat-window">
        <h3 class="chat-header">
          {{ selectedTeam?.project.title }}
          <div class="tab-buttons">
            <button :class="{ 'active': activeTab === 'chat' }" @click="setActiveTab('chat')">💬 채팅</button>
            <button :class="{ 'active': activeTab === 'note' }" @click="setActiveTab('note')">📝 공유 메모장</button>
            <button :class="{ 'active': activeTab === 'video' }" @click="setActiveTab('video')">📹 화상 채팅</button> 
          </div>
        </h3>

        <div v-if="activeTab === 'chat'" class="tab-content chat-content">
            <div class="message-list" ref="messageListRef">
              <div v-for="msg in messages" :key="msg.id" 
                  :class="['message-item', { 'my-message': msg.authorId === user?.id && !msg.isAIMessage, 'ai-message': msg.isAIMessage }]"
              >
                <strong class="message-author">{{ msg.author.name }}:</strong>
                <div class="message-content" v-if="!msg.isAIMessage">{{ msg.content }}</div>
                <div class="message-content" v-else v-html="md.render(msg.content)"></div>
              </div>
            </div>

            <div class="input-area">
              <input v-model="inputMessage" @keyup.enter="sendMessage" 
                    :placeholder="`#${selectedTeam?.project.title}에 메시지 보내기...`" />
              <button @click="sendMessage" :disabled="!inputMessage.trim()">전송</button>
            </div>
        </div>

        <div v-if="activeTab === 'note'" class="tab-content note-content">
            <div v-if="isNoteLoading" class="note-status">노트 로딩 중...</div>
            <div v-else class="note-editor-container single-editor">
                
                <div class="note-toolbar">
                    <button @click="formatText('heading')" title="Header">H1</button>
                    <button @click="formatText('bold')" title="굵게 (Ctrl/Cmd + B)">B</button>
                    <button @click="formatText('italic')" title="기울임 (Ctrl/Cmd + I)">I</button>
                    <button @click="formatText('link')" title="링크">🔗</button>
                    <button @click="formatText('list')" title="목록">*</button>
                    
                    <button @click="showPreview = !showPreview" class="toggle-preview-btn">
                        {{ showPreview ? '✍️ 편집 모드' : '📄 미리보기' }}
                    </button>
                </div>
                
                <div v-if="!showPreview" class="editor-view">
                     <textarea 
                        ref="noteInputRef"
                        v-model="noteContent" 
                        @input="handleNoteInput"
                        placeholder="여기에 마크다운으로 내용을 작성하세요..."
                        class="note-input full-width"></textarea>
                </div>
                
                <div v-else class="preview-view">
                     <div class="note-preview" v-html="renderedNoteContent"></div>
                </div>

            </div>
        </div>

        <div v-if="activeTab === 'video'" class="tab-content video-content">
            <div class="video-status" v-if="!isWebRTCActive">
                <p>화상 채팅방에 입장했습니다. 연결하려면 "연결 시작" 버튼을 눌러 카메라와 마이크에 접근하세요.</p>
                <button @click="startWebRTC" :disabled="isWebRTCConnecting">
                    {{ isWebRTCConnecting ? '연결 중...' : '연결 시작' }}
                </button>
            </div>

            <div class="video-streams-wrapper" v-else>
                <div class="video-streams">
                    <div class="local-video-container" :style="localVideoStyle">
                        <video ref="localVideoRef" autoplay muted playsinline class="local-video"></video>
                        <p class="video-label">나</p>
                    </div>
                    <div class="remote-video-container">
                        <video ref="remoteVideoRef" autoplay playsinline class="remote-video"></video> 
                        <p class="video-label">상대방</p>
                    </div>
                </div>
                
                <div class="control-buttons">
                    <button @click="toggleVideo" :class="{ 'on': isVideoOn }" title="비디오 켜기/끄기">
                        {{ isVideoOn ? '📹 비디오 끄기' : '🎥 비디오 켜기' }}
                    </button>
                    <button @click="toggleAudio" :class="{ 'on': isAudioOn }" title="마이크 음소거/해제">
                        {{ isAudioOn ? '🎤 음소거' : '🔇 음소거 해제' }}
                    </button>
                    <button @click="toggleScreenShare" :disabled="!isWebRTCActive" :class="{ 'on': isScreenSharing }">
                        {{ isScreenSharing ? '🖥️ 화면 공유 중지' : '💻 화면 공유' }}
                    </button>
                </div>
            </div>
        </div>
        
      </div>
    </div>

    <div class="members-sidebar">
      <h2>팀원 목록</h2>
      <ul v-if="teamMembers.length > 0" class="member-list">
        <li v-for="member in teamMembers" :key="member.id" class="member-item">
          <span :class="['online-status', { 'online': onlineUserIds.includes(member.id) }]">●</span>
          <span class="member-name">{{ member.name }}</span>
        </li>
      </ul>
      <p v-else class="status">팀원을 불러오는 중...</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import axios from 'axios';
import { io, Socket } from 'socket.io-client'; 
import MarkdownIt from 'markdown-it'; 
import { debounce } from 'lodash'; 

// --- 타입 정의 ---
interface ChatMessage {
  id: string | number;
  content: string;
  author: { name: string };
  authorId: string;
  projectId: number;
  createdAt: Date;
  isAIMessage?: boolean;
  isError?: boolean;
  tempId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  // 필요한 경우 다른 속성 추가
}

// --- 상태 관리 ---
const { user, isAuthenticated } = useAuth();

const teams = ref<any[]>([]);
const loadingTeams = ref(true);
const selectedProjectId = ref<number | null>(null);

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
let socket: Socket;
const messageListRef = ref<HTMLDivElement | null>(null);

const teamMembers = ref<TeamMember[]>([]);
const onlineUserIds = ref<string[]>([]);

// 탭 상태
const activeTab = ref<'chat' | 'note' | 'video'>('chat'); 
const noteContent = ref('');
const isNoteLoading = ref(false);
const md = new MarkdownIt();

// 노트 에디터 관련
const noteInputRef = ref<HTMLTextAreaElement | null>(null);
const showPreview = ref(false); 

// WebRTC 관련 상태
const localVideoRef = ref<HTMLVideoElement | null>(null);
const remoteVideoRef = ref<HTMLVideoElement | null>(null); 
const isWebRTCActive = ref(false);
const isWebRTCConnecting = ref(false);
let localStream: MediaStream | null = null;
let userStream: MediaStream | null = null; // 사용자 카메라/마이크 스트림 저장
let peerConnection: RTCPeerConnection | null = null;
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};
let targetSocketId: string | null = null;
// 비디오/오디오 제어 상태
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let visualizerFrameId: number | null = null;
const audioLevel = ref(0); // 0 to 1

const isVideoOn = ref(false); 
const isAudioOn = ref(false); 
const isScreenSharing = ref(false);


const selectedTeam = computed(() => {
  if (selectedProjectId.value === null) return null;
  return teams.value.find(team => team.projectId === selectedProjectId.value);
});

const localVideoStyle = computed(() => ({
    boxShadow: `0 0 0 ${Math.round(audioLevel.value * 15)}px rgba(46, 204, 113, 0.5)`,
    transition: 'box-shadow 0.1s ease-out',
}));

const renderedNoteContent = computed(() => {
    return md.render(noteContent.value);
});


// --- 유틸리티 ---
const scrollToBottom = () => {
    nextTick(() => {
        const element = messageListRef.value;
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    });
};


// --- 데이터 로딩 및 팀 선택 로직 ---
const fetchTeams = async () => {
  if (!isAuthenticated.value) {
    loadingTeams.value = false;
    return;
  }
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/users/me/applications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    teams.value = response.data;
    
    if (teams.value.length > 0 && selectedProjectId.value === null) {
        selectTeam(teams.value[0].projectId);
    }

  } catch (error) {
    console.error('팀 목록 조회 실패:', error);
  } finally {
    loadingTeams.value = false;
  }
};

const fetchTeamMembers = async (projectId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    teamMembers.value = response.data;
  } catch (error) {
    console.error('팀 멤버 조회 실패:', error);
    teamMembers.value = [];
  }
};

const fetchNote = async (projectId: number) => {
    isNoteLoading.value = true;
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/projects/${projectId}/note`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        noteContent.value = response.data.content;
        showPreview.value = false; // 새 팀 선택 시 편집 모드로 시작
    } catch (error) {
        console.error('노트 불러오기 실패:', error);
        noteContent.value = '# 노트를 불러올 수 없습니다.';
    } finally {
        isNoteLoading.value = false;
    }
}

const fetchMessages = async (projectId: number) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get<ChatMessage[]>(`/api/projects/${projectId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        messages.value = response.data;
        scrollToBottom();
    } catch (error) {
        console.error('채팅 기록 불러오기 실패:', error);
    }
};

const joinRooms = (projectId: number) => {
    if (socket.connected) {
        socket.emit('join_room', String(projectId));
        socket.emit('note:join', String(projectId)); 
    }
};

const selectTeam = (projectId: number) => {
    if (selectedProjectId.value !== projectId) {
        stopWebRTC(); 

        if(selectedProjectId.value) {
            socket.emit('leave_room', String(selectedProjectId.value));
        }

        messages.value = []; 
        selectedProjectId.value = projectId;

        fetchMessages(projectId);
        fetchNote(projectId); 
        fetchTeamMembers(projectId);
        joinRooms(projectId);
    }
};

// --- 채팅 및 노트 로직 ---

const sendNoteUpdate = debounce((content: string) => {
    const projectId = selectedProjectId.value;
    if (projectId) {
        socket.emit('note:update', {
            roomId: String(projectId),
            content,
        });
    }
}, 500);

const handleNoteInput = () => {
    sendNoteUpdate(noteContent.value);
};

/**
 * 툴바 버튼 클릭 시 텍스트 포맷팅 적용
 */
const formatText = (style: 'bold' | 'italic' | 'heading' | 'link' | 'list') => {
  const textarea = noteInputRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = noteContent.value.substring(start, end);
  let prefix = '';
  let suffix = '';
  let lineStart = start; 

  if (style === 'bold') {
    prefix = '**';
    suffix = '**';
  } else if (style === 'italic') {
    prefix = '*';
    suffix = '*';
  } else if (style === 'link') {
    prefix = '[';
    suffix = '](url)';
  } else if (style === 'heading' || style === 'list') {
      lineStart = noteContent.value.lastIndexOf('\n', start - 1) + 1;
      
      if (style === 'heading') {
          prefix = '# ';
      } else if (style === 'list') {
          prefix = '* ';
      }
      suffix = '';
      
      // 줄의 시작에 삽입
      noteContent.value = 
          noteContent.value.substring(0, lineStart) + 
          prefix + 
          noteContent.value.substring(lineStart);
      
      // 커서를 포맷팅된 텍스트 뒤로 이동
      nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = lineStart + prefix.length + (end - lineStart);
          handleNoteInput();
      });
      return; 
  }

  // 선택 영역에 포맷팅 적용
  const newText = prefix + selectedText + suffix;
  noteContent.value = 
    noteContent.value.substring(0, start) +
    newText +
    noteContent.value.substring(end);
  
  // 커서 위치 조정
  nextTick(() => {
      if (style === 'link' && selectedText === '') {
          // 링크 삽입 시 'url' 위치를 선택
          textarea.selectionStart = start + prefix.length + 1;
          textarea.selectionEnd = end + prefix.length + 4;
      } else {
          // 포맷된 텍스트의 끝으로 이동
          textarea.selectionStart = textarea.selectionEnd = start + newText.length;
      }
      handleNoteInput();
  });
};


const sendMessage = () => {
  const message = inputMessage.value.trim();
  const projectId = selectedProjectId.value;

  if (!message || !projectId || !user.value) return;

  if (message.startsWith('/')) {
    const [command, ...args] = message.substring(1).split(' ');
    const text = args.join(' ');
    const tempId = `ai-thinking-${Date.now()}`;

    const thinkingMessage: ChatMessage = {
      id: tempId,
      content: 'AI가 답변을 생성 중입니다...',
      author: { name: 'AI Assistant' },
      authorId: 'ai-assistant',
      projectId,
      createdAt: new Date(),
      isAIMessage: true,
    };
    messages.value.push(thinkingMessage);
    scrollToBottom();

    if (command === '요약' || command === 'summarize') {
      socket.emit('ai_command', { command: 'summarize', projectId: String(projectId), tempId });
    } else if ((command === '프롬프트' || command === 'prompt') && text) {
      socket.emit('ai_command', { command: 'prompt', projectId: String(projectId), text, tempId });
    } else {
      // 유효하지 않은 명령어 처리 (예: 에러 메시지 표시)
      console.warn('Invalid AI command:', command);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        content: `'/${command}'는 유효하지 않은 명령어입니다. 사용법: /요약 또는 /프롬프트 [질문]`,
        author: { name: 'System' },
        authorId: 'system',
        projectId,
        createdAt: new Date(),
        isAIMessage: true,
        isError: true,
      };
      messages.value.push(errorMsg);
      scrollToBottom();
    }
  } else {
    const payload = {
      content: message,
      authorId: user.value.id,
      projectId: projectId,
    };
    socket.emit('chat_message', payload);
  }

  inputMessage.value = '';
};

// 탭 전환 핸들러 (WebRTC 종료 로직 포함)
const setActiveTab = (tab: 'chat' | 'note' | 'video') => {
    if (activeTab.value !== tab) {
        // 이전 탭이 'video'였으면 WebRTC를 종료합니다.
        if (activeTab.value === 'video') {
            stopWebRTC(); 
        }
        activeTab.value = tab;
    }
    
    // 새 탭이 'chat'일 때만 스크롤 이동
    if (tab === 'chat') {
        scrollToBottom();
    }
};

// --- WebRTC 로직 ---

const stopWebRTC = () => { 
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
        userStream = null;
    }
    // localVideoRef가 null이 아닌지 확인 후 srcObject 초기화
    if (localVideoRef.value) {
        localVideoRef.value.srcObject = null;
        localVideoRef.value.pause();
    }
    if (remoteVideoRef.value) {
        remoteVideoRef.value.srcObject = null;
        remoteVideoRef.value.pause();
    }

    // 서버에 방을 나갔다고 알림
    if (selectedProjectId.value) {
        socket.emit('webrtc:leave', { roomId: String(selectedProjectId.value) });
    }

    // WebRTC 오디오 시각화 정리
    if (visualizerFrameId) {
        cancelAnimationFrame(visualizerFrameId);
        visualizerFrameId = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    audioLevel.value = 0;

    isWebRTCActive.value = false;
    isWebRTCConnecting.value = false;
    isScreenSharing.value = false;
    targetSocketId = null;
    // 제어 상태 초기화
    isVideoOn.value = false;
    isAudioOn.value = false;
    console.log('[WebRTC] 연결 종료됨');
};

const createPeerConnection = (isCaller = false) => { 
    if (peerConnection) {
        peerConnection.close();
    }

    peerConnection = new RTCPeerConnection(iceServers);

    // 1. 이벤트 핸들러를 먼저 설정 (경쟁 상태 방지)
    peerConnection.onicecandidate = (event) => {
        if (event.candidate && targetSocketId) {
            console.log('[WebRTC] ICE Candidate 전송');
            socket.emit('webrtc:ice-candidate', {
                target: targetSocketId,
                candidate: event.candidate,
                from: socket.id,
                roomId: String(selectedProjectId.value)
            });
        }
    };

    peerConnection.ontrack = (event) => {
        if (remoteVideoRef.value && event.streams[0]) {
            console.log('[WebRTC] 원격 스트림 수신');
            remoteVideoRef.value.srcObject = event.streams[0];
            remoteVideoRef.value.play().catch(e => console.error('[WebRTC] 원격 비디오 재생 실패:', e));
        }
    };

    if (isCaller) {
        peerConnection.onnegotiationneeded = async () => {
            if (targetSocketId) {
                try {
                    console.log('[WebRTC] onnegotiationneeded 이벤트 발생, Offer 생성 시도');
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    
                    console.log('[WebRTC] Offer 전송');
                    socket.emit('webrtc:offer', {
                        target: targetSocketId, 
                        sdp: peerConnection.localDescription,
                        from: socket.id,
                        roomId: String(selectedProjectId.value)
                    });
                } catch (error) {
                    console.error('[WebRTC] Offer 생성 실패:', error);
                }
            }
        };
    }

    // 2. 핸들러 설정 후 트랙 추가
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection?.addTrack(track, localStream as MediaStream);
        });
    }
};

const startWebRTC = async () => { 
    if (!selectedProjectId.value || !socket.connected || isWebRTCActive.value) return;

    isWebRTCConnecting.value = true;
    try {
        console.log('[WebRTC] 미디어 장치 접근 요청...');
        
        // 1. 로컬 미디어 스트림 가져오기
        userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream = userStream;

        const videoTrack = localStream.getVideoTracks()[0];
        const audioTrack = localStream.getAudioTracks()[0];

        // 2. 기본적으로 비디오는 꺼진 상태로 시작
        if (videoTrack) {
            videoTrack.enabled = false;
        }
        
        // 3. 비디오 요소에 스트림 할당
        if (localVideoRef.value) {
            localVideoRef.value.srcObject = localStream;
            await localVideoRef.value.play().catch(e => {
                console.error('[WebRTC] 비디오 재생 실패:', e);
            });
        }

        // 4. 초기 상태 설정
        isVideoOn.value = videoTrack ? videoTrack.enabled : false;
        isAudioOn.value = audioTrack ? audioTrack.enabled : false;
        
        // 4. 오디오 시각화 설정
        setupAudioVisualizer();

        // 5. WebRTC 상태 활성화
        isWebRTCActive.value = true;
        isWebRTCConnecting.value = false;

        // 6. 서버의 WebRTC 룸에 참여하여 다른 사용자 정보 요청
        console.log('[WebRTC] 서버에 join을 요청합니다.');
        socket.emit('webrtc:join', { roomId: String(selectedProjectId.value) });

    } catch (error) {
        console.error('❌ 미디어 접근 실패:', error);
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
             alert('카메라/마이크 사용이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
        } else {
             alert(`미디어 접근 실패: ${error.name || '알 수 없는 오류'}`);
        }
        isWebRTCConnecting.value = false;
        stopWebRTC();
    }
};

const toggleScreenShare = async () => {
    if (!isWebRTCActive.value || !peerConnection) return;

    const videoSender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
    if (!videoSender) {
        console.error('[WebRTC] 비디오 sender를 찾을 수 없습니다.');
        return;
    }

    if (isScreenSharing.value) {
        // --- 화면 공유 중지 ---
        console.log('[WebRTC] 화면 공유 중지를 시도합니다.');
        // 1. 기존 카메라 스트림으로 되돌리기
        const cameraTrack = userStream?.getVideoTracks()[0];
        if (cameraTrack) {
            await videoSender.replaceTrack(cameraTrack);
        }

        // 2. 현재 localStream (화면 공유 스트림)의 트랙들을 중지하여 리소스 해제
        if (localStream && localStream !== userStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // 3. localStream을 다시 userStream으로 설정
        localStream = userStream;
        if (localVideoRef.value) {
            localVideoRef.value.srcObject = localStream;
        }

        // 4. 상태 업데이트
        isScreenSharing.value = false;
        isVideoOn.value = cameraTrack ? cameraTrack.enabled : false;
        console.log('[WebRTC] 화면 공유가 중지되었습니다.');

    } else {
        // --- 화면 공유 시작 ---
        try {
            console.log('[WebRTC] 화면 공유 시작을 시도합니다.');
            // 1. 화면 공유 스트림 가져오기
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            // 2. PeerConnection의 비디오 트랙을 화면 공유 트랙으로 교체
            await videoSender.replaceTrack(screenTrack);
            
            // 3. localStream을 화면 공유 스트림으로 업데이트 (로컬 미리보기용)
            localStream = screenStream;
            if (localVideoRef.value) {
                localVideoRef.value.srcObject = localStream;
            }

            // 4. 상태 업데이트
            isScreenSharing.value = true;
            isVideoOn.value = true; // 화면 공유 중에는 비디오가 항상 켜진 것으로 간주
            console.log('[WebRTC] 화면 공유가 시작되었습니다.');

            // 5. 사용자가 브라우저 UI(예: '공유 중지' 버튼)로 공유를 중지했을 때 이벤트 핸들러
            screenTrack.onended = () => {
                // isScreenSharing 상태가 여전히 true일 때만 중지 로직을 실행 (중복 실행 방지)
                if (isScreenSharing.value) {
                    toggleScreenShare();
                }
            };

        } catch (error) {
            console.error('[WebRTC] 화면 공유 시작 실패:', error);
            isScreenSharing.value = false; // 실패 시 상태 롤백
        }
    }
};


// 비디오 켜기/끄기 토글
const toggleVideo = () => {
    if (!localStream || isScreenSharing.value) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        isVideoOn.value = videoTrack.enabled;

        // [FIX] 비디오가 켜질 때, 일부 브라우저에서 렌더링이 시작되지 않는 문제를 해결하기 위해
        // srcObject를 다시 할당하여 비디오 요소가 스트림을 새로 인식하도록 합니다.
        if (videoTrack.enabled && localVideoRef.value) {
            localVideoRef.value.srcObject = localStream;
        }
    }
};

// 오디오 켜기/끄기 (음소거) 토글
const toggleAudio = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        isAudioOn.value = audioTrack.enabled;
    }
};

const setupAudioVisualizer = () => {
    if (!localStream || !localStream.getAudioTracks().length) {
        console.log('[Visualizer] 오디오 트랙이 없어 시각화를 시작할 수 없습니다.');
        return;
    }

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const visualize = () => {
        if (!analyser) return;

        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const value = (dataArray[i] - 128) / 128;
            sum += value * value;
        }
        const rms = Math.sqrt(sum / bufferLength);
        
        // audioLevel 값을 더 부드럽게 업데이트
        audioLevel.value = Math.max(rms, audioLevel.value * 0.8);

        visualizerFrameId = requestAnimationFrame(visualize);
    };

    visualize();
    console.log('[Visualizer] 오디오 시각화가 설정되었습니다.');
};


// --- WebRTC 소켓 핸들러 등록 ---
const registerWebRTCHandlers = () => { 

    // 방에 있는 다른 사용자 목록을 수신 (join 후에 서버가 보내줌)
    socket.on('webrtc:all-users', (payload: { users: string[] }) => {
        // WebRTC가 활성화된 상태에서만 로직 실행
        if (!isWebRTCActive.value) return;

        const otherUsers = payload.users.filter(id => id !== socket.id);
        if (otherUsers.length > 0) {
            // 방에 다른 사용자가 있으면, 그 중 첫 번째 사용자를 대상으로 통화 시작
            targetSocketId = otherUsers[0];
            console.log(`[WebRTC] 다른 사용자(${targetSocketId})를 발견하여 연결을 시작합니다.`);
            createPeerConnection(true); // 내가 Caller가 되어 Offer를 보냄
        } else {
            // 방에 나 혼자 있으면, 다른 사용자가 들어오기를 기다림
            console.log('[WebRTC] 방에 다른 사용자가 없습니다. 대기합니다.');
        }
    });

    // 상대방이 나갔다는 알림을 수신
    socket.on('webrtc:user-left', (payload: { sid: string }) => {
        console.log(`[WebRTC] 상대방(${payload.sid})이(가) 나갔습니다. 연결을 종료합니다.`);
        if (targetSocketId === payload.sid) {
            stopWebRTC();
        }
    });
    
    // Offer 수신
    socket.on('webrtc:offer', async (payload) => {
        // WebRTC가 활성화 상태이고, 아직 특정 상대와 연결되지 않았을 때만 Offer를 처리
        if (!isWebRTCActive.value || targetSocketId) {
            console.log('[WebRTC] 수신된 Offer를 무시합니다. 상태:', { active: isWebRTCActive.value, hasTarget: !!targetSocketId });
            return;
        }

        console.log('[WebRTC] Offer를 수신했으며, Answer를 생성합니다.');
        isWebRTCConnecting.value = true;
        targetSocketId = payload.from; 

        try {
            // 1. Peer Connection 생성 (수신자 역할)
            // startWebRTC에서 이미 미디어 스트림은 준비되었으므로 바로 연결 절차 시작
            createPeerConnection(false); 
            
            // 2. Offer 설정 및 Answer 생성
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                console.log('[WebRTC] Answer를 전송합니다.');
                socket.emit('webrtc:answer', {
                    target: targetSocketId,
                    sdp: peerConnection.localDescription,
                    from: socket.id,
                    roomId: String(selectedProjectId.value)
                });
            }
        } catch (error) {
            console.error('[WebRTC] Offer 처리 실패:', error);
            stopWebRTC();
        } finally {
            isWebRTCConnecting.value = false;
        }
    });

    // Answer 수신
    socket.on('webrtc:answer', async (payload) => {
        if (peerConnection && peerConnection.signalingState === 'have-local-offer') {
            console.log('[WebRTC] Answer 수신 및 설정');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            isWebRTCActive.value = true;
        }
    });

    // ICE Candidate 수신
    socket.on('webrtc:ice-candidate', (payload) => {
        if (peerConnection) {
            console.log('[WebRTC] ICE Candidate 추가');
            peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate))
                .catch(e => console.error('Error adding received ice candidate:', e));
        }
    });
};

const initializeSocket = () => {
  socket = io('http://localhost:3000');

  socket.on('connect', () => {
    console.log('Socket.IO 연결 성공!');
    if (user.value) {
      socket.emit('user:online', user.value.id);
    }
    if (selectedProjectId.value) {
        joinRooms(selectedProjectId.value);
    }
  });

  socket.on('disconnect', () => {
      console.log('Socket.IO 연결 해제됨.');
      stopWebRTC();
  });

  socket.on('new_message', (message: ChatMessage) => {
    if (message.projectId !== selectedProjectId.value) return;

    if (message.tempId) {
      const index = messages.value.findIndex(m => m.id === message.tempId);
      if (index !== -1) {
        messages.value[index] = message;
        return;
      }
    }
    
    messages.value.push(message);
    scrollToBottom();
  });

  socket.on('user:online-list', (userIds: string[]) => {
    onlineUserIds.value = userIds;
  });

  // 노트 내용 실시간 업데이트 수신
  socket.on('note:content', (payload: { roomId: string; content: string }) => {
    if (payload.roomId === String(selectedProjectId.value)) {
        noteContent.value = payload.content;
    }
  });

  registerWebRTCHandlers();
}


// --- 생명주기 훅 ---
onMounted(() => {
  fetchTeams();
  initializeSocket();
  scrollToBottom();
});

onUnmounted(() => { 
    stopWebRTC();
    if (socket) {
      if (user.value) {
        socket.emit('user:offline', user.value.id);
      }
      socket.disconnect();
    }
})
</script>

<style scoped>
/* 디스코드 레이아웃 스타일 */
.team-room-layout {
  display: flex;
  height: calc(100vh - 130px); /* 화면 높이 - Navbar 높이 */
  padding-top: 0px;
  background-color: #f0f4f8; /* 배경색 */
  color: #333;
}

/* 1. 팀 사이드바 스타일 */
.team-sidebar {
  width: 250px;
  background-color: #e2e8f0; /* 밝은 회색 */
  padding: 15px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  flex-shrink: 0;
}

.team-sidebar h2 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #1a1a1a;
  border-bottom: 1px solid #c0c0c0;
  padding-bottom: 10px;
}

.team-list {
  list-style: none;
  padding: 0;
}

.team-item {
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  background-color: #ffffff;
  font-weight: 500;
  border-left: 4px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-item:hover {
  background-color: #d1d9e2;
}

.team-item.is-active {
  background-color: #1a73e8;
  color: white;
  border-left-color: #0d47a1;
  font-weight: bold;
}

/* 2. 채팅 메인 스타일 */
.chat-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-width: 0;
}

.chat-placeholder {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  color: #666;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative; 
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 탭 버튼 스타일 */
.tab-buttons button {
  padding: 8px 15px;
  border: none;
  background-color: #f0f4f8;
  color: #333;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tab-buttons button.active {
  background-color: #1a73e8;
  color: white;
  font-weight: 600;
}

.tab-buttons button:hover:not(.active) {
    background-color: #e2e8f0;
}

.tab-content {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0; /* flex 버그 방지 */
}

/* 채팅 내용 */
.chat-content {
    min-height: 0;
}

.message-list {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-item {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.95rem;
  display: flex; /* Flexbox 레이아웃 */
  gap: 8px; /* 이름과 내용 사이 간격 */
}

.message-author {
    font-weight: bold;
}

.message-item:not(.my-message) {
  align-self: flex-start;
  background-color: #e2e8f0;
  color: #1a1a1a;
}

.my-message {
  align-self: flex-end;
  background-color: #1a73e8;
  color: white;
}

.my-message .message-author {
    color: white;
}

.message-content {
    text-align: start;
}

.ai-message {
  align-self: flex-start;
  background-color: #f0f9ff; /* AI 메시지 배경색 */
  border-left: 4px solid #1a73e8; /* AI 메시지 강조선 */
  max-width: 85%;
}

.ai-message .message-author {
  color: #0d47a1; /* AI Assistant 이름 색상 */
}

.ai-message :deep(p) {
  margin: 0;
}

.ai-message :deep(pre) {
  background-color: #e2e8f0;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 입력 영역 */
.input-area {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
  flex-shrink: 0;
}

.input-area input {
  flex-grow: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
  background-color: #f9f9f9;
  color: #333;
  font-size: 1rem;
}

.input-area button {
  padding: 12px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.input-area button:hover:not(:disabled) {
  background-color: #1e8e3e;
}

.input-area button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

/* 📝 공유 메모장 스타일 (단일 창 에디터) */
.note-content {
    padding: 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.note-editor-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-grow: 1;
    min-height: 0;
}

.note-toolbar {
    display: flex;
    gap: 5px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e0e0e0;
}

.note-toolbar button {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #333;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.note-toolbar button:hover {
    background-color: #e9ecef;
}

.note-toolbar .toggle-preview-btn {
    margin-left: auto; /* 오른쪽 끝으로 이동 */
    background-color: #1a73e8;
    color: white;
    border-color: #1a73e8;
}
.note-toolbar .toggle-preview-btn:hover {
    background-color: #1669c1;
}

/* 편집/미리보기 뷰 */
.editor-view, .preview-view {
    flex-grow: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.note-input {
    width: 100%;
    height: 100%; /* 부모에 맞춰 가득 채움 */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    font-family: monospace;
    font-size: 1rem;
    line-height: 1.5;
    background-color: #f9f9f9;
    color: #333;
    flex-grow: 1; /* 편집창이 남은 공간을 채우도록 */
}

.note-preview {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow-y: auto;
    padding: 10px;
}

.note-preview :deep(h1), 
.note-preview :deep(h2),
.note-preview :deep(h3) {
    color: #1a1a1a;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3rem;
}

.note-preview :deep(p) {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.note-status {
    text-align: center;
    padding: 20px;
    color: #666;
}

/* 화상 채팅 탭 스타일 */
.video-content {
    justify-content: center;
    align-items: center;
    padding: 20px;
    flex-grow: 1;
    min-height: 0;
    display: flex; /* 내부 요소 정렬 */
    flex-direction: column;
}

.video-streams-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative; /* 버튼 배치를 위한 상대 위치 */
    gap: 10px; /* 비디오와 버튼 사이 간격 줄임 */
}

.video-streams {
    display: flex;
    gap: 20px;
    justify-content: center;
    width: 100%;
    max-width: 900px;
    position: relative; 
    flex-wrap: wrap; 
}

.local-video-container, .remote-video-container {
    flex: 1;
    min-width: 300px; 
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    position: relative;
}

.local-video, .remote-video {
    width: 100%;
    height: auto;
    min-height: 200px;
    background-color: #000;
}

.video-label {
    position: absolute;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px 10px;
    margin: 0;
    width: 100%;
    text-align: center;
    font-size: 0.9rem;
}

/* 💡 [수정] 제어 버튼 스타일 */
.control-buttons {
    display: flex;
    gap: 15px;
    z-index: 20;
    padding-top: 10px; /* 비디오 프레임과의 간격 확보 */
    /* 중앙 정렬 */
    align-self: center; 
    /* video-streams-wrapper의 자식으로 배치되어, absolute가 아님 */
}

.control-buttons button {
    padding: 10px 20px;
    border: none;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    background-color: #6c757d; 
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* On 상태의 디자인 (켜져 있을 때) */
.control-buttons button.on {
    background-color: #dc3545; /* 빨간색으로 변경하여 비활성화/끄기 상태를 강조 (이전 로직과의 일관성을 위해) */
}

.control-buttons button:hover {
    filter: brightness(1.2);
}

/* 멤버 사이드바 스타일 */
.members-sidebar {
  width: 220px;
  background-color: #e2e8f0;
  padding: 15px;
  overflow-y: auto;
  flex-shrink: 0;
  border-left: 1px solid #d1d9e2;
}

.members-sidebar h2 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #1a1a1a;
  border-bottom: 1px solid #c0c0c0;
  padding-bottom: 10px;
}

.member-list {
  list-style: none;
  padding: 0;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.member-item:hover {
  background-color: #d1d9e2;
}

.online-status {
  font-size: 1.2rem;
  margin-right: 10px;
  color: #9e9e9e; /* 오프라인 기본 색상 */
}

.online-status.online {
  color: #28a745; /* 온라인 색상 */
}

.member-name {
  font-weight: 500;
  color: #333;
}

.status {
  color: #666;
  text-align: center;
  margin-top: 20px;
}
</style>