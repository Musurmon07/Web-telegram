// src/store/user.js
import { ref } from 'vue'

const currentUser = ref(null)
const isAuthenticated = ref(false)

export const useUserStore = () => {
    const setUser = (userData) => {
        currentUser.value = userData
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const clearUser = () => {
        currentUser.value = null
        isAuthenticated.value = false
        localStorage.removeItem('user')
    }

    const loadUser = () => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            currentUser.value = JSON.parse(savedUser)
            isAuthenticated.value = true
        }
    }

    return {
        currentUser,
        isAuthenticated,
        setUser,
        clearUser,
        loadUser
    }
}