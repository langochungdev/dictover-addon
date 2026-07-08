<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { usePopoverStore } from '../../stores/popover.store'
import { useI18n } from '../../composables/useI18n'

const store = usePopoverStore()
const { t } = useI18n()
const subPanelRef = ref<HTMLElement | null>(null)
const computedStyle = ref({ top: '-9999px', left: '-9999px', transform: 'none' })

watch([() => store.isDetailsOpen, () => store.rect], async ([isOpen]) => {
  if (isOpen) {
    await nextTick()
    if (!subPanelRef.value) return
    const el = subPanelRef.value
    
    // We get the main popover element from DOM
    const mainPopover = document.querySelector('.apl-popover') as HTMLElement
    if (!mainPopover) return
    
    const mainRect = mainPopover.getBoundingClientRect()
    const width = el.offsetWidth || 300
    const height = el.offsetHeight || 280
    const gap = 8
    
    // Default placement: right-bottom of the main popover
    let left = mainRect.right + gap
    let top = mainRect.bottom - height
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 12
    
    // Check overflow and adjust
    if (left + width + margin > viewportWidth) {
      // Try left side
      left = mainRect.left - width - gap
    }
    
    if (top < margin) {
      top = mainRect.top
    }
    
    if (top + height + margin > viewportHeight) {
      top = viewportHeight - height - margin
    }
    
    // Ensure it doesn't go off-screen left
    if (left < margin) {
      left = margin
    }

    computedStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'none'
    }
  } else {
    computedStyle.value = { top: '-9999px', left: '-9999px', transform: 'none' }
  }
}, { immediate: true })

</script>

<template>
  <div v-show="store.isDetailsOpen">
    <div 
      ref="subPanelRef"
      class="apl-subpanel apl-subpanel--details" 
      role="dialog" 
      aria-modal="false"
      :style="computedStyle"
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
