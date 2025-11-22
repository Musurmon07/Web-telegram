
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="logo">
        <svg viewBox="0 0 240 240">
          <path d="M92,75L92,165L152,120L92,75Z"/>
        </svg>
      </div>
      <h2>Ro'yxatdan o'tish</h2>
      <p class="subtitle">Yangi hisob yaratish uchun ma'lumotlaringizni kiriting</p>
      
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Davlat</label>
          <select v-model="formData.country" required>
            <option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ism</label>
          <input 
            type="text" 
            v-model="formData.firstName" 
            placeholder="Ismingiz"
            :disabled="isLoading"
            required
          />
        </div>

        <div class="form-group">
          <label>Familiya</label>
          <input 
            type="text" 
            v-model="formData.lastName" 
            placeholder="Familiyangiz"
            :disabled="isLoading"
            required
          />
        </div>

        <div class="form-group">
          <label>Email manzil</label>
          <input 
            type="email" 
            v-model="formData.email" 
            placeholder="example@mail.com"
            :disabled="isLoading"
            required
          />
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Yuborilmoqda...' : 'Davom etish' }}
        </button>
      </form>

      <div class="switch-mode">
        Hisobingiz bormi? 
        <router-link to="/login" class="link">
          Kirish
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { sendCode, isLoading } = useAuth()

const formData = reactive({
  country: 'Uzbekistan',
  firstName: '',
  lastName: '',
  email: ''
})

const countries = [
  'Uzbekistan',
  'United States',
  'United Kingdom',
  'Russia',
  'Kazakhstan',
  'Turkey',
  'Germany',
  'France',
  'Japan',
  'South Korea'
]

const message = ref('')
const messageType = ref('error')

const handleSubmit = async () => {
  if (!formData.firstName || !formData.lastName || !formData.email) {
    message.value = 'Barcha maydonlarni to\'ldiring!'
    messageType.value = 'error'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    message.value = 'Noto\'g\'ri email format!'
    messageType.value = 'error'
    return
  }

  message.value = ''
  
  const result = await sendCode(formData.email, formData.firstName)
  
  if (result.success) {
    console.log('✅ Kod yuborildi:', result.code)
    router.push({
      name: 'Verify',
      query: { 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        mode: 'signup'
      }
    })
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
}
</script>

<style scoped>
/* Login.vue dagi barcha style shu yerda ham */
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
  font-size: 28px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: #54a9eb;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

input, select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  outline: none;
}

input:focus, select:focus {
  border-color: #54a9eb;
  box-shadow: 0 0 0 3px rgba(84, 169, 235, 0.1);
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
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

.switch-mode {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.link {
  color: #54a9eb;
  font-weight: 600;
  text-decoration: underline;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>