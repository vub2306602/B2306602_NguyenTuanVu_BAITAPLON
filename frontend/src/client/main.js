import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Bootstrap CSS & JS bundle
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import CSS tập trung của Client (Vàng hổ phách #f59e0b)
import './assets/css/style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

router.isReady().then(() => {
  app.mount('#client-app')
})
