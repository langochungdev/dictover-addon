from __future__ import annotations

from anki.hooks import field_filter
from aqt import gui_hooks, mw

from .review import (
    on_card_will_show,
    on_field_filter,
    on_js_message,
    on_webview_will_set_content,
)



from typing import Callable
_is_enabled: Callable[[], bool] = lambda: False

def is_enabled() -> bool:
    return _is_enabled()

def setup_edit_field(get_is_enabled: Callable[[], bool]) -> None:
    global _is_enabled
    _is_enabled = get_is_enabled
    field_filter.append(on_field_filter)
    gui_hooks.webview_will_set_content.append(on_webview_will_set_content)
    gui_hooks.card_will_show.append(on_card_will_show)
    gui_hooks.webview_did_receive_js_message.append(on_js_message)
