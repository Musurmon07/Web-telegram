<template>
  <div class="chat-header">
    <!-- Back Button (Mobile) -->
    <button class="back-btn" @click="$emit('back')">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
    </button>

    <!-- Chat Info -->
    <div class="chat-info" @click="$emit('show-profile')">
      <div class="chat-avatar">
        <img v-if="chat?.avatar" :src="chat.avatar" :alt="chat.name">
        <div v-else class="avatar-placeholder">{{ chat?.name?.[0] || '?' }}</div>
        <!-- <span v-if="chat?.isOnline" class="online-indicator"></span> -->
      </div>
      
      <div class="chat-details">
        <h3 class="chat-name">{{ chat?.name || 'User' }}</h3>
        <div class="chat-status">
          <span v-if="typing" class="typing-indicator">typing...</span>
          <span v-else-if="chat?.isOnline" class="status-online">online</span>
          <span v-else class="status-offline">last seen recently</span>
        </div>
      </div>
    </div>

    <!-- Header Actions -->
    <div class="header-actions">
      <button class="action-btn" @click="$emit('search')" title="Search">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </button>
      
      <button class="action-btn" @click="$emit('call')" title="Call">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
        </svg>
      </button>
      
      <button class="action-btn" @click="toggleMenu" title="More" ref="menuButton">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="showMenu" class="dropdown-menu" :style="menuStyle">
      <button class="menu-item" @click="handleMenuClick('mute')">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
        Mute notifications
      </button>
      
      <button class="menu-item" @click="handleMenuClick('clear')">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
        Clear history
      </button>
      
      <button class="menu-item" @click="handleMenuClick('export')">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
        </svg>
        Export chat
      </button>
      
      <div class="menu-divider"></div>
      
      <button class="menu-item danger" @click="handleMenuClick('block')">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 0 1 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0 1 20 12c0 4.42-3.58 8-8 8z" />
        </svg>
        Block user
      </button>
    </div>

    <!-- Click outside overlay -->
    <div v-if="showMenu" class="menu-overlay" @click="showMenu = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  chat: {
    type: Object,
    default: null
  },
  typing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back', 'show-profile', 'search', 'call', 'menu-action'])

const showMenu = ref(false)
const menuButton = ref(null)

const menuStyle = computed(() => {
  return {
    top: '60px',
    right: '12px'
  }
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleMenuClick = (action) => {
  showMenu.value = false
  emit('menu-action', action)
}

// Close menu on escape
const handleEscape = (e) => {
  if (e.key === 'Escape' && showMenu.value) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.08); */
  position: relative;
  height: 60px;
}

.back-btn {
  display: none;
  background: none;
  border: none;
  color: #adbac7;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 768px) {
  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s;
}

.chat-info:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chat-avatar {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #0ac630;
  border: 2px solid #17212b;
  border-radius: 50%;
}

.chat-details {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 15px;
  font-weight: 500;
  color: #e8eaed;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-status {
  font-size: 13px;
  color: #8696a0;
}

.typing-indicator {
  color: #64b5f6;
  font-style: italic;
}

.status-online {
  color: #0ac630;
}

.status-offline {
  color: #8696a0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: #adbac7;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.action-btn:active {
  transform: scale(0.95);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  background: #212e3a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #e8eaed;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-item svg {
  flex-shrink: 0;
}

.menu-item.danger {
  color: #f44336;
}

.menu-item.danger:hover {
  background: rgba(244, 67, 54, 0.1);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 4px 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    padding: 10px 12px;
  }

  .chat-avatar {
    width: 38px;
    height: 38px;
  }

  .header-actions {
    gap: 2px;
  }

  .action-btn {
    padding: 6px;
  }
}
</style>