<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePopoverStore } from '../../stores/popover.store'
import { useSettingsStore } from '../../stores/settings.store'

const store = usePopoverStore()
const settingsStore = useSettingsStore()
const subPanelRef = ref<HTMLElement | null>(null)
const computedStyle = ref({ top: '-9999px', left: '-9999px', transform: 'none' })

const computedStyleText = computed(() => {
  const px = settingsStore.popover.font_size_px
  const fs = px && px > 0 ? `font-size: ${px}px !important;` : ''
  return `top: ${computedStyle.value.top}; left: ${computedStyle.value.left}; transform: ${computedStyle.value.transform}; ${fs}`
})

const imageResult = computed(() => store.imageResult)

watch([() => store.isImageOpen, () => store.rect, () => store.imageResult], ([isOpen]) => {
  if (isOpen) {
    if (!subPanelRef.value) return
    const mainPopover = document.querySelector('.apl-popover') as HTMLElement
    if (!mainPopover) return
    
    const mainRect = mainPopover.getBoundingClientRect()
    // Always predict placement based on the full panel size to avoid jumping
    // We get actual width/height or default to full panel max sizes
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 12
    const gap = 8
    
    // Estimate final width of the image panel to decide placement
    const finalWidth = Math.min(440, viewportWidth - 24)
    
    let isLeftSide = false
    if (mainRect.right + gap + finalWidth + margin > viewportWidth) {
      isLeftSide = true
    }
    
    const actualHeight = store.imageResult ? (subPanelRef.value?.offsetHeight || 360) : (subPanelRef.value?.offsetHeight || 46)
    
    let top = mainRect.top
    // Prevent overflowing the bottom of the viewport
    if (top + actualHeight + margin > viewportHeight) {
      top = viewportHeight - actualHeight - margin
    }
    // Prevent overflowing the top of the viewport
    if (top < margin) {
      top = margin
    }

    const newStyle: Record<string, string> = {
      top: `${top}px`,
      transform: 'none',
      left: 'auto',
      right: 'auto'
    }

    // Force strict dimensions if it's the loader to ensure it's never huge
    if (!store.imageResult) {
      newStyle.width = 'max-content'
      newStyle.height = 'max-content'
      newStyle.minWidth = '40px'
      newStyle.minHeight = '38px'
    }

    if (isLeftSide) {
      // Pin to the right edge (which is left of the main popover)
      const rightCoord = viewportWidth - mainRect.left + gap
      newStyle.right = `${rightCoord}px`
    } else {
      // Pin to the left edge (which is right of the main popover)
      let leftCoord = mainRect.right + gap
      if (leftCoord < margin) leftCoord = margin
      newStyle.left = `${leftCoord}px`
    }

    computedStyle.value = newStyle as any
  } else {
    computedStyle.value = { top: '-9999px', left: '-9999px', transform: 'none' } as any
  }
}, { immediate: true, flush: 'post' })

</script>

<template>
  <div v-if="store.isImageOpen">
    <!-- Loader before images arrive -->
    <div 
      v-if="!imageResult"
      key="loader"
      ref="subPanelRef"
      class="apl-popover apl-image-preload-loader"
      :style="computedStyle"
    >
      <div class="apl-body apl-body--loading-only">
        <div class="apl-loading">
          <span class="apl-loading-dots"><span></span><span></span><span></span></span>
        </div>
      </div>
    </div>

    <!-- Full Image Panel when images arrive -->
    <div 
      v-else
      key="panel"
      ref="subPanelRef"
      class="apl-subpanel apl-subpanel--images" 
      role="dialog" 
      aria-modal="false"
      :style="computedStyleText"
    >
      <div class="apl-subpanel-body apl-image-subpanel-body">
        <div class="apl-image-results">
          <div class="apl-image-grid" v-if="imageResult.options && imageResult.options.length > 0">
            <a 
              v-for="(img, idx) in imageResult.options" 
              :key="idx" 
              :href="img.pageUrl" 
              target="_blank" 
              class="apl-image-card"
            >
              <img :src="img.src" :alt="img.title" class="apl-image-thumb" />
            </a>
          </div>
          <div class="apl-image-status" v-if="imageResult.error" :class="{ 'apl-image-status--error': true }">
            {{ imageResult.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
