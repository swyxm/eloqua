import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './index.css'

const app = createApp(App)
app.use(router)

//initialize theme
app.mount('#app').$nextTick(() => {
  import('./shared/composables/useTheme.js').then(({ useTheme }) => {
    const { initTheme } = useTheme()
    initTheme()
  })
})