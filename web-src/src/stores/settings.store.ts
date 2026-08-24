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
    trigger_mode: 'auto',
    shortcut_combo: 'Shift',
    auto_play_audio_mode: 'off',
    hide_home_settings_button: (window as any).__aplRuntimeBootstrap?.hide_home_settings_button ?? false,
    theme: (window as any).__aplRuntimeBootstrap?.popover_theme ?? 'dark',
    panel_open_mode: 'none',
    definition_language_mode: 'output',
    font_size_px: 0
  })

  const toolSettings = ref({
    enable_lookup: true,
    enable_translate: true,
    enable_audio: true,
    enable_edit_field_during_review: (window as any).__aplRuntimeBootstrap?.enable_edit_field_during_review ?? false,
    seen_edit_field_new: (window as any).__aplRuntimeBootstrap?.seen_edit_field_new ?? false
  })

  watch(() => popover.value.theme, (newTheme) => {
    if (newTheme === 'auto') {
      popover.value.theme = 'dark'
      return
    }
    document.documentElement.setAttribute('data-apl-theme', newTheme)
  }, { immediate: true })

  watch(() => popover.value.font_size_px, (newPx) => {
    if (!newPx || newPx === 0) {
      document.documentElement.style.removeProperty('--apl-user-font-size')
    } else {
      const px = Math.min(40, Math.max(8, Number(newPx)))
      document.documentElement.style.setProperty('--apl-user-font-size', `${px}px`)
    }
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
        definition_language_mode: data.settings.popover_definition_language_mode ?? popover.value.definition_language_mode,
        font_size_px: data.settings.popover_font_size_px ?? popover.value.font_size_px
      }

      toolSettings.value = {
        enable_lookup: data.settings.enable_lookup ?? toolSettings.value.enable_lookup,
        enable_translate: data.settings.enable_translate ?? toolSettings.value.enable_translate,
        enable_audio: data.settings.enable_audio ?? toolSettings.value.enable_audio,
        enable_edit_field_during_review: data.settings.enable_edit_field_during_review ?? toolSettings.value.enable_edit_field_during_review,
        seen_edit_field_new: data.settings.seen_edit_field_new ?? toolSettings.value.seen_edit_field_new
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
        enable_edit_field_during_review: toolSettings.value.enable_edit_field_during_review,
        seen_edit_field_new: toolSettings.value.seen_edit_field_new,
        auto_play_audio_mode: popover.value.auto_play_audio_mode,
        auto_play_audio: popover.value.auto_play_audio_mode !== 'off',
        hide_home_settings_button: popover.value.hide_home_settings_button,
        popover_theme: popover.value.theme,
        popover_trigger_mode: popover.value.trigger_mode,
        popover_shortcut: popover.value.shortcut_combo,
        popover_open_panel_mode: popover.value.panel_open_mode,
        popover_definition_language_mode: popover.value.definition_language_mode,
        popover_font_size_px: popover.value.font_size_px,
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
