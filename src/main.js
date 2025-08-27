import { createApp } from 'vue';
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import App from './renderer/components/App.vue';
import { initializeTheme } from './shared/composables/useTheme';
import './index.css';

initializeTheme();

import Upload from './renderer/views/Upload.vue';
import Dashboard from './renderer/views/Dashboard.vue';
import SpeechDetail from './renderer/views/SpeechDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: Upload },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/speech/:id', name: 'SpeechDetail', component: SpeechDetail }
]

const history = import.meta.env.MODE === 'development'
  ? createWebHistory()
  : createWebHashHistory();

const router = createRouter({
  history,
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')