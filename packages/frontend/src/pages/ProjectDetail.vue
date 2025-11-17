<template>
  <div class="container" v-if="project">
    <h1>{{ project.title }}</h1>
    <div class="project-meta">
      <span>작성자: {{ project.owner.name }}</span>
      <span>마감일: {{ new Date(project.deadline).toLocaleDateString() }}</span>
    </div>
    <div class="project-content">
      <h3>프로젝트 설명</h3>
      <p>{{ project.description }}</p>
      <h3>기술 스택</h3>
      <div class="tech-stack">
        <span v-for="tech in project.techStack" :key="tech" class="tech-item">{{ tech }}</span>
      </div>
      <h3>모집 인원</h3>
      <p>{{ project.members }}</p>
    </div>

    <div class="apply-section" v-if="isAuthenticated">
      <button @click="handleApply" :disabled="project.hasApplied || isApplying" class="apply-btn">
        <span v-if="isApplying">지원 중...</span>
        <span v-else-if="project.hasApplied">지원 완료</span>
        <span v-else>지원하기</span>
      </button>
    </div>
    <div class="apply-section" v-else>
      <p>프로젝트에 지원하려면 <router-link to="/">로그인</router-link>이 필요합니다.</p>
    </div>

    <div v-if="isOwner && applicants.length > 0" class="applicants-section">
      <h3>지원자 목록</h3>
      <ul>
        <li v-for="applicant in applicants" :key="applicant.id">
          <router-link :to="`/users/${applicant.user.id}`">{{ applicant.user.name }}</router-link>
          - {{ applicant.user.email }}
        </li>
      </ul>
    </div>

    <div v-if="isOwner" class="recommendations-section">
      <h3>프로젝트 맞춤 추천 유저</h3>
      <p v-if="isLoadingRecommendations">추천 유저 목록을 불러오는 중...</p>
      <ul v-else-if="recommendedUsers.length > 0">
        <li v-for="user in recommendedUsers" :key="user.id">
          <router-link :to="`/users/${user.id}`">{{ user.name }}</router-link>
        </li>
      </ul>
      <p v-else>아직 추천할 유저가 없습니다.</p>
    </div>

    <div class="comments-section">
      <h3>댓글</h3>
      <div v-if="isAuthenticated">
        <div class="comment-form">
          <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
          <button @click="handlePostComment">등록</button>
        </div>
      </div>
      <div v-else>
        <p>댓글을 작성하려면 <router-link to="/">로그인</router-link>이 필요합니다.</p>
      </div>

      <ul class="comment-list">
        <li v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-author">{{ comment.author.name }}</div>
          <div class="comment-content">
            <p v-if="!comment.isEditing">{{ comment.content }}</p>
            <div v-else class="comment-edit-form">
              <textarea v-model="comment.editingContent"></textarea>
              <button @click="handleUpdateComment(comment)">저장</button>
              <button @click="comment.isEditing = false">취소</button>
            </div>
          </div>
          <div class="comment-actions" v-if="isAuthenticated && user && user.id === comment.author.id">
            <button @click="toggleEdit(comment)">수정</button>
            <button @click="handleDeleteComment(comment.id)">삭제</button>
          </div>
        </li>
      </ul>
    </div>

  </div>
  <div v-else>
    <p>프로젝트를 불러오는 중...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuth } from '../composables/useAuth';
import { useComments } from '../composables/useComments';

const route = useRoute();
const router = useRouter();
const project = ref(null);
const applicants = ref([]);
const recommendedUsers = ref([]); // 👈 [추가] 추천 유저 목록 상태
const isLoadingRecommendations = ref(false); // 👈 [추가] 로딩 상태
const isApplying = ref(false);
const newComment = ref('');

const { isAuthenticated, user } = useAuth();
const projectId = Number(route.params.id);
const { comments, fetchComments, addComment, updateComment, deleteComment } = useComments(projectId);

const isOwner = computed(() => {
  return project.value && user.value && project.value.ownerId === user.value.id;
});

const fetchProject = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`/api/projects/${projectId}`, { headers });
    project.value = response.data;

    // isOwner.value가 fetchProject가 끝난 후에도 즉시 정확하게 계산되므로, 
    // watch를 사용하지 않고도 아래 로직으로 지원자 목록을 가져올 수 있습니다. (기존 로직)
    // if (isOwner.value) {
    //   fetchApplicants();
    // }
  } catch (error) {
    console.error('프로젝트 조회 실패:', error);
    alert('프로젝트를 불러오는 데 실패했습니다.');
  }
};

const fetchApplicants = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/projects/${projectId}/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    applicants.value = response.data;
  } catch (error) {
    console.error('지원자 목록 조회 실패:', error);
  }
};

const fetchRecommendedUsers = async () => { // 👈 [추가] 추천 유저 조회 함수
  if (!isOwner.value) return; 

  isLoadingRecommendations.value = true;
  try {
    const token = localStorage.getItem('token');
    // 백엔드에서 새로 추가할 엔드포인트 호출
    const response = await axios.get(`/api/projects/${projectId}/recommended-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    recommendedUsers.value = response.data;
  } catch (error) {
    console.error('추천 유저 목록 조회 실패:', error);
  } finally {
    isLoadingRecommendations.value = false;
  }
};


const handleApply = async () => {
  isApplying.value = true;
  try {
    const token = localStorage.getItem('token');
    
    await axios.post(`/api/projects/${projectId}/apply`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert('성공적으로 지원했습니다.');
    // 지원 상태를 즉시 반영하기 위해 프로젝트 정보를 다시 불러옵니다.
    fetchProject();

  } catch (error) {
    console.error('지원 실패:', error);
    alert(error.response?.data?.message || '지원에 실패했습니다.');
  } finally {
    isApplying.value = false;
  }
};

const handlePostComment = async () => {
  if (!newComment.value.trim()) return;
  try {
    await addComment(newComment.value);
    newComment.value = '';
  } catch (error) {
    console.error('댓글 등록 실패:', error);
    alert('댓글 등록에 실패했습니다.');
  }
};

const toggleEdit = (comment) => {
  comment.isEditing = !comment.isEditing;
  if (comment.isEditing) {
    comment.editingContent = comment.content;
  }
};

const handleUpdateComment = async (comment) => {
  if (!comment.editingContent.trim()) return;
  try {
    await updateComment(comment.id, comment.editingContent);
    comment.isEditing = false;
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    alert('댓글 수정에 실패했습니다.');
  }
};

const handleDeleteComment = async (commentId) => {
  if (confirm('정말로 삭제하시겠습니까?')) {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  }
};

onMounted(() => {
  fetchProject();
  fetchComments();
});

// isOwner 값이 확정되면 (user 정보 로딩 후) 지원자와 추천 유저 목록을 불러옵니다.
// fetchProject가 비동기이므로, 이 watch가 isOwner의 변경 사항을 추적하는 것이 더 안전합니다.
watch(isOwner, (newValue) => {
    if (newValue) {
        fetchApplicants();
        fetchRecommendedUsers(); // 👈 [추가] 오너일 때 추천 유저 로드
    }
}, { immediate: true });
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  color: #333; /* 텍스트 색상 추가 */
}
.project-meta {
  margin-bottom: 2rem;
  color: #666;
}
.project-meta span {
  margin-right: 1rem;
}
.project-content h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.tech-stack {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tech-item {
  background-color: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}
.apply-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  text-align: center;
}
.apply-btn {
  padding: 0.8rem 2rem;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}
.apply-btn:hover:not(:disabled) {
  background-color: #1669c1;
}
.apply-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Applicants Section Styles */
.applicants-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.applicants-section ul {
  list-style: none;
  padding: 0;
}

.applicants-section li {
  padding: 0.5rem 0;
}

/* Comments Section Styles */
.comments-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}
.comment-form textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #fff;
  color: #333;
}
.comment-form button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.comment-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}
.comment-item {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}
.comment-author {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.comment-actions {
  margin-top: 0.5rem;
}
.comment-actions button {
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #333;
  transition: background-color 0.2s;
}

.comment-actions button:hover {
  background-color: #e0e0e0;
}

.comment-edit-form textarea {
  width: 100%;
  min-height: 60px;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
}

.comment-edit-form button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.comment-edit-form button:first-of-type {
  background-color: #28a745; /* Save button - green */
}

.comment-edit-form button:last-of-type {
  background-color: #6c757d; /* Cancel button - grey */
}

/* [추가] 추천 유저 섹션 스타일 */
.recommendations-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.recommendations-section ul {
  list-style: none;
  padding: 0;
}

.recommendations-section li {
  padding: 0.5rem 0;
  border-bottom: 1px dotted #eee;
}
</style>