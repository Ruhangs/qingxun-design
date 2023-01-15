import { createSSRApp } from 'vue'
import './style.css'
import App from './App.vue'

export const createApp = () => {
  const app = createSSRApp(App);
  return { app }
}

