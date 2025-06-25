// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './renderer/views/Upload.vue'
import Dashboard from './renderer/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router