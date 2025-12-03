<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>회원가입</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 이메일 회원가입 폼 -->
      <div v-if="isEmailSignup" class="modal-form email-signup-form">
        <input v-model="name" type="text" placeholder="이름" required />
        <input v-model="email" type="email" placeholder="이메일" required />
        <input v-model="password" type="password" placeholder="비밀번호" required />
        <input v-model="confirmPassword" type="password" placeholder="비밀번호 확인" required />
        <button class="submit-btn" @click="submitEmailSignup" :disabled="isLoading">
          {{ isLoading ? '가입 중...' : '회원가입' }}
        </button>
      </div>

      <div v-else class="modal-form">
        <!-- 소셜 회원가입 버튼들 -->
        <div class="social-login">
          <button class="social-btn google-btn" @click="handleSocialSignup('google')" :disabled="isLoading">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {{ isLoading ? '가입 중...' : 'Google로 회원가입' }}
          </button>

          <button class="social-btn kakao-btn" @click="handleSocialSignup('kakao')" :disabled="isLoading">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#3C1E1E"
                d="M12 3C6.48 3 2 6.48 2 10.8c0 2.52 1.6 4.8 4.08 6.16L5.2 19.2c-.2.4.2.8.6.6l2.8-1.4c.8.2 1.6.4 2.4.4 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
            </svg>
            {{ isLoading ? '가입 중...' : '카카오로 회원가입' }}
          </button>

          <button class="social-btn naver-btn" @click="handleSocialSignup('naver')" :disabled="isLoading">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#03C75A" d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" />
            </svg>
            {{ isLoading ? '가입 중...' : '네이버로 회원가입' }}
          </button>

          <button class="social-btn apple-btn" @click="handleSocialSignup('apple')" :disabled="isLoading">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#000000"
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            {{ isLoading ? '가입 중...' : 'Apple로 회원가입' }}
          </button>

          <button class="social-btn" @click="isEmailSignup = true" :disabled="isLoading">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#1A1A1A"
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            {{ isLoading ? '가입 중...' : '이메일로 회원가입' }}
          </button>
        </div>

        <div class="modal-footer">
          <p>이미 계정이 있으신가요? <a href="#" @click="switchToLogin">로그인</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'switchToLogin'])

const isLoading = ref(false)
const isEmailSignup = ref(false)

// 이메일 입력값
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// 실제 회원가입 요청
const submitEmailSignup = async () => {
  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  if (!name.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }

  isLoading.value = true
  try {
    const res = await axios.post('/api/auth/signup', {
      email: email.value,
      password: password.value,
      name: name.value,
    })

    alert('회원가입 성공!')
    closeModal()
    emit('switchToLogin') // 회원가입 후 로그인창으로 이동
  } catch (err) {
    alert('회원가입 실패: ' + (err.response?.data?.message || err.message))
  } finally {
    isLoading.value = false
  }
}

const resetSignupForm = () => {
  isEmailSignup.value = false
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

const closeModal = () => {
  emit('close')
}

const switchToLogin = () => {
  emit('switchToLogin')
}

const handleSocialSignup = async (provider) => {
  isLoading.value = true

  try {
    console.log(`${provider} 회원가입 시도`)

    // 실제 소셜 회원가입 구현
    let authUrl = ''

    switch (provider) {
      case 'google':
        authUrl = `https://accounts.google.com/oauth/authorize?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=code&scope=openid%20email%20profile`
        break
      case 'kakao':
        authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID || 'your-kakao-client-id'}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/kakao/callback')}&response_type=code`
        break
      case 'naver':
        authUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=${import.meta.env.VITE_NAVER_CLIENT_ID || 'your-naver-client-id'}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/naver/callback')}&response_type=code&state=random_state`
        break
      case 'apple':
        authUrl = `https://appleid.apple.com/auth/authorize?client_id=${import.meta.env.VITE_APPLE_CLIENT_ID || 'your-apple-client-id'}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/apple/callback')}&response_type=code&scope=name%20email`
        break
      default:
        throw new Error('지원하지 않는 소셜 회원가입입니다.')
    }

    // 새 창에서 소셜 회원가입 페이지 열기
    const popup = window.open(
      authUrl,
      'socialSignup',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    // 팝업에서 회원가입 완료 후 메시지 수신 대기
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        isLoading.value = false

        // 실제 구현에서는 서버에서 토큰을 받아와야 함
        // 여기서는 시뮬레이션
        setTimeout(() => {
          alert(`${provider} 회원가입이 완료되었습니다!`)
          closeModal()
        }, 500)
      }
    }, 1000)

  } catch (error) {
    console.error(`${provider} 회원가입 실패:`, error)
    alert(`${provider} 회원가입에 실패했습니다.`)
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-form {
  padding: 0 24px 24px;
}

/* 소셜 로그인 스타일 */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.social-btn:hover {
  border-color: #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.google-btn:hover {
  border-color: #4285F4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
}

.kakao-btn {
  background: #FEE500;
  border-color: #FEE500;
  color: #3C1E1E;
}

.kakao-btn:hover {
  background: #FDD835;
  border-color: #FDD835;
  box-shadow: 0 2px 8px rgba(253, 216, 53, 0.3);
}

.naver-btn {
  background: #03C75A;
  border-color: #03C75A;
  color: white;
}

.naver-btn:hover {
  background: #02B351;
  border-color: #02B351;
  box-shadow: 0 2px 8px rgba(3, 199, 90, 0.3);
}

.apple-btn {
  background: #000000;
  border-color: #000000;
  color: white;
}

.apple-btn:hover {
  background: #333333;
  border-color: #333333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 소셜 버튼 비활성화 상태 */
.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.social-btn:disabled:hover {
  border-color: #e0e0e0;
  box-shadow: none;
}

.modal-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.modal-footer p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.modal-footer a {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
}

.modal-footer a:hover {
  text-decoration: underline;
}

/* 이메일 회원가입 폼 스타일 */
.email-signup-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-signup-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.submit-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn:hover {
  background: #1669c1;
}
</style>
