<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '../../stores/settings.store'
import ThemeToggle from './ThemeToggle.vue'
import CustomSelect from '../common/CustomSelect.vue'
import { useI18n } from '../../composables/useI18n'

const store = useSettingsStore()
const { t } = useI18n()

declare const __APP_VERSION__: string;
const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.7.0';

const languages = [
  { code: 'auto', name: 'Auto' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'fi', name: 'Finnish' },
  { code: 'ru', name: 'Russian' }
]

const inputLanguageOptions = computed(() => languages.map(l => ({ value: l.code, label: t(l.name) })))
const outputLanguageOptions = computed(() => languages.filter(l => l.code !== 'auto').map(l => ({ value: l.code, label: t(l.name) })))


function swapLanguages() {
  const currentSrc = store.languages.source_language
  const currentTgt = store.languages.target_language
  
  if (currentSrc === 'auto') {
    store.languages.source_language = currentTgt
    // Find a logical target language instead of hardcoding 'en'
    store.languages.target_language = currentTgt === 'vi' ? 'en' : 'vi'
  } else {
    store.languages.source_language = currentTgt
    store.languages.target_language = currentSrc
  }
  store.saveSettings()
}

function handleSave() {
  store.saveSettings()
}

function close() {
  store.toggleModal()
}


const FONT_SIZE_PRESETS = [16, 18, 20, 22, 24, 26, 28, 30]

const fontSizeOptions = computed(() => {
  const opts: {value: string | number, label: string}[] = FONT_SIZE_PRESETS.map(px => ({ value: px, label: `${px}px` }))
  opts.push({ value: 'custom', label: t('Custom') })
  opts.push({ value: 0, label: t('Default') })
  return opts
})

const isCustomMode = ref(false)

watch(() => store.popover.font_size_px, (newPx) => {
  if (newPx !== 0 && !FONT_SIZE_PRESETS.includes(Number(newPx))) {
    isCustomMode.value = true
  } else {
    isCustomMode.value = false
  }
}, { immediate: true })

const selectedFontSize = computed({
  get() {
    if (isCustomMode.value) return 'custom'
    if (store.popover.font_size_px === 0) return 0
    return store.popover.font_size_px
  },
  set(val: string | number) {
    if (val === 'custom') {
      isCustomMode.value = true
    } else {
      isCustomMode.value = false
      store.popover.font_size_px = Number(val)
      store.saveSettings()
    }
  }
})

function handleFontSizeInput(e: Event) {
  if (!isCustomMode.value) return // Prevent blur/change on unmount from overriding Default selection
  const val = Number((e.target as HTMLInputElement).value)
  if (isNaN(val) || val < 8 || val > 40) return
  store.popover.font_size_px = val
  store.saveSettings()
}
</script>

<template>
  <div class="settings-modal-wrapper">
    <div class="apl-settings-overlay" role="dialog" aria-modal="true" @mousedown.self="close">
      <div class="apl-settings-modal">
        <!-- Header -->
        <div class="apl-settings-header apl-settings-header--pro">
          <div class="apl-settings-title-group">
            <h1 class="apl-settings-title">
              DictOver 
              <span class="apl-settings-version-badge">v{{ version }}</span>
            </h1>
            <p class="apl-settings-subtitle">{{ t('Popup Dictionary Settings') }}</p>
          </div>
          <a class="apl-settings-support-link" href="https://langochung.me" target="_blank">
            <div class="apl-settings-support-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <div class="apl-settings-support-text">
              <span class="apl-settings-support-title">{{ t('Feedback & Support') }}</span>
              <span class="apl-settings-support-author">Made by langochung.me</span>
            </div>
          </a>
        </div>

        <!-- Languages -->
        <div class="apl-settings-section">
          <div class="apl-settings-language-row">
            <label class="apl-settings-field">
              <span>{{ t('Input Language') }}</span>
              <CustomSelect v-model="store.languages.source_language" :options="inputLanguageOptions" @change="handleSave" />
            </label>
            <button class="apl-button apl-settings-swap-languages" @click="swapLanguages">↔</button>
            <label class="apl-settings-field">
              <span>{{ t('Output Language') }}</span>
              <CustomSelect v-model="store.languages.target_language" :options="outputLanguageOptions" @change="handleSave" />
            </label>
          </div>
        </div>

        <!-- Trigger Mode -->
        <div class="apl-settings-section">
          <label class="apl-settings-radio">
            <input class="apl-settings-trigger-mode" type="radio" value="auto" v-model="store.popover.trigger_mode" @change="handleSave" />
            {{ t('Auto trigger on selection') }}
          </label>
          <div class="apl-settings-radio-shortcut-row">
            <label class="apl-settings-radio apl-settings-radio--inline">
              <input class="apl-settings-trigger-mode" type="radio" value="shortcut" v-model="store.popover.trigger_mode" @change="handleSave" />
              {{ t('Trigger with shortcut') }}
            </label>
            <div class="apl-settings-shortcut-group">
              <label class="apl-settings-field apl-settings-field--shortcut-inline">
                <span>{{ t('Shortcut') }}</span>
                <input class="apl-settings-shortcut-input" type="text" readonly v-model="store.popover.shortcut_combo" :disabled="store.popover.trigger_mode !== 'shortcut'" />
              </label>
            </div>
          </div>
          <div class="apl-settings-shortcut-group">
            <div class="apl-settings-hint">{{ t('Select text and hold shortcut key to translate.') }}</div>
          </div>
        </div>

        <!-- Panel Layout -->
        <div class="apl-settings-section">
          <div class="apl-settings-panel-definition-layout">
            <div class="apl-settings-panel-definition-column">
              <div class="apl-settings-section-title">{{ t('Sub-panel Mode') }}</div>
              <label class="apl-settings-radio">
                <input class="apl-settings-panel-open-mode" type="radio" value="none" v-model="store.popover.panel_open_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Manual (Click to open)') }}</span>
              </label>
              <label class="apl-settings-radio">
                <input class="apl-settings-panel-open-mode" type="radio" value="details" v-model="store.popover.panel_open_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Auto-open details') }}</span>
              </label>
              <label class="apl-settings-radio">
                <input class="apl-settings-panel-open-mode" type="radio" value="images" v-model="store.popover.panel_open_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Auto-open images') }}</span>
              </label>
            </div>
            
            <div class="apl-settings-panel-definition-column apl-settings-panel-definition-column--right">
              <div class="apl-settings-section-title">{{ t('Definition Language') }}</div>
              <label class="apl-settings-radio">
                <input class="apl-settings-definition-language-mode" type="radio" value="output" v-model="store.popover.definition_language_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Match Output Language') }}</span>
              </label>
              <label class="apl-settings-radio">
                <input class="apl-settings-definition-language-mode" type="radio" value="input" v-model="store.popover.definition_language_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Match Input Language') }}</span>
              </label>
              <label class="apl-settings-radio">
                <input class="apl-settings-definition-language-mode" type="radio" value="english" v-model="store.popover.definition_language_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Always English') }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Audio & Theme -->
        <div class="apl-settings-section">
          <div class="apl-settings-audio-home-layout">
            <div class="apl-settings-audio-home-column">
              <div class="apl-settings-section-title">{{ t('Auto-play Audio') }}</div>
              <label class="apl-settings-radio">
                <input class="apl-settings-auto-play-audio-mode" type="radio" value="off" v-model="store.popover.auto_play_audio_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Off (Manual play)') }}</span>
              </label>
              <label class="apl-settings-radio">
                <input class="apl-settings-auto-play-audio-mode" type="radio" value="word" v-model="store.popover.auto_play_audio_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Single Words Only') }}</span>
              </label>
              <label class="apl-settings-radio">
                <input class="apl-settings-auto-play-audio-mode" type="radio" value="all" v-model="store.popover.auto_play_audio_mode" @change="handleSave" />
                <span class="apl-settings-radio-label">{{ t('Everything') }}</span>
              </label>

              <label class="apl-settings-toggle apl-settings-toggle--inline apl-settings-hide-btn-inline">
                <input class="apl-settings-hide-home-settings-button" type="checkbox" v-model="store.popover.hide_home_settings_button" @change="handleSave" />
                {{ t('Hide home settings button') }}
              </label>
            </div>
            
            <div class="apl-settings-home-toggle-column">
              <div class="apl-settings-section-title">{{ t('Theme & Home') }}</div>
              <ThemeToggle @change="handleSave" />
              
              <label class="apl-settings-field apl-settings-field--font-size">
                <div class="apl-settings-section-title">{{ t('Text size') }}</div>
                <div class="apl-settings-font-size-control">
                  <CustomSelect
                    class="apl-settings-select--font-size"
                    v-model="selectedFontSize"
                    :options="fontSizeOptions"
                    placement="top"
                  />
                  <input
                    v-if="isCustomMode"
                    class="apl-settings-font-size-input"
                    type="number"
                    min="8"
                    max="40"
                    placeholder="8-40"
                    :value="store.popover.font_size_px !== 0 ? store.popover.font_size_px : ''"
                    @change="handleFontSizeInput"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style>
@import './styles/settings-modal.css';
</style>
