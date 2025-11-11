<template>
  <div class="container">
    <h1>맞춤 프로젝트 추천</h1>
    <p v-if="!isAuthenticated" class="alert-message">
      로그인 후 자기소개(프로필 페이지)를 작성하시면 맞춤 추천을 받을 수 있습니다.
    </p>

    <div v-if="isAuthenticated">
      
      <div v-if="isLoading" class="loading-status">
        <p>추천 프로젝트를 불러오는 중입니다...</p>
      </div>

      <div v-else-if="recommendations.length > 0" class="recommendations-list">
        <p class="summary-text">회원님의 자기소개 기반 추출 기술 스택에 가장 적합한 프로젝트 목록입니다.</p>
        
        <div class="recommendation-section">
            <h2 class="section-title cosine-color">코사인 유사도 기반 추천</h2>
            <div class="project-grid">
                <div v-for="p in recommendations" :key="p.id + 'c'" class="project-card" @click="goToDetail(p.id)">
                    <h2>{{ p.title }}</h2>
                    <div class="score-badge" :style="{ backgroundColor: getScoreColor(p.similarityScores.cosine) }">
                        적합도: {{ (p.similarityScores.cosine * 100).toFixed(0) }}%
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

        <div class="recommendation-section">
            <h2 class="section-title jaccard-color">자카드 유사도 기반 추천</h2>
            <div class="project-grid">
                <div v-for="p in jaccardRecommendations" :key="p.id + 'j'" class="project-card" @click="goToDetail(p.id)">
                    <h2>{{ p.title }}</h2>
                    <div class="score-badge" :style="{ backgroundColor: getScoreColor(p.similarityScores.jaccard) }">
                        적합도: {{ (p.similarityScores.jaccard * 100).toFixed(0) }}%
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
        
        <div class="recommendation-section">
            <h2 class="section-title euclidean-color">유클리드 유사도 기반 추천</h2>
            <div class="project-grid">
                <div v-for="p in euclideanRecommendations" :key="p.id + 'e'" class="project-card" @click="goToDetail(p.id)">
                    <h2>{{ p.title }}</h2>
                    <div class="score-badge" :style="{ backgroundColor: getScoreColor(p.similarityScores.euclidean) }">
                        적합도: {{ (p.similarityScores.euclidean * 100).toFixed(0) }}%
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

      </div>

      <div v-else class="no-recommendations">
        <p>현재 조건에 맞는 추천 프로젝트가 없습니다.</p>
        <p>프로필의 **자기소개**를 자세히 작성하시면 더 정확한 추천을 받을 수 있습니다.</p>
        <router-link to="/profile" class="btn-profile">프로필 작성하기</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const { isAuthenticated } = useAuth();
const router = useRouter();

const recommendations = ref<any[]>([]); // 코사인 정렬된 원본 리스트
const isLoading = ref(false);

interface Recommendation {
    id: number;
    title: string;
    description: string;
    techStack: string[];
    members: string;
    deadline: string;
    owner: { name: string };
    similarityScores: {
        cosine: number;
        jaccard: number;
        euclidean: number; //  [추가]
    };
    mainScore: number;
}

//  [추가] 자카드 유사도 기준으로 재정렬된 목록
const jaccardRecommendations = computed(() => {
  if (recommendations.value.length === 0) return [];
  
  // 깊은 복사를 통해 원본 배열을 수정하지 않고 자카드 점수 기준으로 정렬
  return [...recommendations.value]
    .sort((a, b) => (b.similarityScores.jaccard || 0) - (a.similarityScores.jaccard || 0))
    .filter(p => p.similarityScores.jaccard > 0.05); 
});

// 💡 [추가] 유클리드 유사도 기준으로 재정렬된 목록
const euclideanRecommendations = computed(() => {
  if (recommendations.value.length === 0) return [];
  
  // 유클리드 유사도 점수(1/(1+거리)) 기준으로 내림차순 정렬
  return [...recommendations.value]
    .sort((a, b) => (b.similarityScores.euclidean || 0) - (a.similarityScores.euclidean || 0))
    .filter(p => p.similarityScores.euclidean > 0.05); 
});


const fetchRecommendations = async () => {
  if (!isAuthenticated.value) return;

  isLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get<Recommendation[]>('/api/recommend/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 코사인 유사도 기준으로 백엔드에서 정렬된 목록을 저장
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

/* ... (alert-message, loading-status, summary-text 기존 스타일 생략) ... */

.summary-text {
    margin-bottom: 3rem;
    font-weight: 500;
    color: #1a73e8;
    text-align: center;
}

.recommendation-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e0e0e0;
}

.section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-left: 10px;
    border-left: 4px solid;
    font-weight: 700;
}

.cosine-color {
    border-left-color: #1e88e5; /* 코사인 블루 */
}

.jaccard-color {
    border-left-color: #43a047; /* 자카드 그린 */
}

.euclidean-color {
    border-left-color: #9c27b0; /* 유클리드 퍼플 💡 [추가] */
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
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
}

/* ... (description, tech-stack, project-footer, btn-profile 기존 스타일 생략) ... */

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