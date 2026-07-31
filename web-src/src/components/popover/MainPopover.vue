<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { usePopoverStore } from '../../stores/popover.store'
import { useSettingsStore } from '../../stores/settings.store'
import { pycmdService } from '../../services/pycmd.service'
import { useI18n } from '../../composables/useI18n'

import { offset, flip, shift, size, useFloating, autoUpdate } from '@floating-ui/vue'

const store = usePopoverStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const popoverRef = ref<HTMLElement | null>(null)

const virtualEl = computed(() => {
  if (!store.rect || !store.isVisible) return null;
  return {
    getBoundingClientRect: () => ({
      x: store.rect!.left,
      y: store.rect!.top,
      width: store.rect!.width,
      height: store.rect!.height,
      top: store.rect!.top,
      left: store.rect!.left,
      bottom: store.rect!.bottom,
      right: store.rect!.right,
    })
  }
})

const { floatingStyles } = useFloating(virtualEl, popoverRef, {
  placement: 'bottom-start',
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(10),
    flip(),
    shift({ padding: 12 }),
    size({
      padding: 12,
      apply({ availableWidth, availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          maxWidth: `${Math.min(560, availableWidth)}px`,
          maxHeight: `${Math.min(420, availableHeight)}px`
        })
      }
    })
  ],
})

const popoverStyleText = computed(() => {
  const px = settingsStore.popover.font_size_px
  const fs = px && px > 0 ? `font-size: ${px}px !important;` : ''
  if (!store.isVisible) {
    return `top: -9999px; left: -9999px; transform: none; ${fs}`
  }
  return `position: ${floatingStyles.value.position || 'fixed'}; top: ${floatingStyles.value.top || 0}; left: ${floatingStyles.value.left || 0}; transform: ${floatingStyles.value.transform || 'none'}; ${fs}`
})

onMounted(() => {
  const el = popoverRef.value
  if (!el) {
    return
  }
  // We removed the deep debug logs to keep it clean
})

function playAudio(url: string) {
  store.playAudio(url)
}

function openSettings() {
  store.hide()
  settingsStore.toggleModal()
}

function openImagePanel() {
  store.toggleImagePanel()
  if (store.isImageOpen) {
    store.imageResult = null // clear old results to show loading
    const query = store.lookupResult?.type === 'translate' ? store.lookupResult.original : store.lookupResult?.word
    if (query) {
      pycmdService.send(`image:search:${encodeURIComponent(JSON.stringify({ query: query.trim(), page: 1, page_size: 24, request_seq: 1 }))}`)
    }
  }
}

// Removed toggleDetails function
// Icons
const AUDIO_ICON_SVG = `<svg class="apl-audio-icon" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8.5v4"/><path d="M8.5 6.5v9"/><path d="M10.5 9.5v2"/><path d="M12.5 7.5v6.814"/><path d="M14.5 4.5v12"/></g></svg>`
const IMAGE_ICON_SVG = `<svg class="apl-image-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><rect x="2.8" y="4" width="14.4" height="12" rx="2"/><circle cx="7.2" cy="8" r="1.3"/><path d="M4.8 14l3.6-3.8 2.8 2.8 2.4-2.3 2.4 3.3"/></g></svg>`
const SETTINGS_ICON_SVG = `<svg class="apl-settings-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M8.2 2.6h3.6l.5 2.1a5.6 5.6 0 0 1 1.2.7l2-.8 1.8 3.1-1.5 1.5c.1.4.1.8.1 1.2s0 .8-.1 1.2l1.5 1.5-1.8 3.1-2-.8a5.6 5.6 0 0 1-1.2.7l-.5 2.1H8.2l-.5-2.1a5.6 5.6 0 0 1-1.2-.7l-2 .8-1.8-3.1L4.2 12a6 6 0 0 1-.1-1.2c0-.4 0-.8.1-1.2L2.7 8.1l1.8-3.1 2 .8a5.6 5.6 0 0 1 1.2-.7zm1.8 5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// Computed helpers
const pos = computed(() => {
  const meanings = store.lookupResult?.meanings
  if (!meanings || !meanings.length) return ''
  const first = meanings[0].partOfSpeech || ''
  return first.toLowerCase() === 'unknown' ? '' : first
})

const summaryMeaning = computed(() => {
  const r = store.lookupResult
  if (!r) return ''
  // Try translated -> definition_display -> first english definition
  return r.translated || r.definition_display || ''
})

const displayDefinition = computed(() => {
  const def = (store.lookupResult?.definition_display || '').trim();
  if (!def) return '';

  const defLower = def.toLowerCase();
  const summaryLower = summaryMeaning.value.trim().toLowerCase();
  
  const cleanDef = defLower.replace(/[.,;!?()[\]{}"']/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanSummary = summaryLower.replace(/[.,;!?()[\]{}"']/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!cleanDef) return t('See details');
  if (cleanDef === cleanSummary) return t('See details');
  
  if (cleanSummary.includes(cleanDef) || cleanDef.includes(cleanSummary)) {
    return t('See details');
  }
  
  const defWords = cleanDef.split(/\s+/).filter(Boolean);
  if (defWords.length <= 2) {
    return t('See details');
  }
  
  return def;
})

const isShortTranslate = computed(() => {
  const original = (store.lookupResult?.original || '').replace(/[\s，。！？、；：,\.!?;:]/g, '')
  return original.length <= 2
})

const isImageLoading = computed(() => store.isImageOpen && !store.imageResult)

</script>

<template>
  <div class="popover-wrapper">
    <div 
      ref="popoverRef"
      class="apl-popover" 
      :style="popoverStyleText" 
      role="dialog" 
      aria-live="polite"
    >
      <!-- Loading State -->
      <div v-if="store.isLoading" class="apl-body apl-body--loading-only">
        <div class="apl-loading" role="status" aria-live="polite" :aria-label="t('Searching...')">
          <span class="apl-loading-dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </div>
      </div>
      
      <!-- Error State -->
      <template v-else-if="store.error">
        <div class="apl-header">
          <span>{{ t('Lookup') }}</span>
        </div>
        <div class="apl-body">
          <div class="apl-error">{{ store.error }}</div>
        </div>
      </template>
      
      <!-- Translate Result -->
      <template v-else-if="store.lookupResult && store.lookupResult.type === 'translate'">
        <div class="apl-body apl-translate-compact apl-translate-hover-actions">
          <div class="apl-translate-vi apl-translate-vi--primary">
            <span class="apl-translate-text">
              {{ store.lookupResult.translated }}
              <span
                v-if="store.lookupResult.phonetic && isShortTranslate"
                class="apl-translate-phonetic-inline"
              >{{ store.lookupResult.phonetic }}</span>
            </span>
            <span
              v-if="store.lookupResult.phonetic && !isShortTranslate"
              class="apl-translate-phonetic-block"
            >{{ store.lookupResult.phonetic }}</span>
          </div>
          <div class="apl-inline-actions apl-translate-inline-actions">
            <button 
              class="apl-button apl-audio" 
              type="button" 
              :aria-label="t('Play audio')"
              :disabled="!settingsStore.toolSettings.enable_audio"
              @click="playAudio(store.lookupResult.audio_url)"
              v-html="AUDIO_ICON_SVG"
            ></button>
            <button 
              :class="['apl-button', 'apl-image-toggle', { 'apl-image-toggle--active': store.isImageOpen }]" 
              type="button" 
              :aria-label="t('Open image panel')" 
              :aria-pressed="store.isImageOpen"
              @click="openImagePanel"
            >
              <span v-if="isImageLoading" class="apl-loading-dots apl-btn-loader"><span></span><span></span><span></span></span>
              <span v-else class="apl-btn-icon" v-html="IMAGE_ICON_SVG"></span>
            </button>
            <button 
              class="apl-button apl-popover-settings apl-open-settings" 
              type="button" 
              :aria-label="t('Open settings')"
              @click="openSettings"
              v-html="SETTINGS_ICON_SVG"
            ></button>
          </div>
        </div>
      </template>
      
      <!-- Lookup Result -->
      <template v-else-if="store.lookupResult && store.lookupResult.type === 'lookup'">
        <div class="apl-body apl-lookup-compact">
          <div class="apl-lookup-headerline">
            <div class="apl-lookup-headertext">
              <span class="apl-lookup-summary">{{ summaryMeaning }}</span>
              <span v-if="store.lookupResult.phonetic" class="apl-lookup-phonetic-inline">{{ store.lookupResult.phonetic }}</span>
              <span v-if="pos" class="apl-pos-inline">{{ pos }}</span>
              
              <div class="apl-inline-actions">
                <button 
                  class="apl-button apl-audio apl-audio-mini" 
                  type="button" 
                  :aria-label="t('Play audio')"
                  :disabled="!settingsStore.toolSettings.enable_audio"
                  @click="playAudio(store.lookupResult.audio_url)"
                  v-html="AUDIO_ICON_SVG"
                ></button>
                <button 
                  :class="['apl-button', 'apl-image-toggle', 'apl-audio-mini', { 'apl-image-toggle--active': store.isImageOpen }]" 
                  type="button" 
                  :aria-label="t('Open image panel')" 
                  :aria-pressed="store.isImageOpen"
                  @click="openImagePanel"
                >
                  <span v-if="isImageLoading" class="apl-loading-dots apl-btn-loader"><span></span><span></span><span></span></span>
                  <span v-else class="apl-btn-icon" v-html="IMAGE_ICON_SVG"></span>
                </button>
                <button 
                  class="apl-button apl-popover-settings apl-audio-mini apl-open-settings" 
                  type="button" 
                  :aria-label="t('Open settings')"
                  @click="openSettings"
                  v-html="SETTINGS_ICON_SVG"
                ></button>
              </div>
            </div>
          </div>
          
          <button class="apl-lookup-definition-toggle" type="button" :aria-expanded="store.isDetailsOpen" @click="store.toggleDetails">
            <span class="apl-definition-toggle-icon">{{ store.isDetailsOpen ? '−' : '+' }}</span>
            <span class="apl-lookup-definition">{{ displayDefinition }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles can be added here if needed, but it should inherit global popup.css automatically */
</style>
