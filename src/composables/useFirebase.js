// src/composables/useFirebase.js
import { ref } from 'vue'
import { db } from '../firebase/config'
import {
    collection,
    addDoc,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore'

export const useFirebase = () => {
    const loading = ref(false)
    const error = ref(null)

    // Foydalanuvchini saqlash
    const saveUser = async (userData) => {
        loading.value = true
        error.value = null

        try {
            const userRef = doc(db, 'users', userData.email)

            await setDoc(userRef, {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                country: userData.country,
                photoURL: userData.photoURL || '',
                bio: userData.bio || '',
                username: userData.username || userData.email.split('@')[0],
                isOnline: true,
                lastSeen: serverTimestamp(),
                createdAt: serverTimestamp()
            })

            console.log('✅ Foydalanuvchi saqlandi:', userData.email)
            loading.value = false
            return { success: true }

        } catch (err) {
            console.error('❌ Firebase xatolik:', err)
            error.value = err.message
            loading.value = false
            return { success: false, error: err.message }
        }
    }

    // Foydalanuvchini olish
    const getUser = async (email) => {
        loading.value = true
        error.value = null

        try {
            const userRef = doc(db, 'users', email)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                loading.value = false
                return { success: true, data: userSnap.data() }
            } else {
                loading.value = false
                return { success: false, error: 'Foydalanuvchi topilmadi' }
            }

        } catch (err) {
            console.error('❌ Firebase xatolik:', err)
            error.value = err.message
            loading.value = false
            return { success: false, error: err.message }
        }
    }

    // Profilni yangilash (merge: true bilan)
    const updateProfile = async (email, updates) => {
        loading.value = true
        error.value = null

        try {
            const userRef = doc(db, 'users', email)
            
            // setDoc dengan merge: true - agar yo'q bo'lsa yaratadi, bor bo'lsa yangilaydi
            await setDoc(userRef, {
                ...updates,
                email: email, // Email har doim bo'lishi kerak
                updatedAt: serverTimestamp()
            }, { merge: true }) // BU MUHIM!

            console.log('✅ Profil yangilandi')
            loading.value = false
            return { success: true }

        } catch (err) {
            console.error('❌ Firebase xatolik:', err)
            error.value = err.message
            loading.value = false
            return { success: false, error: err.message }
        }
    }

    return {
        loading,
        error,
        saveUser,
        getUser,
        updateProfile
    }
}