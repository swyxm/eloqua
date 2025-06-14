import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './renderer/components/App.vue'
import './index.css'

import Upload from './renderer/views/Upload.vue'
import CoachInterface from './renderer/views/CoachInterface.vue'

const routes = [
  { path: '/', name: 'Home', component: Upload },
  { path: '/coach', name: 'CoachInterface', component: CoachInterface }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')