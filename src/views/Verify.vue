<template>
  <div class="auth-page">
    <div class="auth-container">
      <button class="back-btn" @click="goBack">
        ← Orqaga
      </button>

      <div class="logo">
        <svg viewBox="0 0 240 240">
          <path d="M92,75L92,165L152,120L92,75Z" />
        </svg>
      </div>
      <h2>{{ route.query.email }}</h2>
      <p class="subtitle">Email manzilingizga 6 xonali kod yuborildi</p>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <div v-if="isVerifying" class="loading">
        <div class="spinner"></div>
        <p>Tasdiqlanyapti...</p>
      </div>

      <div class="code-inputs">
        <input v-for="(digit, index) in code" :key="index" type="text" maxlength="1" class="code-input"
          :ref="el => inputRefs[index] = el" v-model="code[index]" @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)" :disabled="isVerifying" />
      </div>

      <button @click="verify" class="btn btn-primary" :disabled="isVerifying">
        {{ isVerifying ? 'Tekshirilmoqda...' : 'Tasdiqlash' }}
      </button>

      <button @click="resendCode" class="btn btn-secondary" :disabled="isVerifying">
        Kodni qayta yuborish
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useFirebase } from '../composables/useFirebase'
import { useUserStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const { verifyCode: checkCode, sendCode } = useAuth()
const { saveUser } = useFirebase()
const { setUser } = useUserStore()

const code = reactive(['', '', '', '', '', ''])
const inputRefs = ref([])
const message = ref('')
const messageType = ref('success')
const isVerifying = ref(false)

const handleInput = (index, event) => {
  const value = event.target.value

  if (value && index < 5) {
    const nextInput = inputRefs.value[index + 1]
    if (nextInput) nextInput.focus()
  }

  if (code.every(c => c !== '')) {
    verify()
  }
}

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !code[index] && index > 0) {
    const prevInput = inputRefs.value[index - 1]
    if (prevInput) prevInput.focus()
  }
}

const verify = async () => {
  const fullCode = code.join('')

  if (fullCode.length !== 6) {
    message.value = '6 xonali kodni to\'liq kiriting!'
    messageType.value = 'error'
    return
  }

  isVerifying.value = true
  message.value = 'Tekshirilmoqda...'
  messageType.value = 'success'

  const result = checkCode(fullCode)

  if (result.success) {
    // Agar Signup bo'lsa - Firebase ga saqlash
    if (route.query.mode === 'signup') {
      const userData = {
        email: route.query.email,
        firstName: route.query.firstName,
        lastName: route.query.lastName,
        country: route.query.country
      }

      const saveResult = await saveUser(userData)

      if (saveResult.success) {
        message.value = 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!'
        messageType.value = 'success'

        // User state ga saqlash
        setUser(userData)

        // Dashboard ga yo'naltirish
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        message.value = 'Xatolik: ' + saveResult.error
        messageType.value = 'error'
        isVerifying.value = false
      }
    } else {
      // Login bo'lsa
      message.value = 'Xush kelibsiz!'
      messageType.value = 'success'

      const userData = {
        email: route.query.email
      }

      setUser(userData)

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  } else {
    message.value = result.message
    messageType.value = 'error'
    isVerifying.value = false
  }
}

const resendCode = async () => {
  code.forEach((_, index) => code[index] = '')

  const result = await sendCode(route.query.email, route.query.firstName || '')

  if (result.success) {
    message.value = 'Kod qayta yuborildi!'
    messageType.value = 'success'
    console.log('🔐 Yangi kod:', result.code)

    setTimeout(() => {
      message.value = ''
    }, 3000)
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
}

const goBack = () => {
  const mode = route.query.mode
  router.push(mode === 'signup' ? '/signup' : '/login')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.loading {
  text-align: center;
  margin: 20px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #54a9eb;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading p {
  color: #666;
  font-size: 14px;
}

.back-btn {
  background: none;
  border: none;
  color: #54a9eb;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 0;
}

.logo {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #54a9eb 0%, #3390ec 100%);
  border-radius: 50%;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo svg {
  width: 60px;
  height: 60px;
  fill: white;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 20px;
  word-break: break-all;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.code-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 30px 0;
}

.code-input {
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s;
}

.code-input:focus {
  border-color: #54a9eb;
  box-shadow: 0 0 0 3px rgba(84, 169, 235, 0.1);
}

.code-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-primary {
  background: linear-gradient(135deg, #54a9eb 0%, #3390ec 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(84, 169, 235, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(84, 169, 235, 0.5);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #54a9eb;
  border: 2px solid #54a9eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f0f7ff;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>