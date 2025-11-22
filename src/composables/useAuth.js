import { ref } from 'vue'
import { sendVerificationEmail, generateVerificationCode } from '../utils/email'

export const useAuth = () => {
  const currentCode = ref('')
  const codeExpiry = ref(null)
  const isLoading = ref(false)

  const sendCode = async (email, userName = '') => {
    isLoading.value = true
    
    try {
      const code = generateVerificationCode()
      currentCode.value = code
      codeExpiry.value = Date.now() + 10 * 60 * 1000

      console.log('🔐 Generatsiya qilingan kod:', code)

      const result = await sendVerificationEmail(email, code, userName)
      
      isLoading.value = false
      return result

    } catch (error) {
      console.error('❌ Error:', error)
      isLoading.value = false
      return {
        success: false,
        message: 'Kutilmagan xatolik!'
      }
    }
  }

  const verifyCode = (inputCode) => {
    if (Date.now() > codeExpiry.value) {
      return {
        success: false,
        message: 'Kod muddati tugagan!'
      }
    }

    if (inputCode === currentCode.value) {
      return {
        success: true,
        message: 'Tasdiqlash muvaffaqiyatli!'
      }
    } else {
      return {
        success: false,
        message: 'Noto\'g\'ri kod!'
      }
    }
  }

  return {
    sendCode,
    verifyCode,
    isLoading,
    currentCode
  }
}