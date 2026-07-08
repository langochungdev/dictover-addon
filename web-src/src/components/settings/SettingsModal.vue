<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings.store'
import ThemeToggle from './ThemeToggle.vue'
import { useI18n } from '../../composables/useI18n'

const store = useSettingsStore()
const { t } = useI18n()

const languages = [
  { code: 'auto', name: 'Auto' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' }
]

function swapLanguages() {
  const currentSrc = store.languages.source_language
  const currentTgt = store.languages.target_language
  
  if (currentSrc === 'auto') {
    store.languages.source_language = currentTgt
    store.languages.target_language = 'en'
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
</script>

<template>
  <div class="settings-modal-wrapper">
    <div class="apl-settings-overlay" role="dialog" aria-modal="true" @mousedown.self="close">
      <div class="apl-settings-modal">
        <!-- Header -->
        <div class="apl-settings-header">
          <div class="apl-settings-brand">
            <a class="apl-settings-avatar-link" href="https://langochung.me" target="_blank">
              <svg class="apl-settings-avatar" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="19" fill="var(--accent)"/>
                <circle cx="19" cy="15" r="6" fill="rgba(255,255,255,0.9)"/>
                <ellipse cx="19" cy="30" rx="10" ry="7" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </a>
            <div class="apl-settings-brand-meta">
              <a class="apl-settings-site-link" href="https://langochung.me" target="_blank">langochung.me</a>
              <span class="apl-settings-version">DictOver</span>
              <span class="apl-settings-support-note">&lt;- báo lỗi và yêu cầu feature</span>
            </div>
          </div>

        </div>

        <!-- Languages -->
        <div class="apl-settings-section">
          <div class="apl-settings-language-row">
            <label class="apl-settings-field">
              <span>{{ t('Input Language') }}</span>
              <select class="apl-settings-select" v-model="store.languages.source_language" @change="handleSave">
                <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ t(lang.name) }}</option>
              </select>
            </label>
            <button class="apl-button apl-settings-swap-languages" @click="swapLanguages">↔</button>
            <label class="apl-settings-field">
              <span>{{ t('Output Language') }}</span>
              <select class="apl-settings-select" v-model="store.languages.target_language" @change="handleSave">
                <option v-for="lang in languages.filter(l => l.code !== 'auto')" :key="lang.code" :value="lang.code">{{ t(lang.name) }}</option>
              </select>
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
            </div>
            
            <div class="apl-settings-home-toggle-column">
              <div class="apl-settings-section-title">{{ t('Theme & Home') }}</div>
              <ThemeToggle @change="handleSave" />
              
              <label class="apl-settings-toggle apl-settings-toggle--inline" style="margin-top: 14px;">
                <input class="apl-settings-hide-home-settings-button" type="checkbox" v-model="store.popover.hide_home_settings_button" @change="handleSave" />
                {{ t('Hide home settings button') }}
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import './styles/settings-modal.css';
</style>
