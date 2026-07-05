<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from './stores/settings.store'
import { usePopoverStore } from './stores/popover.store'
import { pycmdService } from './services/pycmd.service'

// Import components when they are ready
import SettingsModal from './components/settings/SettingsModal.vue'
import MainPopover from './components/popover/MainPopover.vue'
import DefinitionSubPanel from './components/popover/DefinitionSubPanel.vue'
import ImageSubPanel from './components/popover/ImageSubPanel.vue'

const settingsStore = useSettingsStore()
const popoverStore = usePopoverStore()

const isDeckBrowser = (window as any).__aplIsDeckBrowser !== false

// --- End Debug Logger ---

let selectionTimeout: any = null

function handleMouseUp(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('.apl-popover') || target.closest('.apl-settings-overlay') || target.closest('.debug-panel')) {
    return
  }

  const selection = window.getSelection()
  const text = selection?.toString().trim()
  
  if (!text) {
    popoverStore.hide()
    return
  }

  if (selectionTimeout) clearTimeout(selectionTimeout)
  selectionTimeout = setTimeout(() => {
    const mode = settingsStore.popover.trigger_mode
    const shortcut = settingsStore.popover.shortcut_combo

    if (mode === 'none') {
      return
    }
    if (mode === 'shortcut') {
      if (shortcut === 'Shift' && !event.shiftKey) {
        return
      }
      if (shortcut === 'Ctrl' && !event.ctrlKey) {
        return
      }
      if (shortcut === 'Alt' && !event.altKey) {
        return
      }
    }

    const range = selection!.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    popoverStore.setPosition(rect)
    popoverStore.isLoading = true
    popoverStore.isVisible = true

    const wordCount = text.split(/\s+/).filter(Boolean).length
    const command = wordCount > 1 ? 'translate' : 'lookup'

    pycmdService.send(`${command}:${text}`)
  }, 300)
}

onMounted(() => {
  ;(window as any).updatePopover = (data: any) => {
    if (!data || typeof data !== 'object') return

    if (data.type === 'settings_state') {
      settingsStore.updateState(data)
    } else if (data.type === 'lookup' || data.type === 'translate' || data.type === 'error' || data.type === 'image_search_result') {
      popoverStore.show(data)
    }
  }

  setTimeout(() => {
    pycmdService.send('settings:get')
  }, 100)

  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="dictover-app-wrapper">


    <!-- Home Settings Trigger -->
    <button 
      v-if="!settingsStore.popover.hide_home_settings_button && isDeckBrowser"
      class="apl-settings-trigger" 
      @click="settingsStore.toggleModal"
      aria-label="Open settings"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>

    <MainPopover v-if="popoverStore.isVisible" />
    <DefinitionSubPanel />
    <ImageSubPanel />
    <SettingsModal v-if="settingsStore.isModalOpen" />
  </div>
</template>

<style scoped>
.dictover-app-wrapper {
  /* This satisfies the user's requirement: "bắt buộc có thẻ wrapper cho tất cả component và page" */
}
</style>
