from __future__ import annotations

DEFAULT_LANGUAGE: str = "es"

STRINGS: dict[str, dict[str, str]] = {
    "es": {
        "save_failed": "No se pudo guardar el cambio: {error}",
        "field_missing": "El campo «{field}» ya no existe en esta nota. El cambio no se ha guardado.",
        "note_missing": "La nota ya no existe. El cambio no se ha guardado.",
        "bad_message": "El editor envió una orden que no se entiende. El cambio no se ha guardado.",
        "render_failed": "El cambio se ha guardado, pero no se pudo redibujar la tarjeta.",
    },
    "en": {
        "save_failed": "Could not save the change: {error}",
        "field_missing": "Field '{field}' no longer exists in this note. The change was not saved.",
        "note_missing": "The note no longer exists. The change was not saved.",
        "bad_message": "The editor sent an unrecognised command. The change was not saved.",
        "render_failed": "The change was saved, but the card could not be redrawn.",
    },
}


def tr(key: str, **values: str) -> str:
    table = STRINGS.get(DEFAULT_LANGUAGE, {})
    text = table.get(key) or STRINGS.get("en", {}).get(key, key)
    if not values:
        return text
    try:
        return text.format(**values)
    except (KeyError, IndexError):
        return text
