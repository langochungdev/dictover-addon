<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings.store'

const store = useSettingsStore()

const emit = defineEmits(['change'])

function handleChange() {
  emit('change')
}
</script>

<template>
  <div class="theme-toggle-wrapper">
    <label class="apl-settings-radio">
      <input class="apl-settings-theme" type="radio" value="dark" v-model="store.popover.theme" @change="handleChange" />
      <span class="apl-settings-radio-label">Dark Mode</span>
    </label>
    <label class="apl-settings-radio">
      <input class="apl-settings-theme" type="radio" value="light" v-model="store.popover.theme" @change="handleChange" />
      <span class="apl-settings-radio-label">Light Mode</span>
    </label>
  </div>
</template>

<style scoped>
/* Scoped styles if necessary */
</style>
