import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './renderer/components/App.vue';
import { initializeTheme } from './shared/composables/useTheme';
import './index.css';

// Initialize the theme before creating the app instance.
// This is the single source of truth for the initial theme.
initializeTheme();

import Upload from './renderer/views/Upload.vue';
import Dashboard from './renderer/views/Dashboard.vue';
import SpeechDetail from './renderer/views/SpeechDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: Upload },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/speech/:id', name: 'SpeechDetail', component: SpeechDetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')