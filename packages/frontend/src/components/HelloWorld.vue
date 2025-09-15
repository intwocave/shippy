<script setup lang="ts">
import { ref } from 'vue'

// 인기 프로젝트 샘플 데이터
const popularProjects = ref([
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
  }
])
</script>

<template>
  <div class="shippy-main">
    <header class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">SHIPPY</h1>
        <p class="hero-subtitle">프로젝트 팀원을 찾는 가장 쉬운 방법</p>
        <div class="hero-buttons">
          <router-link to="/projects" class="btn-secondary">프로젝트 둘러보기</router-link>
        </div>
      </div>
    </header>

    <section class="projects-section">
      <div class="container">
        <h2 class="section-title">인기 프로젝트</h2>
        <div class="projects-grid">
          <div 
            v-for="project in popularProjects" 
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
            <button class="btn-apply">지원하기</button>
          </div>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">카테고리</h2>
        <div class="category-grid">
          <div class="category-card">
            <h3>웹 개발</h3>
            <p>React, Vue, Angular</p>
          </div>
          <div class="category-card">
            <h3>모바일 앱</h3>
            <p>React Native, Flutter</p>
          </div>
          <div class="category-card">
            <h3>AI/ML</h3>
            <p>머신러닝, 딥러닝</p>
          </div>
          <div class="category-card">
            <h3>게임 개발</h3>
            <p>Unity, Unreal Engine</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.shippy-main {
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 헤더 섹션 */
.hero-section {
  padding: 0;
  text-align: center;
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px; /* 패딩 조정 */
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 3rem;
  color: #666;
  font-weight: 400;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 14px 28px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
  text-decoration: none; /* router-link 스타일링 */
  display: inline-block; /* router-link 스타일링 */
}

.btn-primary {
  background: #1a1a1a;
  color: white;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: transparent;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

/* 컨테이너 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 프로젝트 섹션 */
.projects-section {
  padding: 80px 0;
  background: #fafafa;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #1a1a1a;
  font-weight: 600;
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
}

.project-card:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.project-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.project-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
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
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.9rem;
}

.btn-apply:hover {
  background: #333;
}

/* 카테고리 섹션 */
.categories-section {
  padding: 80px 0;
  background: white;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  text-align: center;
  padding: 2rem 1rem;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.category-card:hover {
  background: #f0f0f0;
  border-color: #e0e0e0;
}

.category-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
  font-weight: 600;
}

.category-card p {
  color: #666;
  font-size: 0.9rem;
}
</style>