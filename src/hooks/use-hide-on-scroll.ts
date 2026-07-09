"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll threshold shared by the catalog's global navbar and category bar so
 * both hide/show in lockstep instead of drifting apart. Matches
 * `StaggeredMenu`'s own `scrollThreshold` (16px) — that's the point where the
 * navbar already shrinks into its floating pill, so hiding both right there
 * avoids a moment where the pill is small but the category bar hasn't moved
 * up yet.
 */
export const CATALOG_CHROME_HIDE_OFFSET = 16;
export const CATALOG_CHROME_HIDE_DELTA = 6;

/**
 * `true` while a sticky element should stay visible: near the top of the
 * page, or while the user is scrolling up. Flips to `false` once the user
 * scrolls down past `offset` by more than `delta` px. rAF-throttled so it
 * never runs more than once per frame.
 *
 * Pass `enabled: false` to skip attaching the scroll listener entirely
 * (always returns `true`) — for callers that only want this behavior on
 * specific routes without paying for a listener everywhere else.
 */
export function useHideOnScroll(
  offset = 96,
  delta = 6,
  enabled = true,
): boolean {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }
    lastY.current = window.scrollY;

    function update() {
      const y = window.scrollY;
      // Snapshot before the state update: `setVisible`'s updater can run
      // asynchronously, by which point the assignment below would already
      // have overwritten `lastY.current` with the new `y`, making every
      // `diff` collapse to 0.
      const prevY = lastY.current;
      setVisible((prev) => {
        if (y <= offset) return true;
        const diff = y - prevY;
        if (diff > delta) return false;
        if (diff < -delta) return true;
        return prev;
      });
      lastY.current = y;
      ticking.current = false;
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset, delta, enabled]);

  return visible;
}
