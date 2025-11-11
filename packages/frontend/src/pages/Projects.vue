<template>
  <div class="container">
    <h1>프로젝트 목록</h1>

    <div class="filters">
      <!-- Tech Stack Filter -->
      <div class="filter-group">
        <label>기술 스택:</label>
        <div class="multiselect" @click="toggleDropdown('tech')">
          <div class="selected-items">
            <span v-if="techStackFilter.length === 0" class="placeholder">기술 스택 선택</span>
            <span v-else>{{ techStackFilter.join(', ') }}</span>
          </div>
          <div v-if="dropdowns.tech" class="dropdown" @click.stop>
            <label v-for="tech in techOptions" :key="tech">
              <input type="checkbox" :value="tech" v-model="techStackFilter" />
              {{ tech }}
            </label>
          </div>
        </div>
      </div>

      <!-- Positions Filter -->
      <div class="filter-group">
        <label>포지션:</label>
        <div class="multiselect" @click="toggleDropdown('pos')">
          <div class="selected-items">
            <span v-if="positionsFilter.length === 0" class="placeholder">포지션 선택</span>
            <span v-else>{{ positionsFilter.join(', ') }}</span>
          </div>
          <div v-if="dropdowns.pos" class="dropdown" @click.stop>
            <label v-for="pos in positionOptions" :key="pos">
              <input type="checkbox" :value="pos" v-model="positionsFilter" />
              {{ pos }}
            </label>
          </div>
        </div>
      </div>

      <!-- Progress Method Filter -->
      <div class="filter-group">
        <label>진행 방식:</label>
        <select v-model="progressMethodFilter">
          <option value="">전체</option>
          <option value="online">온라인</option>
          <option value="offline">오프라인</option>
        </select>
      </div>
    </div>

    <div class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card" @click="goToDetail(project.id)">
        <h2>{{ project.title }}</h2>
        <p class="description">{{ project.description }}</p>
        <div class="tech-stack">
          <span v-for="tech in project.techStack" :key="tech" class="tech-item">{{ tech }}</span>
        </div>
        <div class="project-footer">
          <span>작성자: {{ project.owner.name }}</span>
          <span>마감일: {{ new Date(project.deadline).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const projects = ref([]);
const router = useRouter();

// Filter states
const techStackFilter = ref([]);
const positionsFilter = ref([]);
const progressMethodFilter = ref('');

// Dropdown states
const dropdowns = ref({ tech: false, pos: false });

// Filter options
const techOptions = ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Java'];
const positionOptions = ['Frontend', 'Backend', 'Full-stack', 'Designer', 'PM'];

const toggleDropdown = (type) => {
  if (type === 'tech') dropdowns.value.tech = !dropdowns.value.tech;
  if (type === 'pos') dropdowns.value.pos = !dropdowns.value.pos;
};

const fetchProjects = async () => {
  try {
    const params = new URLSearchParams();
    if (techStackFilter.value.length > 0) params.append('techStack', techStackFilter.value.join(','));
    if (positionsFilter.value.length > 0) params.append('positions', positionsFilter.value.join(','));
    if (progressMethodFilter.value) params.append('progressMethod', progressMethodFilter.value);

    const response = await axios.get(`/api/projects?${params.toString()}`);
    projects.value = response.data;
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
  }
};

onMounted(() => {
  fetchProjects();
});

watch([techStackFilter, positionsFilter, progressMethodFilter], () => {
  fetchProjects();
}, { deep: true });

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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  align-items: flex-start;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
}

.multiselect {
  position: relative;
  min-width: 200px;
  cursor: pointer;
}

.selected-items {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.placeholder {
  color: #888;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown label {
  display: block;
  padding: 0.5rem;
  font-weight: normal;
}

.dropdown label:hover {
  background: #f0f0f0;
}

.dropdown input {
  margin-right: 0.5rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
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
</style>
