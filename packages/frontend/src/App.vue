<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 현재 경로의 meta 값을 확인하여 동적으로 클래스를 반환하는 computed 속성
const layoutClass = computed(() => {
  return route.meta.fullWidth ? 'layout-full' : 'container';
});
</script>

<template>
  <div class="shippy-main">
    <Navbar />
    <main class="main-content">
      <div :class="layoutClass">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
/* 전체 페이지 스타일 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  background-color: #f8f9fa; /* 전체 배경색 추가 */
}

/* 너비 제한을 제거하여 #app이 항상 전체 너비를 차지하도록 합니다.
*/
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding-top: 80px; /* 네비게이션바 높이만큼 패딩 추가 */
  /*height: 100vh;*/
  box-sizing: border-box;
}

/* 🚨 [수정 핵심] height 대신 min-height를 사용하여 내용이 길어지면 컨테이너가 늘어나도록 합니다. */
.layout-full,
.container {
  min-height: calc(100vh - 80px);
  /* height: calc(100vh - 80px); <--- 이 줄은 제거되었습니다. */
  padding-bottom: 50px; /* 내용 아래 여백 추가 */
}

/* .container 클래스에만 너비 제한과 중앙 정렬 스타일을 적용합니다. */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: left;
}
</style>