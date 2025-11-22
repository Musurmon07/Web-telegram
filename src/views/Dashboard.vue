<template>
  <div class="dashboard">
    <!-- Sidebar Component -->
    <ChatSidebar 
      :is-sidebar-open="isSidebarOpen" 
      :search-query="searchQuery" 
      :search-results="searchResults"
      :searching="searching" 
      :chats="chats" 
      :active-chat="activeChat" 
      :show-profile="showProfile"
      :current-user="currentUser" 
      @toggle-sidebar="toggleSidebar" 
      @update:search-query="handleSearchUpdate"
      @start-chat="startChatWithUser" 
      @select-chat="selectChat" 
      @close-profile="showProfile = false"
      @view-full-image="viewFullImage" 
      @edit-profile="editProfile" 
      @logout="logout" 
    />

    <!-- Main Chat Area -->
    <main class="chat-main">
      <!-- No Chat Selected -->
      <div v-if="!activeChat" class="no-chat">
        <div class="no-chat-content">
          <div class="telegram-logo">
            <svg viewBox="0 0 240 240">
              <path d="M92,75L92,165L152,120L92,75Z" />
            </svg>
          </div>
          <h2>Telegram Web</h2>
          <p>Chatni tanlang va suhbatni boshlang</p>
        </div>
      </div>
 
      <!-- Chat Container -->
      <div v-else class="chat-container">
        <!-- Chat Header Component -->
        <ChatHeader
          :chat="activeChat"
          :typing="isTyping"
          @back="activeChat = null"
          @show-profile="showProfile = true"
          @search="searchInChat"
          @call="makeCall"
          @menu-action="handleMenuAction"
        />

        <!-- Messages -->
        <div class="messages" ref="messagesContainer">
          <div v-for="message in activeChat.messages" :key="message.id" class="message" :class="{
            'message-sent': message.senderId === currentUser?.email,
            'message-deleted': message.deleted
          }" @contextmenu.prevent="openMessageMenu($event, message)">
            <div class="message-content">
              <!-- Deleted Message -->
              <div v-if="message.deleted" class="deleted-message">
                <span>🚫 Xabar o'chirildi</span>
              </div>

              <!-- Normal Message -->
              <template v-else>
                <!-- Image Message -->
                <div v-if="message.imageUrl" class="message-image-container">
                  <img :src="message.imageUrl" alt="Image" class="message-image" @click="viewImage(message.imageUrl)">
                </div>

                <!-- Text Message -->
                <div v-if="message.text">
                  <p v-if="!message.edited">{{ message.text }}</p>
                  <p v-else>
                    {{ message.text }}
                    <span class="edited-badge">tahrirlangan</span>
                  </p>
                </div>

                <!-- Time and Read Status -->
                <div class="message-footer">
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  <!-- Read Status (faqat yuborgan xabarlarda) -->
                  <span v-if="message.senderId === currentUser?.email" class="read-status">
                    <svg v-if="message.read" width="16" height="16" viewBox="0 0 16 16" class="read-double">
                      <path fill="currentColor" d="M13.5 2L5.5 10l-2-2L2 9.5l3.5 3.5 9.5-9.5L13.5 2z" />
                      <path fill="currentColor" d="M15.5 2L7.5 10l-.5-.5.5-.5 7-7L15.5 2z" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 16 16" class="read-single">
                      <path fill="currentColor" d="M13.5 2L5.5 10l-2-2L2 9.5l3.5 3.5 9.5-9.5L13.5 2z" />
                    </svg>
                  </span>
                </div>
              </template>
            </div>
          </div>

          <!-- Image Upload Progress -->
          <div v-if="uploadingImage" class="message message-sent">
            <div class="message-content">
              <div class="upload-progress">
                <div class="spinner-small"></div>
                <p>Rasm yuklanmoqda... {{ uploadProgress }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Mode Banner -->
        <div v-if="editingMessage" class="edit-banner">
          <div class="edit-info">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <span>Xabarni tahrirlash</span>
          </div>
          <button class="cancel-edit" @click="cancelEdit">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <!-- File Input (hidden) -->
          <input ref="imageInput" type="file" accept="image/*" @change="handleImageSelect" style="display: none">

          <!-- Attach Button -->
          <button class="attach-btn" @click="selectImage" :disabled="uploadingImage || editingMessage">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
            </svg>
          </button>

          <!-- Message Input -->
          <input type="text" :placeholder="editingMessage ? 'Xabarni tahrirlash...' : 'Xabar yozish...'"
            v-model="newMessage" @keyup.enter="editingMessage ? saveEdit() : sendMessage()" @keyup.esc="cancelEdit"
            :disabled="sendingMessage || uploadingImage" ref="messageInput">

          <!-- Emoji Button -->
          <button class="emoji-btn" @click="toggleEmojiPicker" :disabled="uploadingImage">
            😊
          </button>

          <!-- Send/Edit Button -->
          <button v-if="!editingMessage" class="send-btn" @click="sendMessage"
            :disabled="sendingMessage || uploadingImage || !newMessage.trim()">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
          <button v-else class="send-btn edit-btn" @click="saveEdit" :disabled="sendingMessage || !newMessage.trim()">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </div>

        <!-- Emoji Picker -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-header">
            <h4>Emoji tanlang</h4>
            <button class="close-emoji" @click="showEmojiPicker = false">✕</button>
          </div>
          <div class="emoji-grid">
            <button v-for="emoji in emojis" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Context Menu (Right-click menu) -->
    <div v-if="contextMenu.show" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop>
      <button v-if="contextMenu.message?.senderId === currentUser?.email && !contextMenu.message?.deleted"
        @click="startEdit(contextMenu.message)" class="context-menu-item">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        Tahrirlash
      </button>
      <button v-if="contextMenu.message?.senderId === currentUser?.email" @click="deleteMessage(contextMenu.message)"
        class="context-menu-item delete">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
        O'chirish
      </button>
    </div>

    <!-- Full Image Modal -->
    <div v-if="showFullImage || viewingImage" class="image-modal" @click="closeImageView">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageView">
          <svg width="32" height="32" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        <img :src="viewingImage || currentUser?.photoURL" :alt="viewingImage ? 'Chat image' : 'Profile'">
      </div>
    </div>

    <!-- Click outside to close context menu -->
    <div v-if="contextMenu.show" class="context-menu-overlay" @click="closeContextMenu"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { db } from '../firebase/config'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import ChatSidebar from '../views/ChatSidebar.vue'
import ChatHeader from '../views/ChatHeader.vue'

const router = useRouter()
const { currentUser, clearUser, loadUser } = useUserStore()

const isSidebarOpen = ref(true)
const showProfile = ref(false)
const showFullImage = ref(false)
const viewingImage = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const activeChat = ref(null)
const newMessage = ref('')
const sendingMessage = ref(false)
const uploadingImage = ref(false)
const uploadProgress = ref(0)
const messagesContainer = ref(null)
const messageInput = ref(null)
const imageInput = ref(null)
const chats = ref([])
const showEmojiPicker = ref(false)
const editingMessage = ref(null)
const isTyping = ref(false)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  message: null
})
let unsubscribeMessages = null

// Emoji list
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️',
  '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥',
  '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥',
  '✨', '💫', '⭐', '🌟', '✅', '❌', '🎉', '🎊', '🎁', '🎈'
]

// Search query handler
const handleSearchUpdate = async (value) => {
  searchQuery.value = value
  if (!value.trim()) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('username', '>=', value.toLowerCase()),
      where('username', '<=', value.toLowerCase() + '\uf8ff')
    )

    const querySnapshot = await getDocs(q)
    searchResults.value = []

    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.email !== currentUser.value?.email) {
        searchResults.value.push(userData)
      }
    })
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    searching.value = false
  }
}

// Yangi chat boshlash
const startChatWithUser = async (user) => {
  searchQuery.value = ''
  searchResults.value = []

  const chatId = [currentUser.value.email, user.email].sort().join('_')

  activeChat.value = {
    id: chatId,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.photoURL,
    isOnline: user.isOnline || false,
    messages: [],
    otherUserEmail: user.email
  }

  loadMessages(chatId)

  const existingChat = chats.value.find(c => c.id === chatId)
  if (!existingChat) {
    chats.value.unshift({
      id: chatId,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.photoURL,
      lastMessage: 'Chat boshlandi',
      time: formatTime(new Date()),
      isOnline: user.isOnline || false,
      unread: 0,
      messages: [],
      otherUserEmail: user.email
    })
  }

  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }
}

// Chatni tanlash
const selectChat = (chat) => {
  activeChat.value = chat
  loadMessages(chat.id)
  markMessagesAsRead(chat.id)

  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }
}

// Xabarlarni o'qilgan deb belgilash
const markMessagesAsRead = async (chatId) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(
      messagesRef,
      where('senderId', '!=', currentUser.value.email),
      where('read', '==', false)
    )

    const snapshot = await getDocs(q)

    snapshot.forEach(async (docSnap) => {
      await updateDoc(doc(db, 'chats', chatId, 'messages', docSnap.id), {
        read: true
      })
    })
  } catch (error) {
    console.error('Mark as read error:', error)
  }
}

// Xabarlarni yuklash (real-time)
const loadMessages = (chatId) => {
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }

  const messagesRef = collection(db, 'chats', chatId, 'messages')
  const q = query(messagesRef, orderBy('timestamp', 'asc'))

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    const messages = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() })
    })

    if (activeChat.value) {
      activeChat.value.messages = messages
    }

    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }, 100)
  })
}

// Rasm tanlash
const selectImage = () => {
  imageInput.value?.click()
}

// Rasm yuklash
const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Rasm hajmi 2MB dan oshmasligi kerak')
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('Faqat rasm fayllari yuklash mumkin')
    return
  }

  uploadingImage.value = true
  uploadProgress.value = 0

  try {
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 150)

    const reader = new FileReader()

    reader.onloadend = async () => {
      clearInterval(progressInterval)
      uploadProgress.value = 100

      const base64Image = reader.result
      await sendImageMessage(base64Image)

      uploadingImage.value = false
      uploadProgress.value = 0
      event.target.value = ''
    }

    reader.onerror = () => {
      clearInterval(progressInterval)
      alert('Rasm yuklashda xatolik')
      uploadingImage.value = false
      uploadProgress.value = 0
    }

    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Image upload error:', error)
    alert('Rasm yuklashda xatolik')
    uploadingImage.value = false
    uploadProgress.value = 0
  }
}

// Rasm xabarini yuborish
const sendImageMessage = async (imageUrl) => {
  if (!activeChat.value) return

  try {
    const chatId = activeChat.value.id
    const messagesRef = collection(db, 'chats', chatId, 'messages')

    await addDoc(messagesRef, {
      imageUrl: imageUrl,
      text: '',
      senderId: currentUser.value.email,
      senderName: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
      timestamp: serverTimestamp(),
      read: false,
      deleted: false,
      edited: false
    })

    const chatRef = doc(db, 'chats', chatId)
    await setDoc(chatRef, {
      participants: [currentUser.value.email, activeChat.value.otherUserEmail],
      lastMessage: '📷 Rasm',
      lastMessageTime: serverTimestamp(),
      lastSender: currentUser.value.email
    }, { merge: true })

  } catch (error) {
    console.error('Send image error:', error)
    alert('Rasm yuborishda xatolik')
  }
}

// Matn xabarini yuborish
const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value || sendingMessage.value) return

  sendingMessage.value = true

  try {
    const chatId = activeChat.value.id
    const messagesRef = collection(db, 'chats', chatId, 'messages')

    await addDoc(messagesRef, {
      text: newMessage.value,
      imageUrl: '',
      senderId: currentUser.value.email,
      senderName: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
      timestamp: serverTimestamp(),
      read: false,
      deleted: false,
      edited: false
    })

    const chatRef = doc(db, 'chats', chatId)
    await setDoc(chatRef, {
      participants: [currentUser.value.email, activeChat.value.otherUserEmail],
      lastMessage: newMessage.value,
      lastMessageTime: serverTimestamp(),
      lastSender: currentUser.value.email
    }, { merge: true })

    newMessage.value = ''
    showEmojiPicker.value = false
  } catch (error) {
    console.error('Send message error:', error)
    alert('Xabar yuborishda xatolik')
  } finally {
    sendingMessage.value = false
  }
}

// Context menu (right-click)
const openMessageMenu = (event, message) => {
  if (message.senderId !== currentUser.value?.email || message.deleted) return

  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    message: message
  }
}

const closeContextMenu = () => {
  contextMenu.value = {
    show: false,
    x: 0,
    y: 0,
    message: null
  }
}

// Xabarni tahrirlash
const startEdit = (message) => {
  if (message.imageUrl) {
    alert('Rasmli xabarni tahrirlash mumkin emas')
    closeContextMenu()
    return
  }

  editingMessage.value = message
  newMessage.value = message.text
  closeContextMenu()

  nextTick(() => {
    messageInput.value?.focus()
  })
}

const saveEdit = async () => {
  if (!newMessage.value.trim() || !editingMessage.value) return

  sendingMessage.value = true

  try {
    const chatId = activeChat.value.id
    const messageRef = doc(db, 'chats', chatId, 'messages', editingMessage.value.id)

    await updateDoc(messageRef, {
      text: newMessage.value,
      edited: true,
      editedAt: serverTimestamp()
    })

    newMessage.value = ''
    editingMessage.value = null
  } catch (error) {
    console.error('Edit message error:', error)
    alert('Xabarni tahrirlashda xatolik')
  } finally {
    sendingMessage.value = false
  }
}

const cancelEdit = () => {
  editingMessage.value = null
  newMessage.value = ''
}

// Xabarni o'chirish
const deleteMessage = async (message) => {
  if (!confirm('Xabarni o\'chirmoqchimisiz?')) {
    closeContextMenu()
    return
  }

  try {
    const chatId = activeChat.value.id
    const messageRef = doc(db, 'chats', chatId, 'messages', message.id)

    await updateDoc(messageRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    })

    closeContextMenu()
  } catch (error) {
    console.error('Delete message error:', error)
    alert('Xabarni o\'chirishda xatolik')
    closeContextMenu()
  }
}

// Emoji picker
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
  messageInput.value?.focus()
}

// Rasmni to'liq ko'rish
const viewImage = (imageUrl) => {
  viewingImage.value = imageUrl
}

const closeImageView = () => {
  viewingImage.value = null
  showFullImage.value = false
}

// Header actions
const searchInChat = () => {
  console.log('Search in chat')
}

const makeCall = () => {
  console.log('Make call')
}

const handleMenuAction = (action) => {
  console.log('Menu action:', action)
  switch (action) {
    case 'mute':
      alert('Mute notifications')
      break
    case 'clear':
      if (confirm('Chatni tozalamoqchimisiz?')) {
        console.log('Clear chat history')
      }
      break
    case 'export':
      alert('Export chat')
      break
    case 'block':
      if (confirm('Foydalanuvchini bloklaysizmi?')) {
        console.log('Block user')
      }
      break
  }
}

// Vaqtni formatlash
const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const editProfile = () => {
  router.push('/profile/edit')
}

const viewFullImage = () => {
  if (currentUser.value?.photoURL) {
    showFullImage.value = true
  }
}

const logout = () => {
  if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
    if (unsubscribeMessages) {
      unsubscribeMessages()
    }
    clearUser()
    router.push('/login')
  }
}

const loadUserChats = async () => {
  if (!currentUser.value?.email) return

  try {
    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.value.email)
    )

    const snapshot = await getDocs(q)
    const loadedChats = []

    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data()
      const otherUserEmail = chatData.participants.find(email => email !== currentUser.value.email)

      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', otherUserEmail)))

      if (!userDoc.empty) {
        const otherUser = userDoc.docs[0].data()

        loadedChats.push({
          id: docSnap.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          avatar: otherUser.photoURL,
          lastMessage: chatData.lastMessage || '',
          time: chatData.lastMessageTime ? formatTime(chatData.lastMessageTime) : '',
          isOnline: otherUser.isOnline || false,
          unread: 0,
          messages: [],
          otherUserEmail: otherUserEmail
        })
      }
    }

    chats.value = loadedChats
  } catch (error) {
    console.error('Load chats error:', error)
  }
}

onMounted(async () => {
  loadUser()

  if (!currentUser.value) {
    router.push('/login')
    return
  }

  await loadUserChats()
})

onUnmounted(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  display: flex;
  height: 100vh;
  color: #e8eaed;
  overflow: hidden;
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0e1621;
  position: relative;
}

/* No Chat Selected */
.no-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #0e1621;
}

.no-chat-content {
  text-align: center;
  color: #8696a0;
}

.telegram-logo {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #2aabee 0%, #229ed9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(42, 171, 238, 0.3);
}

.telegram-logo svg {
  width: 60px;
  height: 60px;
  fill: white;
}

.no-chat-content h2 {
  font-size: 24px;
  color: #e8eaed;
  margin-bottom: 8px;
}

.no-chat-content p {
  font-size: 14px;
  color: #8696a0;
}

/* Chat Container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0e1621;
}

/* Messages Area */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #0e1621;
  scroll-behavior: smooth;
}

.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Message Styles */
.message {
  display: flex;
  margin-bottom: 12px;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-sent {
  justify-content: flex-end;
}

.message-content {
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 12px;
  background: #182533;
  color: #e8eaed;
  position: relative;
  word-wrap: break-word;
}

.message-sent .message-content {
  background: #2b5278;
}

.message-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* Deleted Message */
.message-deleted .message-content {
  background: rgba(255, 255, 255, 0.05);
  opacity: 0.6;
  font-style: italic;
}

.deleted-message {
  color: #8696a0;
  font-size: 13px;
}

/* Message Image */
.message-image-container {
  margin-bottom: 4px;
  border-radius: 8px;
  overflow: hidden;
}

.message-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: opacity 0.2s;
}

.message-image:hover {
  opacity: 0.9;
}

/* Message Footer */
.message-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: #8696a0;
  justify-content: flex-end;
}

.message-time {
  font-size: 11px;
}

.read-status {
  display: flex;
  align-items: center;
}

.read-double {
  color: #53bdeb;
}

.read-single {
  color: #8696a0;
}

.edited-badge {
  font-size: 11px;
  color: #8696a0;
  font-style: italic;
  margin-left: 4px;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8696a0;
  font-size: 13px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #2aabee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Edit Banner */
.edit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #182533;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.edit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2aabee;
  font-size: 14px;
}

.cancel-edit {
  background: none;
  border: none;
  color: #8696a0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.cancel-edit:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Chat Input */
.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #17212b;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.attach-btn,
.emoji-btn {
  background: none;
  border: none;
  color: #8696a0;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-btn:hover,
.emoji-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.attach-btn:disabled,
.emoji-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.emoji-btn {
  font-size: 20px;
}

.chat-input input {
  flex: 1;
  background: #0e1621;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 10px 16px;
  color: #e8eaed;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
}

.chat-input input:focus {
  border-color: #2aabee;
}

.chat-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  background: #2aabee;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
}

.send-btn:hover {
  background: #229ed9;
  transform: scale(1.05);
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: scale(1);
}

.edit-btn {
  background: #4caf50;
}

.edit-btn:hover {
  background: #45a049;
}

/* Emoji Picker */
.emoji-picker {
  position: absolute;
  bottom: 70px;
  right: 16px;
  width: 320px;
  max-height: 400px;
  background: #212e3a;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emoji-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.emoji-header h4 {
  font-size: 14px;
  font-weight: 500;
  color: #e8eaed;
}

.close-emoji {
  background: none;
  border: none;
  color: #8696a0;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-emoji:hover {
  background: rgba(255, 255, 255, 0.08);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  max-height: 340px;
  overflow-y: auto;
}

.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.emoji-item {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.2);
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: #212e3a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 10000;
  min-width: 180px;
  overflow: hidden;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.context-menu-item {
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

.context-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.context-menu-item.delete {
  color: #f44336;
}

.context-menu-item.delete:hover {
  background: rgba(244, 67, 54, 0.1);
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
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
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .message-content {
    max-width: 80%;
  }

  .emoji-picker {
    width: calc(100% - 32px);
    right: 16px;
    left: 16px;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .message-image {
    max-width: 200px;
  }

  .emoji-grid {
    grid-template-columns: repeat(5, 1fr);
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
  to {
    transform: rotate(360deg);
  }
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
  to {
    transform: rotate(360deg);
  }
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
  color: #000;
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
  padding: 24px;
}

.profile-avatar-large {
  text-align: center;
  margin-bottom: 24px;
}

.profile-avatar-large img,
.avatar-placeholder-large {
  width: 120px;
  height: 120px;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s;
}

.profile-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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