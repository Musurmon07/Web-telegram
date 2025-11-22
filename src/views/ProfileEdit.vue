<template>
  <div class="profile-edit">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <button class="back-btn" @click="handleCancel">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1>Profilni tahrirlash</h1>
        </div>
        <button 
          class="save-btn" 
          @click="handleSubmit"
          :disabled="loading || uploadingImage"
        >
          {{ loading ? 'Saqlanmoqda...' : 'Saqlash' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Profile Photo Section -->
      <div class="section">
        <h2>Profil rasmi</h2>
        <div class="photo-upload">
          <div class="avatar-container">
            <div 
              class="avatar-large"
              @click="handleImageClick"
            >
              <img v-if="imagePreview" :src="imagePreview" alt="Profile">
              <div v-else class="avatar-placeholder">
                {{ formData.firstName[0] }}{{ formData.lastName[0] }}
              </div>
              <!-- Upload Progress -->
              <div v-if="uploadingImage" class="upload-overlay">
                <div class="spinner"></div>
                <p>{{ uploadProgress }}%</p>
              </div>
            </div>
            <button
              type="button"
              class="edit-avatar-btn"
              @click="handleImageClick"
              :disabled="uploadingImage"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>
          <div class="photo-info">
            <p class="photo-desc">
              JPG, PNG yoki GIF formatida rasm yuklang. Maksimal hajm: 5MB
            </p>
            <button
              type="button"
              class="select-photo-btn"
              @click="handleImageClick"
              :disabled="uploadingImage"
            >
              {{ uploadingImage ? 'Yuklanmoqda...' : 'Rasm tanlash' }}
            </button>
            <p v-if="errors.photo" class="error-msg">{{ errors.photo }}</p>
            <p v-if="uploadSuccess" class="success-msg">✓ Rasm muvaffaqiyatli yuklandi!</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            style="display: none"
          >
        </div>
      </div>

      <!-- Personal Information -->
      <div class="section">
        <h2>Shaxsiy ma'lumotlar</h2>
        <div class="form-grid">
          <!-- First Name -->
          <div class="form-group">
            <label for="firstName">
              Ism <span class="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              v-model="formData.firstName"
              :class="['form-input', { 'error': errors.firstName }]"
              placeholder="Ismingizni kiriting"
            >
            <p v-if="errors.firstName" class="error-msg">{{ errors.firstName }}</p>
          </div>

          <!-- Last Name -->
          <div class="form-group">
            <label for="lastName">
              Familiya <span class="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              v-model="formData.lastName"
              :class="['form-input', { 'error': errors.lastName }]"
              placeholder="Familiyangizni kiriting"
            >
            <p v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</p>
          </div>

          <!-- Username -->
          <div class="form-group">
            <label for="username">
              Username <span class="required">*</span>
            </label>
            <div class="input-with-icon">
              <span class="input-icon">@</span>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                :class="['form-input', 'with-icon', { 'error': errors.username }]"
                placeholder="username"
              >
            </div>
            <p v-if="errors.username" class="error-msg">{{ errors.username }}</p>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">
              Email <span class="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              :class="['form-input', { 'error': errors.email }]"
              placeholder="email@example.com"
              disabled
            >
            <p class="field-hint">Email o'zgartirib bo'lmaydi</p>
          </div>
        </div>

        <!-- Bio -->
        <div class="form-group bio-group">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            v-model="formData.bio"
            :class="['form-input', 'bio-textarea', { 'error': errors.bio }]"
            rows="4"
            maxlength="200"
            placeholder="O'zingiz haqingizda qisqacha ma'lumot yozing..."
          ></textarea>
          <div class="bio-footer">
            <p v-if="errors.bio" class="error-msg">{{ errors.bio }}</p>
            <p v-else class="bio-hint">O'zingiz haqingizda qisqacha yozing</p>
            <span class="char-count">{{ formData.bio.length }}/200</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Mobile -->
      <div class="action-buttons">
        <button
          type="button"
          class="cancel-btn"
          @click="handleCancel"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          class="submit-btn"
          @click="handleSubmit"
          :disabled="loading || uploadingImage"
        >
          {{ loading ? 'Saqlanmoqda...' : 'Saqlash' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { useFirebase } from '../composables/useFirebase'

const router = useRouter()
const fileInput = ref(null)
const { currentUser, setUser } = useUserStore()
const { updateProfile, getUser } = useFirebase()

// ImgBB API Key - O'zingiznikini qo'ying!
const IMGBB_API_KEY = '4eae29c78f313acc97b8e9dbc80c23f2'

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  bio: '',
  photoURL: '',
  country: ''
})

const imagePreview = ref('')
const loading = ref(false)
const uploadingImage = ref(false)
const uploadProgress = ref(0)
const uploadSuccess = ref(false)
const errors = reactive({})

// Foydalanuvchi ma'lumotlarini yuklash
onMounted(async () => {
  if (!currentUser.value) {
    router.push('/login')
    return
  }

  // Firebase dan eng yangi ma'lumotlarni olish
  const result = await getUser(currentUser.value.email)
  
  if (result.success && result.data) {
    Object.assign(formData, result.data)
    imagePreview.value = result.data.photoURL || ''
  } else {
    // Agar Firebase da yo'q bo'lsa, localStorage dan olish
    Object.assign(formData, currentUser.value)
    imagePreview.value = currentUser.value.photoURL || ''
  }
})

const handleImageClick = () => {
  if (uploadingImage.value) return
  fileInput.value?.click()
}

// ImgBB ga rasm yuklash funksiyasi
const uploadToImgBB = async (file) => {
  const formDataImg = new FormData()
  formDataImg.append('image', file)

  try {
    uploadingImage.value = true
    uploadProgress.value = 0
    uploadSuccess.value = false

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formDataImg
      }
    )

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    
    if (data.success) {
      uploadSuccess.value = true
      setTimeout(() => {
        uploadSuccess.value = false
      }, 3000)
      return data.data.url
    } else {
      throw new Error('Upload failed')
    }
  } catch (error) {
    console.error('ImgBB upload error:', error)
    throw error
  } finally {
    uploadingImage.value = false
    uploadProgress.value = 0
  }
}

const handleImageChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  delete errors.photo

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.photo = 'Rasm hajmi 5MB dan oshmasligi kerak'
    return
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.photo = 'Faqat rasm fayllari qabul qilinadi'
    return
  }

  // Preview uchun local URL
  const reader = new FileReader()
  reader.onloadend = () => {
    imagePreview.value = reader.result
  }
  reader.readAsDataURL(file)

  // ImgBB ga yuklash
  try {
    const imageUrl = await uploadToImgBB(file)
    formData.photoURL = imageUrl
    console.log('✅ Rasm yuklandi:', imageUrl)
  } catch (error) {
    errors.photo = 'Rasm yuklanmadi. Qaytadan urinib ko\'ring'
    imagePreview.value = formData.photoURL // Restore old image
  }
}

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key])

  if (!formData.firstName.trim()) {
    errors.firstName = 'Ism kiritilishi shart'
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Familiya kiritilishi shart'
  }

  if (!formData.username.trim()) {
    errors.username = 'Username kiritilishi shart'
  } else if (formData.username.length < 3) {
    errors.username = 'Username kamida 3 ta belgidan iborat bo\'lishi kerak'
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    errors.username = 'Username faqat harflar, raqamlar va _ dan iborat bo\'lishi mumkin'
  }

  if (formData.bio && formData.bio.length > 200) {
    errors.bio = 'Bio 200 ta belgidan oshmasligi kerak'
  }

  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (uploadingImage.value) {
    alert('Rasm hali yuklanmoqda, iltimos kuting...')
    return
  }

  loading.value = true
  
  try {
    // Firebase Firestore ga yangilash
    const result = await updateProfile(formData.email, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      bio: formData.bio,
      photoURL: formData.photoURL,
      country: formData.country
    })

    if (result.success) {
      // localStorage ni yangilash
      setUser({
        ...currentUser.value,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        bio: formData.bio,
        photoURL: formData.photoURL,
        country: formData.country
      })

      alert('✅ Profil muvaffaqiyatli yangilandi!')
      router.push('/dashboard')
    } else {
      throw new Error(result.error || 'Xatolik yuz berdi')
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('❌ Xatolik yuz berdi: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (confirm('O\'zgarishlarni saqlamasdan chiqmoqchimisiz?')) {
    router.push('/dashboard')
  }
}
</script>



<style scoped>
.profile-edit {
  min-height: 100vh;
  background: #f0f2f5;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
  color: #707579;
}

.back-btn:hover {
  background: #f1f3f4;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.save-btn {
  padding: 10px 24px;
  background: #54a9eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #3390ec;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Content */
.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0 0 24px 0;
}

/* Photo Upload */
.photo-upload {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar-large {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.2s;
  background: linear-gradient(135deg, #54a9eb, #3390ec);
}

.avatar-large:hover {
  opacity: 0.9;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 500;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #54a9eb;
  color: white;
  border: 3px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.edit-avatar-btn:hover {
  background: #3390ec;
}

.photo-info {
  flex: 1;
}

.photo-desc {
  font-size: 14px;
  color: #707579;
  margin: 0 0 12px 0;
}

.select-photo-btn {
  padding: 10px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.select-photo-btn:hover {
  background: #f8f9fa;
  border-color: #d1d1d1;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
}

.required {
  color: #ef5350;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  outline: none;
  background: white;
}

.form-input:focus {
  border-color: #54a9eb;
  box-shadow: 0 0 0 3px rgba(84, 169, 235, 0.1);
}

.form-input.error {
  border-color: #ef5350;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #707579;
  font-size: 15px;
}

.form-input.with-icon {
  padding-left: 36px;
}

.error-msg {
  color: #ef5350;
  font-size: 13px;
  margin-top: 4px;
}

/* Bio */
.bio-group {
  grid-column: 1 / -1;
  margin-top: 24px;
}

.bio-textarea {
  resize: none;
  font-family: inherit;
}

.bio-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.bio-hint {
  font-size: 13px;
  color: #707579;
  margin: 0;
}

.char-count {
  font-size: 13px;
  color: #707579;
}

/* Action Buttons */
.action-buttons {
  display: none;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: white;
  color: #000;
  border: 1px solid #e5e5e5;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.submit-btn {
  background: #54a9eb;
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: #3390ec;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }

  .save-btn {
    display: none;
  }

  .content {
    padding: 16px 12px;
  }

  .section {
    padding: 16px;
  }

  .photo-upload {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .action-buttons {
    display: flex;
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>