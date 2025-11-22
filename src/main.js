import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import emailjs from '@emailjs/browser'

// EmailJS ni initialize qiling - BU JUDA MUHIM!
emailjs.init('ZzHAEC6XyZqa0rRVD')  // emailjs.com dan oling

const app = createApp(App)

app.use(router)
app.mount('#app')