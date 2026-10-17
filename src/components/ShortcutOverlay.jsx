'use client';

import { useEffect, useState } from 'react';
import './ShortcutOverlay.css';

const SECTIONS = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['Ctrl', 'K'], label: 'Open the command palette' },
      { keys: ['?'], label: 'Show this shortcut list' },
      { keys: ['Esc'], label: 'Close dialogs and palettes' },
    ],
  },
  {
    title: 'Workspace · graph',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], label: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], label: 'Redo' },
      { keys: ['Ctrl', 'Y'], label: 'Redo (alternative)' },
      { keys: ['Ctrl', 'C'], label: 'Copy the selected nodes' },
      { keys: ['Ctrl', 'V'], label: 'Paste copied nodes' },
      { keys: ['Ctrl', 'D'], label: 'Duplicate the selected nodes' },
      { keys: ['Del'], label: 'Delete the selected nodes' },
    ],
  },
  {
    title: 'Workspace · analysis',
    shortcuts: [
      {
        keys: ['Analysis'],
        label: 'Score evidence as supports (+) / refutes (−)',
      },
      { keys: ['Merge'], label: 'Fold duplicate identifiers into one keeper' },
    ],
  },
  {
    title: 'Report',
    shortcuts: [
      { keys: ['Print'], label: 'Print or save the case report as PDF' },
    ],
  },
];

function isTypingTarget(target) {
  const tag = target?.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target?.isContentEditable
  );
}

/**
 * Global keyboard-shortcut reference. Opens on `?` (Shift+/) or the
 * `osint:show-shortcuts` window event, closes on Escape or backdrop click.
 */
export default function ShortcutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        return;
      }
      if (event.key === '?' && !isTypingTarget(event.target)) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('osint:show-shortcuts', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('osint:show-shortcuts', onOpenEvent);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="shortcut-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        className="shortcut-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <header className="shortcut-header">
          <h2>Keyboard shortcuts</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Close shortcuts"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="shortcut-grid">
          {SECTIONS.map((section) => (
            <section className="shortcut-section" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.shortcuts.map((shortcut) => (
                  <li key={shortcut.label}>
                    <span className="shortcut-label">{shortcut.label}</span>
                    <span className="shortcut-keys">
                      {shortcut.keys.map((key) => (
                        <kbd key={key}>{key}</kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="shortcut-footer">
          Press <kbd>?</kbd> any time to reopen this list.
        </footer>
      </div>
    </div>
  );
}
