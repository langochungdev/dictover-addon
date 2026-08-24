from __future__ import annotations

import json
from collections.abc import Callable
from dataclasses import dataclass

from anki.cards import Card, CardId
from anki.collection import Collection, OpChanges
from anki.notes import Note, NoteId
from aqt import mw
from aqt.operations import CollectionOp

from . import constants
from .strings import tr


class FieldMissing(Exception):
    def __init__(self, field: str) -> None:
        super().__init__(field)
        self.field = field

    def message(self) -> str:
        return tr("field_missing", field=self.field)


class NoteMissing(Exception):
    def message(self) -> str:
        return tr("note_missing")


@dataclass(frozen=True)
class SaveRequest:
    note_id: NoteId
    card_id: CardId
    side: str
    index: int
    name: str
    kind: str
    value: str
    patch: bool


def parse_save_request(message: str) -> SaveRequest | None:

    if not message.startswith(constants.MSG_PREFIX):
        return None
    data = json.loads(message[len(constants.MSG_PREFIX) :])
    if not isinstance(data, dict) or data.get("cmd") != "save":
        raise ValueError("unknown command")

    note_id = data.get("nid")
    card_id = data.get("cid")
    index = data.get("index")
    name = data.get("name")
    kind = data.get("kind")
    value = data.get("value")
    side = data.get("side")
    patch = data.get("patch")

    if not isinstance(note_id, int) or not isinstance(card_id, int):
        raise ValueError("bad ids")
    if not isinstance(index, int) or index < 0:
        raise ValueError("bad index")
    if not isinstance(name, str) or not name:
        raise ValueError("bad field name")
    if kind not in (constants.KIND_FIELD, constants.KIND_TAGS):
        raise ValueError("bad kind")
    if not isinstance(value, str):
        raise ValueError("bad value")
    if side not in (constants.SIDE_QUESTION, constants.SIDE_ANSWER):
        raise ValueError("bad side")

    return SaveRequest(
        note_id=NoteId(note_id),
        card_id=CardId(card_id),
        side=side,
        index=index,
        name=name,
        kind=kind,
        value=value,
        patch=bool(patch),
    )


def build_payload(card: Card, side: str) -> dict[str, object]:
    note = card.note()
    fields: list[dict[str, object]] = []
    for name in note.keys():
        raw = note[name]
        if not raw.strip():
            continue
        fields.append(
            {
                "name": name,
                "raw": raw,
                "cloze": bool(constants.CLOZE_RE.search(raw)),
                "kind": constants.KIND_FIELD,
            }
        )
    tags = " ".join(note.tags).strip()
    if tags:
        fields.append(
            {
                "name": constants.TAGS_LABEL,
                "raw": tags,
                "cloze": False,
                "kind": constants.KIND_TAGS,
            }
        )
    return {
        "nid": int(note.id),
        "cid": int(card.id),
        "side": side,
        "fields": fields,
    }


def _apply(note: Note, request: SaveRequest) -> bool:
    if request.kind == constants.KIND_TAGS:
        tags = request.value.split()
        if note.tags == tags:
            return False
        note.tags = tags
        return True

    if request.name not in note:
        raise FieldMissing(request.name)
    value = request.value.strip("\ufeff").strip()
    if note[request.name] == value:
        return False
    note[request.name] = value
    return True


def run_save(
    request: SaveRequest,
    initiator: object,
    on_saved: Callable[[], None],
    on_error: Callable[[str], None],
) -> None:
    def op(col: Collection) -> OpChanges:
        try:
            note = col.get_note(request.note_id)
        except Exception as exc:
            raise NoteMissing() from exc
        if not _apply(note, request):
            return OpChanges()
        return col.update_note(note)

    def success(_changes: OpChanges) -> None:
        on_saved()

    def failure(exc: Exception) -> None:
        if isinstance(exc, (FieldMissing, NoteMissing)):
            on_error(exc.message())
        else:
            on_error(tr("save_failed", error=str(exc)))

    collection_op = CollectionOp(parent=mw, op=op).success(success).failure(failure)
    try:
        collection_op.run_in_background(initiator=initiator)
    except TypeError:
        collection_op.run_in_background()


def render_source(request: SaveRequest) -> tuple[str, str]:
    card = mw.col.get_card(request.card_id)
    output = card.render_output()
    text = (
        output.question_text
        if request.side == constants.SIDE_QUESTION
        else output.answer_text
    )
    text = mw.col.media.escape_media_filenames(text)
    note = card.note()
    stored = note[request.name] if request.name in note else request.value
    return constants.AV_REF_RE.sub("", text), stored


def forget_render_cache(card: Card | None) -> None:
    if card is None:
        return
    card._note = None
    card._render_output = None
