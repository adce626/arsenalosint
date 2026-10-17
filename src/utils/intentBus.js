import { useEffect, useRef } from 'react';

/**
 * Tiny cross-component "do this action" bus, used by the command palette to
 * trigger workspace actions (open the add-identifier modal, start a new
 * hypothesis, …) even when the target tab is not mounted yet.
 *
 * `requestIntent(name)` records the intent and fires a window event. A mounted
 * consumer handles it immediately via `useIntent`; a consumer that mounts
 * later (because the palette also navigated) consumes the still-pending intent
 * on mount. Whichever path runs first clears the pending flag, so the action
 * never fires twice.
 */

const EVENT_NAME = 'osint:intent';

let pending = null;

export function requestIntent(name) {
  pending = name;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: name }));
  }
}

export function consumeIntent(name) {
  if (pending === name) {
    pending = null;
    return true;
  }
  return false;
}

export function clearIntent(name) {
  if (pending === name) pending = null;
}

/**
 * Run `handler` when `name` is requested. Safe to mount/unmount freely.
 * `handler` is read through a ref, so it can close over fresh state without
 * re-subscribing.
 */
export function useIntent(name, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (consumeIntent(name)) handlerRef.current();
    const onEvent = (event) => {
      if (event.detail !== name) return;
      clearIntent(name);
      handlerRef.current();
    };
    window.addEventListener(EVENT_NAME, onEvent);
    return () => window.removeEventListener(EVENT_NAME, onEvent);
  }, [name]);
}
