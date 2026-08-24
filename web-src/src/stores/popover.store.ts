import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pycmdService } from '../services/pycmd.service'

export const usePopoverStore = defineStore('popover', () => {
  const isVisible = ref(false)
  const lookupResult = ref<any>(null)
  const isLoading = ref(false)
  const error = ref('')
  const isDetailsOpen = ref(false)

  const isImageOpen = ref(false)
  const imageResult = ref<any>(null)

  function show(data: any) {
    if (data.type === 'lookup' || data.type === 'translate') {
      lookupResult.value = data
      error.value = ''
      isLoading.value = false
      isVisible.value = true
      isDetailsOpen.value = false
      isImageOpen.value = false
    } else if (data.type === 'error') {
      error.value = data.message || 'An error occurred'
      isLoading.value = false
      isVisible.value = true
      isDetailsOpen.value = false
      isImageOpen.value = false
    } else if (data.type === 'image_search_result') {
      imageResult.value = data
      isLoading.value = false
    }
  }

  const rect = ref<DOMRect | null>(null)

  function setPosition(newRect: DOMRect) {
    rect.value = newRect
  }

  function hide() {
    if (isVisible.value) {
      pycmdService.send('audio:stop')
    }
    isVisible.value = false
    isDetailsOpen.value = false
    isImageOpen.value = false
  }

  function toggleDetails() {
    isDetailsOpen.value = !isDetailsOpen.value
    if (isDetailsOpen.value) isImageOpen.value = false
  }

  function toggleImagePanel() {
    isImageOpen.value = !isImageOpen.value
    if (isImageOpen.value) isDetailsOpen.value = false
  }

  let audioFallbackTimeout: any = null

  function playAudio(_url?: string) {
    if (audioFallbackTimeout) clearTimeout(audioFallbackTimeout)
    audioFallbackTimeout = null
    
    const text = lookupResult.value?.type === 'translate' 
      ? lookupResult.value?.original 
      : lookupResult.value?.word
    const lang = lookupResult.value?.audio_lang || 'en'
    
    if (text) {
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`
      
      pycmdService.send(`audio:play:${encodeURIComponent(googleUrl)}`)
      
      audioFallbackTimeout = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(utterance)
      }, 4500)
    }
  }

  function handleAudioResult(ok: boolean) {
    if (audioFallbackTimeout) {
      clearTimeout(audioFallbackTimeout)
      audioFallbackTimeout = null
    }
    
    if (!ok) {
      const text = lookupResult.value?.type === 'translate' 
        ? lookupResult.value?.original 
        : lookupResult.value?.word
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  return {
    isVisible,
    rect,
    lookupResult,
    isLoading,
    error,
    isDetailsOpen,
    isImageOpen,
    imageResult,
    show,
    setPosition,
    hide,
    toggleDetails,
    toggleImagePanel,
    playAudio,
    handleAudioResult
  }
})
