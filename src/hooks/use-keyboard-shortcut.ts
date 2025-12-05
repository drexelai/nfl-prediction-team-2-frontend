import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
  } = {}
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { ctrl = false, meta = false, shift = false, alt = false } = modifiers;

      const correctModifiers =
        (ctrl ? event.ctrlKey : !ctrl || !event.ctrlKey) &&
        (meta ? event.metaKey : !meta || !event.metaKey) &&
        (shift ? event.shiftKey : !shift || !event.shiftKey) &&
        (alt ? event.altKey : !alt || !event.altKey);

      if (event.key.toLowerCase() === key.toLowerCase() && correctModifiers) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
}

