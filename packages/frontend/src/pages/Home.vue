<script setup lang="ts">
import ProjectCard from '../components/ProjectCard.vue'
import CategoryCard from '../components/CategoryCard.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const popularProjects = ref([])

onMounted(async () => {
  try {
    const response = await axios.get('/api/projects/popular');
    popularProjects.value = response.data;
  } catch (error) {
    console.error('인기 프로젝트 조회 실패:', error);
  }
});
</script>

<template>
  <div style="margin-top: 50px;">
    <!-- Hero -->
    <section class="hero-section">
      <h1 class="hero-title">SHIPPY</h1>
      <p class="hero-subtitle">프로젝트 팀원을 찾는 가장 쉬운 방법</p>
      <div class="hero-buttons">
        <router-link to="/projects">
          <button class="btn-secondary">프로젝트 둘러보기</button>
        </router-link>
      </div>
    </section>

    <!-- 인기 프로젝트 -->
    <section class="projects-section">
      <div class="container">
        <h2 class="section-title">인기 프로젝트</h2>
        <div class="projects-grid">
          <ProjectCard v-for="p in popularProjects" :key="p.id" v-bind="p" />
        </div>
      </div>
    </section>

<!--
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">카테고리</h2>
        <div class="category-grid">
          <CategoryCard title="웹 개발" description="React, Vue, Angular" />
          <CategoryCard title="모바일 앱" description="React Native, Flutter" />
          <CategoryCard title="AI/ML" description="머신러닝, 딥러닝" />
          <CategoryCard title="게임 개발" description="Unity, Unreal Engine" />
        </div>
      </div>
    </section> -->
  </div>
</template>
