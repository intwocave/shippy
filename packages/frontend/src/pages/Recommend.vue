<template>
  <div class="container">
    <h1>팀원 맞춤 프로젝트 추천</h1>
    <p v-if="!isAuthenticated" class="alert-message">
      로그인 후 자기소개(프로필 페이지)를 작성하시면 맞춤 추천을 받을 수 있습니다.
    </p>

    <div v-if="isAuthenticated">
      
      <div v-if="isLoading" class="loading-status">
        <p>추천 프로젝트를 불러오는 중입니다...</p>
      </div>

      <div v-else-if="recommendations.length > 0" class="recommendations-list">
        <p class="summary-text">회원님의 자기소개 기반 추출 기술 스택에 가장 적합한 프로젝트 목록입니다.</p>
        <div class="project-grid">
          <div v-for="p in recommendations" :key="p.id" class="project-card" @click="goToDetail(p.id)">
            <h2>{{ p.title }}</h2>
            <div class="score-badge" :style="{ backgroundColor: getScoreColor(p.recommendationScore) }">
              적합도: {{ (p.recommendationScore * 100).toFixed(0) }}%
            </div>
            <p class="description">{{ p.description }}</p>
            <div class="tech-stack">
              <span v-for="tech in p.techStack" :key="tech" class="tech-item">{{ tech }}</span>
            </div>
            <div class="project-footer">
              <span>작성자: {{ p.owner.name }}</span>
              <span>마감일: {{ new Date(p.deadline).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-recommendations">
        <p>현재 조건에 맞는 추천 프로젝트가 없습니다.</p>
        <p>프로필의 자기소개를 자세히 작성하시면 더 정확한 추천을 받을 수 있습니다.</p>
        <router-link to="/profile" class="btn-profile">프로필 작성하기</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const { isAuthenticated } = useAuth();
const router = useRouter();

const recommendations = ref<any[]>([]);
const isLoading = ref(false);

interface Recommendation {
    id: number;
    title: string;
    description: string;
    techStack: string[];
    members: string;
    deadline: string;
    owner: { name: string };
    recommendationScore: number;
}

const fetchRecommendations = async () => {
  if (!isAuthenticated.value) return;

  isLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get<Recommendation[]>('/api/recommend/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    recommendations.value = response.data;
  } catch (error) {
    console.error('추천 목록 조회 실패:', error);
    recommendations.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 적합도 점수에 따라 색상을 동적으로 변경하는 함수
const getScoreColor = (score: number) => {
  const ratio = score * 100;
  if (ratio >= 80) return '#1e88e5'; // Blue (매우 높음)
  if (ratio >= 50) return '#43a047'; // Green (높음)
  if (ratio >= 20) return '#ffb300'; // Yellow (보통)
  return '#d32f2f'; // Red (낮음)
};

const goToDetail = (id: number) => {
  router.push(`/projects/${id}`);
};

onMounted(() => {
  fetchRecommendations();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  color: #333;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
}

.alert-message {
    text-align: center;
    color: #dc3545;
    font-weight: 500;
    padding: 1rem;
    border: 1px solid #dc3545;
    background: #f8d7da;
    border-radius: 4px;
    margin-bottom: 2rem;
}

.loading-status, .no-recommendations {
    text-align: center;
    padding: 4rem 0;
    color: #666;
}

.summary-text {
    margin-bottom: 1.5rem;
    font-weight: 500;
    color: #1a73e8;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  position: relative;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  color: #333;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.score-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    /* getScoreColor 함수에 의해 배경색이 동적으로 설정됨 */
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  height: 4.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-item {
  background-color: #eee;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #888;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
  margin-top: 1rem;
}

.btn-profile {
    display: inline-block;
    margin-top: 1rem;
    padding: 10px 20px;
    background-color: #1a73e8;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
}
</style>