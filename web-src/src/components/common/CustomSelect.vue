<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: { value: string | number, label: string }[]
  placement?: 'top' | 'bottom'
}>(), {
  placement: 'bottom'
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

watch(isOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (dropdownRef.value) {
      if (props.placement === 'top') {
        dropdownRef.value.scrollTop = dropdownRef.value.scrollHeight
      }
      const selectedEl = dropdownRef.value.querySelector('.is-selected') as HTMLElement
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }
})

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : ''
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectOption(option: { value: string | number }) {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="custom-select" ref="selectRef" :class="{ 'is-open': isOpen }">
    <div class="custom-select-trigger" @click="toggleOpen">
      <!-- Sizer to make the select element match the widest option, preventing jumping -->
      <div class="custom-select-sizer" aria-hidden="true">
        <div v-for="option in options" :key="option.value">{{ option.label }}</div>
      </div>
      <span class="custom-select-value">{{ selectedLabel }}</span>
      <svg class="custom-select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    
    <div class="custom-select-dropdown" :class="['is-placement-' + placement]" v-show="isOpen" ref="dropdownRef">
      <ul class="custom-select-list">
        <li 
          v-for="option in options" 
          :key="option.value" 
          class="custom-select-item"
          :class="{ 'is-selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
@import './styles/custom-select.css';
</style>
