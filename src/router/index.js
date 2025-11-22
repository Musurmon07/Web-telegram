import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Verify from '../views/Verify.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresGuest: true }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: Verify,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import('../views/ProfileEdit.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route Guard
router.beforeEach((to, from, next) => {
  const { isAuthenticated, loadUser } = useUserStore()
  loadUser()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
