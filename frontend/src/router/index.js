import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import PreparationPage from '../components/PreparationPage.vue'
import VotingPage from '../components/VotingPage.vue'
import FinishVoting from '../components/FinishVoting.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { 
    path: '/preparation', 
    name: 'Preparation',
    component: PreparationPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/voting', 
    name: 'Voting',
    component: VotingPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/finish', 
    name: 'Finish',
    component: FinishVoting,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/')
  } else {
    next()
  }
})

export default router
