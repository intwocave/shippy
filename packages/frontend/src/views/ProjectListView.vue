<template>
  <div class="project-list-view">
    <div class="container">
      <h1 class="page-title">전체 프로젝트</h1>
      <p class="page-description">Shippy에 등록된 모든 프로젝트를 확인하고 참여해보세요.</p>
      
      <div class="filter-section">
        <input type="text" placeholder="프로젝트 검색..." class="search-input">
        <select class="filter-select">
          <option value="">모든 기술 스택</option>
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="python">Python</option>
        </select>
        <button class="btn-search">검색</button>
      </div>

      <div class="projects-grid">
        <div 
          v-for="project in projects" 
          :key="project.id" 
          class="project-card"
        >
          <h3 class="project-title">{{ project.title }}</h3>
          <p class="project-description">{{ project.description }}</p>
          <div class="project-tech">
            <span 
              v-for="tech in project.techStack" 
              :key="tech" 
              class="tech-tag"
            >
              {{ tech }}
            </span>
          </div>
          <div class="project-meta">
            <span class="members">{{ project.members }}</span>
            <span class="deadline">{{ project.deadline }}</span>
          </div>
          <button class="btn-apply">자세히 보기</button>
        </div>
      </div>

      <div class="pagination">
        <button>&lt;</button>
        <button class="active">1</button>
        <button>2</button>
        <button>3</button>
        <button>&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 샘플 데이터 (실제로는 API 호출을 통해 가져와야 함)
const projects = ref([
  {
    id: 1,
    title: "AI 챗봇 개발 프로젝트",
    description: "고객 서비스용 AI 챗봇을 개발하는 프로젝트입니다.",
    techStack: ["Python", "OpenAI", "FastAPI", "React"],
    members: "3/5명",
    deadline: "2024-12-31"
  },
  {
    id: 2,
    title: "모바일 앱 개발",
    description: "위치 기반 소셜 네트워킹 앱을 개발합니다.",
    techStack: ["React Native", "Node.js", "MongoDB"],
    members: "2/4명",
    deadline: "2025-01-15"
  },
  {
    id: 3,
    title: "블록체인 NFT 마켓플레이스",
    description: "NFT 거래를 위한 블록체인 기반 마켓플레이스 개발",
    techStack: ["Solidity", "Web3.js", "Next.js"],
    members: "1/6명",
    deadline: "2025-02-28"
  },
  {
    id: 4,
    title: "데이터 분석 대시보드",
    description: "판매 데이터를 시각화하는 분석 대시보드를 구축합니다.",
    techStack: ["Python", "Pandas", "Plotly", "Dash"],
    members: "4/5명",
    deadline: "2024-11-30"
  },
  {
    id: 5,
    title: "사내 업무 자동화 시스템",
    description: "반복적인 사내 업무를 자동화하는 시스템을 개발합니다.",
    techStack: ["Python", "Selenium", "Google Apps Script"],
    members: "모집 완료",
    deadline: "2024-10-31"
  },
  {
    id: 6,
    title: "Vue.js 기반 포트폴리오 사이트",
    description: "Vue.js와 TypeScript를 사용하여 인터랙티브한 포트폴리오 웹사이트를 만듭니다.",
    techStack: ["Vue.js", "TypeScript", "Vite"],
    members: "1/2명",
    deadline: "2025-01-01"
  },
])
</script>

<style scoped>
.project-list-view {
  padding: 120px 0 80px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #1a1a1a;
}
.page-description {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 3rem;
}
.filter-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.search-input, .filter-select {
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  min-width: 200px;
}
.search-input {
  flex: 1;
  max-width: 400px;
}
.btn-search {
  padding: 10px 24px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}
.project-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}
.project-card:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}
.project-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}
.project-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
  flex-grow: 1;
}
.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.tech-tag {
  background: #f0f0f0;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}
.project-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #999;
}
.btn-apply {
  width: 100%;
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.95rem;
  margin-top: auto;
}
.btn-apply:hover {
  background: #333;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
}
.pagination button {
  padding: 8px 14px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}
.pagination button.active {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}
</style>