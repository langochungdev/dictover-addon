import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { pycmdService } from '../services/pycmd.service'

export const useSettingsStore = defineStore('settings', () => {
  const isLoaded = ref(false)
  const isModalOpen = ref(false)

  const languages = ref({
    source_language: 'auto',
    target_language: 'vi'
  })

  const popover = ref({
    trigger_mode: 'auto', // auto, shortcut, none
    shortcut_combo: 'Shift',
    auto_play_audio_mode: 'off', // off, word, always
    hide_home_settings_button: false,
    theme: 'dark', // dark, light, auto
    panel_open_mode: 'none', // none, definition, images
    definition_language_mode: 'output' // output, target, input
  })

  const toolSettings = ref({
    enable_lookup: true,
    enable_translate: true,
    enable_audio: true
  })

  // Watch for theme changes and apply them globally
  watch(() => popover.value.theme, (newTheme) => {
    let actualTheme = newTheme
    if (newTheme === 'auto') {
      actualTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', actualTheme)
  }, { immediate: true })

  function updateState(data: any) {
    if (data.languages) {
      languages.value = { ...languages.value, ...data.languages }
    }
    if (data.settings) {
      popover.value = {
        trigger_mode: data.settings.popover_trigger_mode ?? popover.value.trigger_mode,
        shortcut_combo: data.settings.popover_shortcut ?? popover.value.shortcut_combo,
        auto_play_audio_mode: data.settings.auto_play_audio_mode ?? popover.value.auto_play_audio_mode,
        hide_home_settings_button: data.settings.hide_home_settings_button ?? popover.value.hide_home_settings_button,
        theme: data.settings.popover_theme ?? popover.value.theme,
        panel_open_mode: data.settings.popover_open_panel_mode ?? popover.value.panel_open_mode,
        definition_language_mode: data.settings.popover_definition_language_mode ?? popover.value.definition_language_mode
      }
      
      toolSettings.value = {
        enable_lookup: data.settings.enable_lookup ?? toolSettings.value.enable_lookup,
        enable_translate: data.settings.enable_translate ?? toolSettings.value.enable_translate,
        enable_audio: data.settings.enable_audio ?? toolSettings.value.enable_audio
      }
    }
    isLoaded.value = true
  }

  function toggleModal() {
    isModalOpen.value = !isModalOpen.value
  }

  function saveSettings() {
    const payload = encodeURIComponent(
      JSON.stringify({
        enable_lookup: toolSettings.value.enable_lookup,
        enable_translate: toolSettings.value.enable_translate,
        enable_audio: toolSettings.value.enable_audio,
        auto_play_audio_mode: popover.value.auto_play_audio_mode,
        auto_play_audio: popover.value.auto_play_audio_mode !== 'off',
        hide_home_settings_button: popover.value.hide_home_settings_button,
        popover_theme: popover.value.theme,
        popover_trigger_mode: popover.value.trigger_mode,
        popover_shortcut: popover.value.shortcut_combo,
        popover_open_panel_mode: popover.value.panel_open_mode,
        popover_definition_language_mode: popover.value.definition_language_mode,
        languages: {
          source_language: languages.value.source_language,
          target_language: languages.value.target_language,
        },
      })
    );
    pycmdService.send(`settings:save:${payload}`)
  }

  return {
    isLoaded,
    isModalOpen,
    languages,
    popover,
    toolSettings,
    updateState,
    toggleModal,
    saveSettings
  }
})
