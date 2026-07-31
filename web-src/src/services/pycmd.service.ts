export const pycmdService = {
  /**
   * Send a command to Anki's backend
   */
  send(cmd: string) {
    if (typeof (window as any).pycmd !== 'undefined') {
      ;(window as any).pycmd(cmd)
    } else {
      // Trigger a mock response if we are in preview mode
      if (cmd.startsWith('settings:get')) {
        setTimeout(() => {
          this.mockSettingsResponse()
        }, 100)
      }
    }
  },

  /**
   * Mock response for preview.html testing
   */
  mockSettingsResponse() {
    const mockData = {
      type: 'settings_state',
      languages: { source_language: 'auto', target_language: 'vi' },
      popover: {
        trigger_mode: 'auto',
        shortcut_combo: 'Shift',
        auto_play_audio_mode: 'off',
        hide_home_settings_button: false,
        theme: 'dark',
        panel_open_mode: 'none',
        definition_language_mode: 'output'
      },
      tool_settings: {
        enable_lookup: true,
        enable_translate: true,
        enable_audio: true
      }
    }
    
    // Simulate Anki calling the global callback
    if (typeof (window as any).updatePopover === 'function') {
      ;(window as any).updatePopover(mockData)
    }
  }
}
