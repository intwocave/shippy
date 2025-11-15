<template>
  <div class="container">
    <h1>내 프로필</h1>
    <div v-if="user" class="profile-card">
      <div class="profile-item">
        <label>이름:</label>
        <span>{{ user.name }}</span>
      </div>
      <div class="profile-item">
        <label>이메일:</label>
        <span>{{ user.email }}</span>
      </div>
      <div class="profile-item">
        <label>MBTI:</label>
        <div v-if="!isEditing">
          <span>{{ user.personality || '아직 등록되지 않았습니다.' }}</span>
          <button @click="startEditing">수정</button>
        </div>
        <div v-else>
          <input v-model="editablePersonality" placeholder="MBTI를 입력하세요" />
          <button @click="savePersonality">저장</button>
          <button @click="cancelEditing">취소</button>
        </div>
      </div>
      <div class="profile-item">
        <label>상태:</label>
        <div v-if="!isEditingStatus">
          <span>{{ user.status || '오프라인' }}</span>
          <button @click="startEditingStatus">수정</button>
        </div>
        <div v-else>
          <select v-model="editableStatus">
            <option value="온라인">온라인</option>
            <option value="오프라인">오프라인</option>
            <option value="다른 용무 중">다른 용무 중</option>
          </select>
          <button @click="saveStatus">저장</button>
          <button @click="cancelEditingStatus">취소</button>
        </div>
      </div>
      <div class="profile-item skill-item">
        <label>기술 스택 (AI 추출):</label>
        <div v-if="parsedSkills.length > 0" class="skill-list">
          <span v-for="skill in parsedSkills" :key="skill" class="skill-tag">
            {{ skill }}
          </span>
        </div>
        <span v-else>자기소개 작성 후 저장하면 기술 스택이 추출됩니다.</span>
      </div>
      <div class="profile-item bio-item">
        <label>자기소개:</label>
        <div v-if="!isEditingBio">
          <span class="bio-text">{{ user.bio || '아직 등록되지 않았습니다.' }}</span>
          <button @click="startEditingBio">수정</button>
        </div>
        <div v-else>
          <textarea v-model="editableBio" placeholder="자기소개를 입력하세요"></textarea>
          <button @click="saveBio" :disabled="isSavingBio">
            {{ isSavingBio ? '저장 중 (AI 분석 중)...' : '저장' }}
          </button>
          <button @click="cancelEditingBio" :disabled="isSavingBio">취소</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>프로필 정보를 불러오는 중...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import axios from 'axios';

const { user } = useAuth();

const isEditing = ref(false);
const editablePersonality = ref('');

const isEditingStatus = ref(false);
const editableStatus = ref('');

const isEditingBio = ref(false);
const editableBio = ref('');
const isSavingBio = ref(false); // [추가] 자기소개 저장 로딩 상태

const parsedSkills = computed(() => {
  if (!user.value?.extractedSkills) return [];
  
  try {
    // JSON 문자열을 객체로 파싱합니다.
    const skillsObject = JSON.parse(user.value.extractedSkills);
    // [ "기술명: 점수", ... ] 형태의 배열로 변환합니다.
    return Object.entries(skillsObject)
      .map(([skill, score]) => `${skill}: ${Number(score).toFixed(1)}`);
  } catch (e) {
    console.error("Failed to parse extracted skills JSON:", e);
    return [];
  }
});

watch(user, (newUser) => {
  if (newUser) {
    editablePersonality.value = newUser.personality || '';
    editableStatus.value = newUser.status || '오프라인';
    editableBio.value = newUser.bio || '';
  }
}, { immediate: true });

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editablePersonality.value = user.value.personality || '';
};

const savePersonality = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put('/api/users/me/personality', 
      { personality: editablePersonality.value }, 
      { headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (user.value) {
        user.value.personality = response.data.personality;
    }

    isEditing.value = false;
    alert('MBTI가 성공적으로 업데이트되었습니다.');
  } catch (error) {
    console.error('MBTI 업데이트 실패:', error);
    alert('MBTI 업데이트에 실패했습니다.');
  }
};

const startEditingStatus = () => {
  isEditingStatus.value = true;
};

const cancelEditingStatus = () => {
  isEditingStatus.value = false;
  editableStatus.value = user.value.status || '오프라인';
};

const saveStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put('/api/users/me/status', 
      { status: editableStatus.value }, 
      { headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (user.value) {
        user.value.status = response.data.status;
    }

    isEditingStatus.value = false;
    alert('상태가 성공적으로 업데이트되었습니다.');
  } catch (error) {
    console.error('상태 업데이트 실패:', error);
    alert('상태 업데이트에 실패했습니다.');
  }
};

const startEditingBio = () => {
  isEditingBio.value = true;
};

const cancelEditingBio = () => {
  isEditingBio.value = false;
  editableBio.value = user.value.bio || '';
};

const saveBio = async () => {
  isSavingBio.value = true; //  [수정] 저장 시작 시 로딩 상태 활성화
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put('/api/users/me/bio', 
      { bio: editableBio.value }, 
      { headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (user.value) {
        user.value.bio = response.data.bio;
        // [수정] 백엔드에서 AI 추출한 extractedSkills도 함께 응답받아 업데이트
        user.value.extractedSkills = response.data.extractedSkills; 
    }

    isEditingBio.value = false;
    alert('자기소개가 성공적으로 업데이트되었습니다.');
  } catch (error) {
    console.error('자기소개 업데이트 실패:', error);
    alert('자기소개 업데이트에 실패했습니다.');
  } finally {
    isSavingBio.value = false; //  [수정] 저장 완료/실패 시 로딩 상태 비활성화
  }
};

</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  color: #333; /* 기본 텍스트 색상 설정 */
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-item label {
  font-weight: bold;
  width: 80px;
}

.profile-item span {
  flex-grow: 1;
}

.profile-item button {
  margin-left: auto;
  padding: 0.4rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
  color: #333;
}

.profile-item input,
.profile-item select,
.profile-item textarea {
  flex-grow: 1;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
}

.bio-item {
  align-items: flex-start; /* 상단 정렬 */
}

.bio-text {
  white-space: pre-wrap; /* 줄바꿈 및 공백 유지 */
  line-height: 1.5;
}

textarea {
  height: 100px; /* 높이 조절 */
  resize: vertical; /* 수직으로만 크기 조절 가능 */
}


/* Stile per i pulsanti Salva e Annulla */
.profile-item > div > button {
    margin-left: 0.5rem;
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: white;
}

.profile-item > div > button:first-of-type {
    background-color: #28a745; /* Verde per Salva */
}

.profile-item > div > button:last-of-type {
    background-color: #6c757d; /* Grigio per Annulla */
}

.skill-item {
  align-items: flex-start;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-grow: 1;
}

.skill-tag {
  background-color: #e0f7fa; /* 연한 하늘색 배경 */
  color: #00796b; /* 진한 녹색 텍스트 */
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

</style>