// ══════════════════════════════════════
// VOID — Keyboard Shortcuts Hook
// ══════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

interface UseKeyboardReturn {
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

/**
 * Hook for managing keyboard shortcuts
 * - ⌘K / Ctrl+K: Toggle command palette
 * - Escape: Close command palette
 */
export function useKeyboard(): UseKeyboardReturn {
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to toggle command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }

      // Escape to close
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  return {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    toggleCommandPalette,
  };
}

export default useKeyboard;
