<script setup lang="ts">
import { ref } from 'vue'
import LoginModal from './components/LoginModal.vue'
import SignupModal from './components/SignupModal.vue'

const showLoginModal = ref(false)
const showSignupModal = ref(false)

const openLoginModal = () => {
  showLoginModal.value = true
}

const openSignupModal = () => {
  showSignupModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const closeSignupModal = () => {
  showSignupModal.value = false
}

const switchToSignup = () => {
  showLoginModal.value = false
  showSignupModal.value = true
}

const switchToLogin = () => {
  showSignupModal.value = false
  showLoginModal.value = true
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="nav-left">
        <router-link to="/" class="nav-logo">SHIPPY</router-link>
        <div class="nav-menu">
          <router-link to="/projects" class="nav-link">프로젝트</router-link>
          <a href="#" class="nav-link">개발자</a>
          <a href="#" class="nav-link">기업</a>
          <a href="#" class="nav-link">도움말</a>
        </div>
      </div>
      
      <div class="nav-center">
        <div class="search-box">
          <input type="text" placeholder="프로젝트나 기술을 검색하세요..." class="search-input">
          <button class="search-btn">🔍</button>
        </div>
      </div>
      
      <div class="nav-right">
        <button class="btn-project-register">프로젝트 등록</button>
        <button class="btn-login" @click="openLoginModal">로그인</button>
        <button class="btn-signup" @click="openSignupModal">회원가입</button>
      </div>
    </div>
  </nav>

  <router-view />

  <LoginModal 
    :isOpen="showLoginModal"
    @close="closeLoginModal"
    @switchToSignup="switchToSignup"
  />
  
  <SignupModal 
    :isOpen="showSignupModal"
    @close="closeSignupModal"
    @switchToLogin="switchToLogin"
  />
</template>

<style>
/* 전체 페이지 스타일 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

/* 네비게이션 바 스타일 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #1a1a1a;
}

.nav-center {
  flex: 1;
  max-width: 400px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 0.9rem;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1a1a1a;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
}

.search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.search-btn:hover {
  background: #f0f0f0;
}

.nav-right {
  display: flex;
  gap: 1rem;
}

.btn-project-register, .btn-login, .btn-signup {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-project-register {
  background: #1a1a1a;
  color: white;
}

.btn-project-register:hover {
  background: #333;
}

.btn-login {
  background: transparent;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
}

.btn-login:hover {
  background: #f5f5f5;
}

.btn-signup {
  background: #1a1a1a;
  color: white;
}

.btn-signup:hover {
  background: #333;
}

/* 반응형 */
@media (max-width: 1024px) {
  .nav-menu {
    display: none;
  }
  
  .nav-center {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
    padding: 15px 20px;
  }
  
  .nav-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .nav-center {
    width: 100%;
    max-width: none;
  }
  
  .nav-right {
    width: 100%;
    justify-content: center;
  }
}
</style>