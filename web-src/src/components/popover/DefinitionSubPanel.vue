<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePopoverStore } from '../../stores/popover.store'
import { useSettingsStore } from '../../stores/settings.store'
import { useI18n } from '../../composables/useI18n'

import { offset, flip, size, useFloating, autoUpdate } from '@floating-ui/vue'

const store = usePopoverStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const subPanelRef = ref<HTMLElement | null>(null)
const mainPopoverEl = ref<HTMLElement | null>(null)

watch(() => store.isDetailsOpen, (isOpen: boolean) => {
  if (isOpen) {
    mainPopoverEl.value = document.querySelector('.apl-popover') as HTMLElement
  } else {
    mainPopoverEl.value = null
  }
}, { immediate: true })

useFloating(mainPopoverEl, subPanelRef, {
  placement: 'right-end',
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(8),
    flip({ fallbackPlacements: ['left-end', 'bottom', 'top'], fallbackStrategy: 'initialPlacement' }),
    size({
      padding: 12,
      apply({ availableWidth, availableHeight, elements, x, y }) {
        Object.assign(elements.floating.style, {
          maxWidth: `${Math.min(440, availableWidth)}px`,
          maxHeight: `${availableHeight}px`,
          top: `${y}px`,
          left: `${x}px`,
          transform: 'none'
        })
      }
    })
  ],
})

const computedStyleText = computed(() => {
  const px = settingsStore.popover.font_size_px
  const fs = px && px > 0 ? `font-size: ${px}px !important;` : ''
  if (!store.isDetailsOpen) {
    return `top: -9999px; left: -9999px; transform: none; ${fs}`
  }
  return `position: fixed; ${fs}`
})

</script>

<template>
  <div v-show="store.isDetailsOpen">
    <div 
      ref="subPanelRef"
      class="apl-subpanel apl-subpanel--details" 
      role="dialog" 
      aria-modal="false"
      :style="computedStyleText"
    >
      <div class="apl-subpanel-body">
        <template v-if="store.lookupResult?.meanings && store.lookupResult.meanings.length">
          <div class="apl-meaning" v-for="(meaning, idx) in store.lookupResult.meanings" :key="idx">
            <div class="apl-pos" v-if="meaning.partOfSpeech && meaning.partOfSpeech.toLowerCase() !== 'unknown'">
              {{ meaning.partOfSpeech }}
            </div>
            <div class="apl-def" v-for="(def, dIdx) in meaning.definitions" :key="dIdx">
              {{ def.definition }}
              <div class="apl-example" v-if="def.example">Example: "{{ def.example }}"</div>
            </div>
          </div>
        </template>
        <div class="apl-error" v-else>{{ t('No definition found.') }}</div>
      </div>
    </div>
  </div>
</template>
