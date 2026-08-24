from __future__ import annotations

import json
from typing import Any

from anki.cards import Card
from anki.template import TemplateRenderContext
from aqt.browser.previewer import Previewer
from aqt.reviewer import Reviewer
from aqt.utils import tooltip
from aqt.webview import AnkiWebView, WebContent

from . import constants, logic, handler
from .logic import SaveRequest
from .strings import tr

ReviewContext = Reviewer | Previewer


def _log(where: str, exc: Exception) -> None:
    print(f"{constants.LOG_PREFIX} {where}: {exc!r}")


def _webview(context: ReviewContext) -> AnkiWebView | None:
    if isinstance(context, Reviewer):
        return context.web
    return getattr(context, "_web", None)


def _card(context: ReviewContext) -> Card | None:
    if isinstance(context, Reviewer):
        return context.card
    return context.card()


def on_field_filter(
    text: str, field_name: str, filter_name: str, context: TemplateRenderContext
) -> str:
    return text


def on_webview_will_set_content(
    web_content: WebContent, context: object | None
) -> None:
    try:
        if not isinstance(context, (Reviewer, Previewer)):
            return
        if not handler.is_enabled():
            return
        web_content.css.append(constants.CSS_URL)
        web_content.js.append(constants.JS_URL)
    except Exception as exc:
        _log("webview_will_set_content", exc)


def on_card_will_show(text: str, card: Card, kind: str) -> str:
    try:
        if kind not in constants.REVIEW_CONTEXTS:
            return text
        if not handler.is_enabled():
            return text
        side = (
            constants.SIDE_QUESTION
            if kind in constants.QUESTION_CONTEXTS
            else constants.SIDE_ANSWER
        )
        payload = json.dumps(logic.build_payload(card, side), ensure_ascii=False)
        payload = payload.replace("</", r"<\//")
        return f"<script>window.LFE && window.LFE.init({payload});</script>{text}"
    except Exception as exc:
        _log("card_will_show", exc)
        return text


def on_js_message(
    handled: tuple[bool, Any], message: str, context: Any
) -> tuple[bool, Any]:
    if not isinstance(message, str) or not message.startswith(constants.MSG_PREFIX):
        return handled
    if not isinstance(context, (Reviewer, Previewer)):
        return handled
    if not handler.is_enabled():
        return handled
    try:
        request = logic.parse_save_request(message)
    except Exception as exc:
        _log("parse_save_request", exc)
        tooltip(tr("bad_message"))
        return (True, None)
    if request is None:
        return handled

    try:
        _save(request, context)
    except Exception as exc:
        _log("save", exc)
        tooltip(tr("save_failed", error=str(exc)))
    return (True, None)


def _save(request: SaveRequest, context: ReviewContext) -> None:
    def on_saved() -> None:
        try:
            logic.forget_render_cache(_card(context))
            if request.patch:
                _patch(request, context)
        except Exception as exc:
            _log("on_saved", exc)
            tooltip(tr("render_failed"))

    logic.run_save(
        request=request,
        initiator=context,
        on_saved=on_saved,
        on_error=lambda text: tooltip(text),
    )


def _patch(request: SaveRequest, context: ReviewContext) -> None:
    web = _webview(context)
    if web is None:
        return
    try:
        html, stored = logic.render_source(request)
    except Exception as exc:
        _log("render_source", exc)
        tooltip(tr("render_failed"))
        return
    args = ", ".join(
        json.dumps(value)
        for value in (request.index, html, stored, int(request.note_id))
    )
    web.eval(f"window.LFE && window.LFE.patch({args});")
