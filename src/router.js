// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './renderer/views/Upload.vue'
import CoachInterface from './renderer/views/CoachInterface.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/coach/:analysisData/:sessionData',
    name: 'CoachInterface',
    component: CoachInterface,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router