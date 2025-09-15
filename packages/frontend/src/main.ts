import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 라우터 import

createApp(App).use(router).mount('#app') // .use(router) 추가