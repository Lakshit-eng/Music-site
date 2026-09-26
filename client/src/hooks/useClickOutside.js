// Small reusable hook: calls `onOutsideClick` when the user clicks
// anywhere outside the referenced element. Used by the mobile nav menu
// so it closes itself when you tap outside it.

import { useEffect } from 'react';

export function useClickOutside(ref, onOutsideClick) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onOutsideClick]);
}
