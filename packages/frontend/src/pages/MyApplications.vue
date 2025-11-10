<template>
  <div class="container">
    <h1>내 지원 목록</h1>
    <div v-if="applications.length > 0" class="project-grid">
      <div v-for="app in applications" :key="app.id" class="project-card" @click="goToDetail(app.project.id)">
        <h2>{{ app.project.title }}</h2>
        <p class="description">{{ app.project.description }}</p>
        <div class="tech-stack">
          <span v-for="tech in app.project.techStack" :key="tech" class="tech-item">{{ tech }}</span>
        </div>
        <div class="project-footer">
          <span>작성자: {{ app.project.owner.name }}</span>
          <span>마감일: {{ new Date(app.project.deadline).toLocaleDateString() }}</span>
        </div>
        <div class="application-status">
          <span>지원일: {{ new Date(app.createdAt).toLocaleDateString() }}</span>
          <!-- TODO: 지원 상태 (수락/거절 등) 표시 -->
        </div>
      </div>
    </div>
    <div v-else class="no-applications">
      <p>아직 지원한 프로젝트가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const applications = ref([]);
const router = useRouter();

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/');
      return;
    }

    const response = await axios.get('/api/users/me/applications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    applications.value = response.data;
  } catch (error) {
    console.error('지원 목록 조회 실패:', error);
    alert('지원한 프로젝트 목록을 불러오는 데 실패했습니다.');
  }
});

const goToDetail = (id) => {
  router.push(`/projects/${id}`);
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #333;
}
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.project-card {
  background: #fff;
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
.project-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
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
  background-color: #f0f0f0;
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
.application-status {
  font-size: 0.85rem;
  color: #1a73e8;
  margin-top: 0.5rem;
  text-align: right;
}
.no-applications {
  text-align: center;
  margin-top: 4rem;
  color: #666;
}
</style>
