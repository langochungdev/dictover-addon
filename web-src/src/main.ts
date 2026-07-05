import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/popup.css'
import App from './App.vue'

// Inject a mount point into Anki's body if it doesn't exist
let mountEl = document.getElementById('dictover-app')
if (!mountEl) {
  mountEl = document.createElement('div')
  mountEl.id = 'dictover-app'
  document.body.appendChild(mountEl)
}

// Stub updatePopover immediately so Anki doesn't throw ReferenceError
;(window as any).updatePopover = function() {
  // This will be overridden by App.vue when mounted
}

const app = createApp(App)
app.use(createPinia())
app.mount(mountEl)
