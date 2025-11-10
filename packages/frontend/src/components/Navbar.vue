<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

import SignupModal from '../components/SignupModal.vue'
import LoginModal from '../components/LoginModal.vue'

// Status of modals
const showLoginModal = ref(false)
const showSignupModal = ref(false)

// Use auth composable
const { isAuthenticated, user, clearAuth } = useAuth()

// Open/close/switch modals
const openLoginModal = () => {
  showLoginModal.value = true
  showSignupModal.value = false
}

const openSignupModal = () => {
  showSignupModal.value = true
  showLoginModal.value = false
}

const closeModals = () => {
  showLoginModal.value = false
  showSignupModal.value = false
}

const switchToLogin = () => {
  showLoginModal.value = true
  showSignupModal.value = false
}

const switchToSignup = () => {
  showSignupModal.value = true
  showLoginModal.value = false
}

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    clearAuth()
    alert('로그아웃 되었습니다.')
  }
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="nav-left">
        <router-link to="/" class="nav-logo">SHIPPY</router-link>
        <div class="nav-menu">
          <router-link to="/projects" class="nav-link">프로젝트</router-link>
          <router-link v-if="isAuthenticated" to="/team-room" class="nav-link chat-link">팀룸</router-link>
          <router-link v-if="isAuthenticated" to="/recommend" class="nav-link recommend-link">추천</router-link>
          </div>
      </div>

      <div class="nav-center">
        <div class="search-box">
          <input type="text" placeholder="프로젝트나 기술을 검색하세요..." class="search-input">
          <button class="search-btn">🔍</button>
        </div>
      </div>

      <div class="nav-right">
        <router-link to="/projects/new" class="btn-project-register">프로젝트 등록</router-link>
        
        <!-- 로그인 상태가 아닐 때 -->
        <template v-if="!isAuthenticated">
          <button class="btn-login" @click="openLoginModal">로그인</button>
          <button class="btn-signup" @click="openSignupModal">회원가입</button>
        </template>
        
        <!-- 로그인 상태일 때 -->
        <template v-else>
          <router-link to="/my-applications" class="nav-link my-applications-link">내 지원 목록</router-link>
          <router-link to="/profile" class="nav-link my-profile-link">
            내 프로필
            <span v-if="user" :class="['status-indicator', user.status]"></span>
          </router-link>
          <button class="btn-logout" @click="handleLogout">로그아웃</button>
        </template>
      </div>
    </div>
  </nav>

  <!-- 회원 모달 -->
  <LoginModal :isOpen="showLoginModal" @close="closeModals" @switchToSignup="switchToSignup" />
  <SignupModal :isOpen="showSignupModal" @close="closeModals" @switchToLogin="switchToLogin" />
</template>

<style scoped>
.my-applications-link {
  text-decoration: none;
  color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.my-applications-link:hover {
  background-color: #f0f0f0;
}

.my-profile-link {
  text-decoration: none;
  color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.my-profile-link:hover {
  background-color: #f0f0f0;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 5px;
}

.status-indicator.온라인 {
  background-color: #28a745; /* green */
}

.status-indicator.오프라인 {
  background-color: #6c757d; /* grey */
}

.status-indicator.다른-용무-중 {
  background-color: #ffc107; /* yellow */
}

/* navbar 관련 스타일 (App.vue에서 잘라내어 붙여넣기) */
</style>
