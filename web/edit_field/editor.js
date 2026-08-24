(() => {
  "use strict";

  if (window.LFE) {
    return;
  }

  const ATTR = "data-lfe";
  const EDIT_CLASS = "lfe-editing";
  const WRAP_CLASS = "lfe-wrap";
  const MSG_PREFIX = "lfe:";
  const KIND_TAGS = "tags";

  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "HEAD", "TITLE", "META", "LINK", "BR", "HR", "IMG",
    "INPUT", "TEXTAREA", "SELECT", "OPTION", "AUDIO", "VIDEO", "SOURCE",
    "IFRAME", "CANVAS", "SVG", "PATH",
  ]);
  const INTERACTIVE = "a, input, textarea, select, .replay-button, .soundLink";
  const CLOZE_SELECTOR = ".cloze, .cloze-inactive";
  const CLOZE_CONTENT_RE = /\{\{c\d+::[\s\S]*?\}\}/g;

  let payload = null;
  let active = null;
  let clickPoint = { x: 0, y: 0 };

  const root = () => document.getElementById("qa") || document.body;

  const scratch = (tag) => document.createElement(tag);

  const canon = (html) => {
    const holder = scratch("div");
    holder.innerHTML = html;
    return holder.innerHTML.trim();
  };

  const serialize = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return node.outerHTML;
    }
    const holder = scratch("span");
    holder.appendChild(node.cloneNode(true));
    return holder.innerHTML;
  };

  const depth = (el) => {
    let n = 0;
    let cur = el.parentElement;
    while (cur) {
      n += 1;
      cur = cur.parentElement;
    }
    return n;
  };

  const descendants = (scope) => {
    const out = [];
    const walk = (parent) => {
      for (const child of parent.children) {
        if (SKIP_TAGS.has(child.tagName)) {
          continue;
        }
        out.push(child);
        walk(child);
      }
    };
    walk(scope);
    return out;
  };

  const marked = (el) => el.nodeType === Node.ELEMENT_NODE && el.hasAttribute(ATTR);

  const insideMarked = (el) => {
    let cur = el.parentElement;
    while (cur) {
      if (marked(cur)) {
        return true;
      }
      cur = cur.parentElement;
    }
    return false;
  };

  const holdsMarker = (node) =>
    marked(node) ||
    (node.nodeType === Node.ELEMENT_NODE && !!node.querySelector(`[${ATTR}]`));

  const wrapRun = (parent, index, nodes) => {
    if (!nodes.length || nodes.some(holdsMarker)) {
      return null;
    }
    const wrapper = scratch("span");
    wrapper.setAttribute(ATTR, String(index));
    wrapper.className = WRAP_CLASS;
    const doc = parent.ownerDocument || document;
    const range = doc.createRange();
    range.setStartBefore(nodes[0]);
    range.setEndAfter(nodes[nodes.length - 1]);
    try {
      range.surroundContents(wrapper);
    } catch (err) {
      return null;
    }
    return wrapper;
  };

  const markPlain = (scope, index, field) => {
    const target = canon(field.raw);
    if (!target) {
      return;
    }
    const elements = descendants(scope);

    const exact = elements.filter(
      (el) => !marked(el) && !insideMarked(el) && el.innerHTML.trim() === target
    );
    if (exact.length) {
      exact
        .filter((el) => !exact.some((other) => other !== el && el.contains(other)))
        .forEach((el) => el.setAttribute(ATTR, String(index)));
      return;
    }

    const parents = elements
      .filter((el) => !marked(el) && !insideMarked(el))
      .sort((a, b) => depth(b) - depth(a));
    parents.push(scope);

    for (const parent of parents) {
      const kids = Array.from(parent.childNodes);
      if (!kids.length) {
        continue;
      }
      const parts = kids.map(serialize);
      for (let i = 0; i < kids.length; i += 1) {
        let acc = "";
        for (let j = i; j < kids.length; j += 1) {
          acc += parts[j];
          const trimmed = acc.trim();
          if (trimmed === target) {
            if (wrapRun(parent, index, kids.slice(i, j + 1))) {
              return;
            }
            break;
          }
          if (trimmed.length > target.length) {
            break;
          }
        }
      }
    }
  };

  const clozeOutsidePieces = (raw) => {
    const holder = scratch("div");
    holder.innerHTML = raw;
    const text = holder.textContent || "";
    return text
      .replace(CLOZE_CONTENT_RE, "\u0000")
      .split("\u0000")
      .map((piece) => piece.trim())
      .filter((piece) => piece.length > 1);
  };

  const coversPieces = (text, pieces) => {
    let from = 0;
    for (const piece of pieces) {
      const at = text.indexOf(piece, from);
      if (at === -1) {
        return false;
      }
      from = at + piece.length;
    }
    return true;
  };

  const commonAncestor = (nodes) => {
    let ancestor = nodes[0].parentElement;
    while (ancestor && !nodes.every((node) => ancestor.contains(node))) {
      ancestor = ancestor.parentElement;
    }
    return ancestor;
  };

  const markCloze = (scope, index, field) => {
    const clozes = Array.from(scope.querySelectorAll(CLOZE_SELECTOR));
    if (!clozes.length) {
      return;
    }
    const pieces = clozeOutsidePieces(field.raw);
    const scopeEl = scope.nodeType === Node.ELEMENT_NODE ? scope : null;

    let el = commonAncestor(clozes);
    while (
      el &&
      el !== scopeEl &&
      el !== document.body &&
      el !== document.documentElement &&
      !coversPieces(el.textContent || "", pieces)
    ) {
      el = el.parentElement;
    }

    if (el && el !== scopeEl && el !== document.body && el !== document.documentElement) {
      if (!marked(el) && !insideMarked(el)) {
        el.setAttribute(ATTR, String(index));
      }
      return;
    }

    // The field is not inside any wrapper of its own: wrap the run of nodes that
    // holds the cloze deletions, extending over neighbouring text only.
    const parent = scopeEl || scope;
    const kids = Array.from(parent.childNodes);
    let first = -1;
    let last = -1;
    kids.forEach((node, i) => {
      const holds = clozes.some((cloze) => node === cloze || node.contains(cloze));
      if (holds) {
        if (first === -1) {
          first = i;
        }
        last = i;
      }
    });
    if (first === -1) {
      return;
    }
    while (first > 0 && kids[first - 1].nodeType === Node.TEXT_NODE) {
      first -= 1;
    }
    while (last < kids.length - 1 && kids[last + 1].nodeType === Node.TEXT_NODE) {
      last += 1;
    }
    const run = kids.slice(first, last + 1);
    const text = run.map((node) => node.textContent || "").join("");
    if (!coversPieces(text, pieces)) {
      return;
    }
    wrapRun(parent, index, run);
  };

  const markFields = (scope, fields) => {
    fields.forEach((field, index) => {
      if (scope.querySelector(`[${ATTR}="${index}"]`)) {
        return;
      }
      if (!field.raw || !field.raw.trim()) {
        return;
      }
      if (field.cloze) {
        markCloze(scope, index, field);
      } else {
        markPlain(scope, index, field);
      }
    });
  };

  const placeCaret = (el) => {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    let range = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clickPoint.x, clickPoint.y);
    }
    if (!range || !el.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const onBlur = () => finish(true);

  const onKeydown = (event) => {
    // Anki's webview blocks Backspace at document level unless the target is an
    // input or an editable DIV; keeping every key inside the editor lets the
    // default behaviour (deleting, typing) work in any element.
    event.stopPropagation();
    if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
      event.preventDefault();
      finish(true);
    }
  };

  const start = (el, index) => {
    if (active) {
      finish(true);
    }
    if (!payload) {
      return;
    }
    const field = payload.fields[index];
    if (!field) {
      return;
    }

    const rendered = el.innerHTML;
    let mode = "plain";
    if (field.kind === KIND_TAGS) {
      mode = KIND_TAGS;
    } else if (field.cloze || canon(rendered) !== canon(field.raw)) {
      mode = "raw";
    }

    active = {
      el,
      index,
      mode,
      rendered,
      noteId: payload.nid,
      cardId: payload.cid,
      side: payload.side,
      name: field.name,
      kind: field.kind,
      cloze: !!field.cloze,
      original: mode === "plain" ? rendered : field.raw,
    };

    if (mode === KIND_TAGS) {
      el.textContent = field.raw;
    } else if (mode === "raw") {
      el.innerHTML = field.raw;
    }

    el.classList.add(EDIT_CLASS);
    el.setAttribute("contenteditable", "true");
    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", onKeydown);
    el.focus({ preventScroll: true });
    placeCaret(el);
  };

  const finish = (save) => {
    if (!active) {
      return;
    }
    const edit = active;
    active = null;

    const el = edit.el;
    el.removeEventListener("blur", onBlur);
    el.removeEventListener("keydown", onKeydown);
    el.removeAttribute("contenteditable");
    el.classList.remove(EDIT_CLASS);

    const value =
      edit.mode === KIND_TAGS ? (el.textContent || "").trim() : el.innerHTML;

    if (!save || canon(value) === canon(edit.original)) {
      if (edit.mode !== "plain") {
        el.innerHTML = edit.rendered;
      }
      return;
    }

    if (payload && payload.nid === edit.noteId && payload.fields[edit.index]) {
      payload.fields[edit.index].raw = value;
    }

    if (edit.mode === "plain" && payload && payload.nid === edit.noteId) {
      root()
        .querySelectorAll(`[${ATTR}="${edit.index}"]`)
        .forEach((twin) => {
          if (twin !== el) {
            twin.innerHTML = value;
          }
        });
    }

    pycmd(
      MSG_PREFIX +
        JSON.stringify({
          cmd: "save",
          nid: edit.noteId,
          cid: edit.cardId,
          side: edit.side,
          index: edit.index,
          name: edit.name,
          kind: edit.kind,
          value,
          patch: edit.mode === "raw" && edit.cloze,
        })
    );
  };

  const onClick = (event) => {
    if (!event.ctrlKey) {
      return;
    }
    const target = event.target;
    if (!target || !target.closest) {
      return;
    }
    const el = target.closest(`[${ATTR}]`);
    if (!el) {
      return;
    }
    if (active && active.el === el) {
      return;
    }
    if (target.closest(INTERACTIVE)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    clickPoint = { x: event.clientX, y: event.clientY };
    const index = Number(el.getAttribute(ATTR));
    if (Number.isNaN(index)) {
      return;
    }
    try {
      start(el, index);
    } catch (err) {
      console.error("LFE start", err);
    }
  };

  const init = (data) => {
    try {
      finish(true);
      payload = data;
      const current = payload;
      markFields(root(), payload.fields);
      // Second pass once the card's own scripts have run, for fields that were
      // not reachable in the first pass.
      window.setTimeout(() => {
        if (payload !== current) {
          return;
        }
        try {
          markFields(root(), payload.fields);
        } catch (err) {
          console.error("LFE mark", err);
        }
      }, 0);
    } catch (err) {
      console.error("LFE init", err);
    }
  };

  const patch = (index, html, raw, noteId) => {
    try {
      if (!payload || payload.nid !== noteId) {
        return;
      }
      const field = payload.fields[index];
      if (!field) {
        return;
      }
      field.raw = raw;
      if (active && active.index === index) {
        return;
      }
      const live = root().querySelector(`[${ATTR}="${index}"]`);
      if (!live) {
        return;
      }
      const template = scratch("template");
      template.innerHTML = html;
      markFields(template.content, payload.fields);
      const fresh = template.content.querySelector(`[${ATTR}="${index}"]`);
      if (!fresh) {
        return;
      }
      live.innerHTML = fresh.innerHTML;
    } catch (err) {
      console.error("LFE patch", err);
    }
  };

  document.addEventListener("click", onClick, true);

  window.LFE = { init, patch };
})();