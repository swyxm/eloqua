import { createApp } from 'vue';
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import App from './renderer/components/App.vue';
import { initializeTheme } from './shared/composables/useTheme';
import './index.css';

initializeTheme();

import Upload from './renderer/views/Upload.vue';
import Speeches from './renderer/views/Speeches.vue';
import SpeechDetail from './renderer/views/SpeechDetail.vue';
import Stats from './renderer/views/Stats.vue';
import DataIngest from './renderer/views/DataIngest.vue';
import TournamentDetail from './renderer/views/TournamentDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: Upload },
  { path: '/speeches', name: 'Speeches', component: Speeches },
  { path: '/speech/:id', name: 'SpeechDetail', component: SpeechDetail },
  { path: '/tournament/:id', name: 'TournamentDetail', component: TournamentDetail },
  { path: '/stats', name: 'Stats', component: Stats },
  { path: '/ingest', name: 'DataIngest', component: DataIngest }
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