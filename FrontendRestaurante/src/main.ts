import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import './assets/main.css'

axios.defaults.baseURL = 'http://localhost:8000'
const app = createApp(App)
app.provide('axios', axios)
app.mount('#app')
