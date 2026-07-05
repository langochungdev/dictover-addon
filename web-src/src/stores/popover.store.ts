import { defineStore } from 'pinia'
import { ref } from 'vue'

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
    toggleImagePanel
  }
})
