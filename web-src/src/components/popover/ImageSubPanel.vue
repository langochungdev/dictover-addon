<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePopoverStore } from '../../stores/popover.store'
import { useSettingsStore } from '../../stores/settings.store'

import { offset, flip, shift, size, useFloating, autoUpdate } from '@floating-ui/vue'

const store = usePopoverStore()
const settingsStore = useSettingsStore()
const subPanelRef = ref<HTMLElement | null>(null)
const mainPopoverEl = ref<HTMLElement | null>(null)

const imageResult = computed(() => store.imageResult)

watch(() => store.isImageOpen, (isOpen: boolean) => {
  if (isOpen) {
    mainPopoverEl.value = document.querySelector('.apl-popover') as HTMLElement
  } else {
    mainPopoverEl.value = null
  }
}, { immediate: true })

const { floatingStyles } = useFloating(mainPopoverEl, subPanelRef, {
  placement: 'right-start',
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(8),
    flip({ fallbackPlacements: ['left-start', 'bottom', 'top'] }),
    shift({ padding: 12 }),
    size({
      padding: 12,
      apply({ availableWidth, availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          maxWidth: `${Math.min(440, availableWidth)}px`,
          maxHeight: `${availableHeight}px`
        })
      }
    })
  ],
})

const computedStyleText = computed(() => {
  const px = settingsStore.popover.font_size_px
  const fs = px && px > 0 ? `font-size: ${px}px !important;` : ''
  
  if (!store.isImageOpen) {
    return `top: -9999px; left: -9999px; transform: none; ${fs}`
  }

  let extraStyles = ''
  if (!store.imageResult) {
    extraStyles = 'width: max-content; height: max-content; min-width: 40px; min-height: 38px;'
  }

  return `position: ${floatingStyles.value.position || 'fixed'}; top: ${floatingStyles.value.top || 0}; left: ${floatingStyles.value.left || 0}; transform: ${floatingStyles.value.transform || 'none'}; ${extraStyles} ${fs}`
})

</script>

<template>
  <div v-if="store.isImageOpen">
    <!-- Loader before images arrive -->
    <div 
      v-if="!imageResult"
      key="loader"
      ref="subPanelRef"
      class="apl-popover apl-image-preload-loader"
      :style="computedStyleText"
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
