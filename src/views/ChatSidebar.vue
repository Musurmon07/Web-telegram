<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
    <div class="sidebar-header">
      <!-- Burger Menu -->
      <button class="menu-btn" @click="toggleProfile">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>

      <!-- Search Box -->
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input 
          type="text" 
          placeholder="Username orqali qidirish..." 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
        >
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchQuery && searchResults.length > 0" class="search-results">
      <h4>Qidiruv natijalari</h4>
      <div 
        v-for="user in searchResults" 
        :key="user.email"
        class="search-result-item"
        @click="$emit('start-chat', user)"
      >
        <div class="chat-avatar">
          <img v-if="user.photoURL" :src="user.photoURL" :alt="user.firstName">
          <div v-else class="avatar-placeholder">{{ user.firstName[0] }}</div>
        </div>
        <div class="chat-info">
          <h4>{{ user.firstName }} {{ user.lastName }}</h4>
          <p>@{{ user.username }}</p>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="searchQuery && searchResults.length === 0 && !searching" class="no-results">
      <p>Foydalanuvchi topilmadi</p>
    </div>

    <!-- Loading -->
    <div v-if="searching" class="search-loading">
      <p>Qidirilmoqda...</p>
    </div>

    <!-- Chat List -->
    <div v-if="!searchQuery" class="chat-list">
      <div 
        v-for="chat in chats" 
        :key="chat.id"
        class="chat-item"
        :class="{ active: activeChat?.id === chat.id }"
        @click="$emit('select-chat', chat)"
      >
        <div class="chat-avatar">
          <img v-if="chat.avatar" :src="chat.avatar" :alt="chat.name">
          <div v-else class="avatar-placeholder">{{ chat.name[0] }}</div>
          <div v-if="chat.isOnline" class="online-indicator"></div>
        </div>
        <div class="chat-info">
          <div class="chat-header">
            <h4>{{ chat.name }}</h4>
            <span class="chat-time">{{ chat.time }}</span>
          </div>
          <div class="chat-preview">
            <p>{{ chat.lastMessage }}</p>
            <span v-if="chat.unread" class="unread-badge">{{ chat.unread }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Profile Sidebar (Leftdan chiqadigan) -->
  <div class="profile-sidebar-overlay" :class="{ 'show': showProfile }" @click="closeProfile"></div>
  <aside class="profile-sidebar" :class="{ 'profile-open': showProfile }">
    <div class="profile-header">
      <button class="close-btn" @click="closeProfile">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      <h3>Profil</h3>
    </div>

    <div class="profile-content">
      <div class="profile-avatar-large" @click="$emit('view-full-image')">
        <img 
          v-if="currentUser?.photoURL" 
          :src="currentUser.photoURL" 
          :alt="`${currentUser.firstName} ${currentUser.lastName}`"
          class="profile-image"
        >
        <div v-else class="avatar-placeholder-large">
          {{ currentUser?.firstName?.[0] }}{{ currentUser?.lastName?.[0] }}
        </div>
      </div>

      <div class="profile-info">
        <h2>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h2>
        <p class="profile-username">@{{ currentUser?.username }}</p>
      </div>

      <div class="profile-details">
        <div class="detail-item">
          <div class="detail-icon">📧</div>
          <div class="detail-content">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ currentUser?.email }}</span>
          </div>
        </div>

        <div class="detail-item" v-if="currentUser?.country">
          <div class="detail-icon">🌍</div>
          <div class="detail-content">
            <span class="detail-label">Davlat</span>
            <span class="detail-value">{{ currentUser.country }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">ℹ️</div>
          <div class="detail-content">
            <span class="detail-label">Bio</span>
            <span class="detail-value">{{ currentUser?.bio || 'Bio qo\'shilmagan' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="action-button" @click="$emit('edit-profile')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Profilni tahrirlash
        </button>
        
        <button class="action-button logout" @click="$emit('logout')">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Chiqish
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isSidebarOpen: Boolean,
  searchQuery: String,
  searchResults: {
    type: Array,
    default: () => []
  },
  searching: Boolean,
  chats: {
    type: Array,
    default: () => []
  },
  activeChat: Object,
  currentUser: Object
})

// ✅ showProfileni local state bilan boshqaramiz
const showProfile = ref(false)

const toggleProfile = () => {
  showProfile.value = !showProfile.value
}

const closeProfile = () => {
  showProfile.value = false
}

const emit = defineEmits([
  'update:searchQuery',
  'start-chat',
  'select-chat',
  'view-full-image',
  'edit-profile',
  'logout'
])
</script>


<style scoped>
/* Profile Sidebar (Leftdan chiqadigan) */
.profile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 998;
}

.profile-sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

.profile-sidebar {
  position: fixed;
  top: 0;
  left: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.profile-sidebar.profile-open {
  left: 0;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #0088cc;
  color: white;
}

.profile-header h3 {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-content {
  /* padding: 30px 20px; */
}

.profile-avatar-large {
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s;
}

.profile-avatar-large:hover {
  transform: scale(1.02);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0088cc, #00a0e9);
  color: white;
  font-size: 60px;
  font-weight: 600;
}

.profile-info {
  text-align: center;
  margin-bottom: 30px;
}

.profile-info h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.profile-username {
  font-size: 16px;
  color: #0088cc;
  margin: 0;
}

.profile-details {
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  gap: 15px;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: #707579;
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  color: #000;
  word-break: break-word;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #0088cc;
  color: white;
}

.action-button:hover {
  background: #0077b3;
  transform: translateY(-1px);
}

.action-button.logout {
  background: #dc3545;
}

.action-button.logout:hover {
  background: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-sidebar {
    width: 85%;
    left: -85%;
  }
}
</style>
<style scoped>
/* Context Menu */
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 180px;
  z-index: 1000;
}

.context-menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #111827;
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: #f3f4f6;
}

.context-menu-item.delete {
  color: #ef4444;
}

.context-menu-item.delete:hover {
  background: #fee2e2;
}

/* Edit Banner */
.edit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #dbeafe;
  border-top: 1px solid #93c5fd;
}

.edit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e40af;
  font-size: 14px;
  font-weight: 500;
}

.cancel-edit {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #1e40af;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.cancel-edit:hover {
  background: rgba(30, 64, 175, 0.1);
}

/* Edited Badge */
.edited-badge {
  font-size: 11px;
  color: #6b7280;
  margin-left: 6px;
  font-style: italic;
}

/* Deleted Message */
.message-deleted .message-content {
  opacity: 0.6;
}

.deleted-message {
  font-style: italic;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Message Footer */
.message-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: #6b7280;
}

/* Read Status */
.read-status {
  display: flex;
  align-items: center;
}

.read-single {
  color: #9ca3af;
}

.read-double {
  color: #3b82f6;
}

/* Edit Button */
.edit-btn {
  background: #10b981 !important;
}

.edit-btn:hover {
  background: #059669 !important;
}

/* Emoji Picker */
.emoji-picker {
  position: absolute;
  bottom: 70px;
  right: 20px;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.emoji-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.close-emoji {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-emoji:hover {
  color: #111827;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.emoji-item {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: #f3f4f6;
}

/* Emoji Button */
.emoji-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px 12px;
  transition: transform 0.2s;
}

.emoji-btn:hover {
  transform: scale(1.1);
}

.emoji-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Message Image */
.message-image-container {
  margin-bottom: 4px;
}

.message-image {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-progress p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  cursor: default;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Search Results */
.search-results,
.search-loading,
.no-results {
  padding: 16px;
}

.search-results h4 {
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  gap: 12px;
}

.search-result-item:hover {
  background: #f3f4f6;
}

.search-result-item .chat-info h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.search-result-item .chat-info p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
}

.search-loading,
.no-results {
  text-align: center;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .emoji-picker {
    right: 10px;
    left: 10px;
    width: auto;
  }
  
  .message-image {
    max-width: 200px;
    max-height: 200px;
  }
  
  .context-menu {
    min-width: 160px;
  }
}
</style>
<style scoped>
/* Emoji Picker */
.emoji-picker {
  position: absolute;
  bottom: 70px;
  right: 20px;
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.emoji-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.close-emoji {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-emoji:hover {
  color: #111827;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.emoji-item {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: #f3f4f6;
}

/* Emoji Button */
.emoji-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px 12px;
  transition: transform 0.2s;
}

.emoji-btn:hover {
  transform: scale(1.1);
}

.emoji-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Message Image */
.message-image-container {
  margin-bottom: 4px;
}

.message-image {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-progress p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  cursor: default;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Search Results */
.search-results,
.search-loading,
.no-results {
  padding: 16px;
}

.search-results h4 {
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  gap: 12px;
}

.search-result-item:hover {
  background: #f3f4f6;
}

.search-result-item .chat-info h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.search-result-item .chat-info p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
}

.search-loading,
.no-results {
  text-align: center;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .emoji-picker {
    right: 10px;
    left: 10px;
    width: auto;
  }
  
  .message-image {
    max-width: 200px;
    max-height: 200px;
  }
}

.search-results,
.search-loading,
.no-results {
  padding: 16px;
}

.search-results h4 {
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f3f4f6;
}

.search-loading,
.no-results {
  text-align: center;
  color: #6b7280;
}
</style>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  position: relative;
}

/* Sidebar */
.sidebar {
  width: 420px;
  background: white;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #707579;
  margin-bottom: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f1f3f4;
  padding: 10px 16px;
  border-radius: 24px;
}

.search-box svg {
  color: #707579;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f1f1;
}

.chat-item:hover {
  background: #f8f9fa;
}

.chat-item.active {
  background: #e8f0fe;
}

.chat-avatar {
  position: relative;
  flex-shrink: 0;
}

.chat-avatar img,
.avatar-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #54a9eb, #3390ec);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-header h4 {
  font-size: 15px;
  font-weight: 500;
  color: #000;
  margin: 0;
}

.chat-time {
  font-size: 13px;
  color: #707579;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-preview p {
  font-size: 14px;
  color: #707579;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  background: #54a9eb;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

/* Main Chat */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e5ddd5;
  position: relative;
}

.no-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
}

.no-chat-content {
  text-align: center;
}

.telegram-logo {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #54a9eb, #3390ec);
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.telegram-logo svg {
  width: 70px;
  height: 70px;
  fill: white;
}

.no-chat-content h2 {
  color: #333;
  margin-bottom: 8px;
}

.no-chat-content p {
  color: #707579;
  font-size: 14px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header-top {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e5e5;
}

.back-btn-mobile {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #707579;
}

.chat-avatar-small img,
.chat-avatar-small .avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.chat-avatar-small .avatar-placeholder {
  background: linear-gradient(135deg, #54a9eb, #3390ec);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chat-user-info {
  flex: 1;
}

.chat-user-info h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 2px 0;
  color: #000;
}

.status {
  font-size: 13px;
  color: #707579;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #707579;
  border-radius: 50%;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f1f3f4;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e5ddd5" width="100" height="100"/></svg>');
}

.message {
  display: flex;
  margin-bottom: 12px;
}

.message-content {
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-sent {
  justify-content: flex-end;
}

.message-sent .message-content {
  background: #dcf8c6;
}

.message-content p {
  margin: 0 0 4px 0;
  color: #000;
  font-size: 14px;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  color: #667781;
  float: right;
  margin-left: 8px;
}

.chat-input {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #e5e5e5;
}

.attach-btn,
.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #707579;
  border-radius: 50%;
  transition: background 0.2s;
}

.attach-btn:hover,
.send-btn:hover {
  background: #f1f3f4;
}

.chat-input input {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 24px;
  background: #f1f3f4;
  outline: none;
  font-size: 14px;
}

/* Right Sidebar - Profile */
.right-sidebar {
  width: 380px;
  background: white;
  border-left: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.profile-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 16px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #707579;
}

.profile-header h3 {
  margin: 0;
  font-size: 18px;
  color: #000;
}

.profile-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.profile-avatar-large {
  text-align: center;
  margin-bottom: 24px;
  width: 100%;
  height: 170px;

}
.profile-avatar-large img{
  width: 100%;
  height: 100% ;
}

.profile-avatar-large img,
.avatar-placeholder-large {
  height: 170px;
  object-fit: cover;
  margin: 0 auto;
}

.avatar-placeholder-large {
  background: linear-gradient(135deg, #54a9eb, #3390ec);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 500;
}

.profile-info {
  text-align: center;
  margin-bottom: 32px;
}

.profile-info h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #000;
}

.profile-username {
  font-size: 15px;
  color: #707579;
}

.profile-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f1f1;
}

.detail-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 13px;
  color: #707579;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 15px;
  color: #000;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #54a9eb;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button:hover {
  background: #3390ec;
  transform: translateY(-2px);
}

.action-button.logout {
  background: #ef5350;
}

.action-button.logout:hover {
  background: #e53935;
}

.profile-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #54a9eb, #3390ec);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  transition: all 0.3s;
}

.profile-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.user-avatar-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 500;
}
.user-avatar-small img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .right-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 999;
    transform: translateX(-100%);
    width: 100%;
    max-width: 420px;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .back-btn-mobile {
    display: block;
  }

  .message-content {
    max-width: 80%;
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