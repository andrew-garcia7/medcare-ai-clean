import { useEffect, useRef } from 'react';

const DOT_SIZE = 7; // px
const RING_SIZE = 34; // px

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let dotX = targetX;
    let dotY = targetY;
    let ringX = targetX;
    let ringY = targetY;

    // Hover state drives ring expansion + color changes.
    let hovering = false;
    let hoveringTarget = false;

    const INTERACTIVE_SELECTOR =
      'a,button,input,textarea,select,label,[role="button"],[data-cursor-hover="true"]';

    const setHoverFromEvent = (e) => {
      const el = e.target instanceof Element ? e.target : null;
      hoveringTarget = !!el?.closest?.(INTERACTIVE_SELECTOR);
    };

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setHoverFromEvent(e);
    };

    const onMouseOver = (e) => setHoverFromEvent(e);
    const onMouseOut = (e) => {
      const related = e.relatedTarget instanceof Element ? e.relatedTarget : null;
      hoveringTarget = !!related?.closest?.(INTERACTIVE_SELECTOR);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    let rafId = 0;
    const tick = () => {
      // Smooth trailing for both dot and ring.
      dotX += (targetX - dotX) * 0.18;
      dotY += (targetY - dotY) * 0.25;
      ringX += (targetX - ringX) * 0.08;
      ringY += (targetY - ringY) * 0.12;

      hovering += (hoveringTarget - hovering) * 0.2; // ease hover
      document.body.classList.toggle("cursor-hover", hoveringTarget);
      const ringScale = hoveringTarget ? 1.8 : 1.0;
      const dotScale = hoveringTarget ? 1.4 : 1.0;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX - DOT_SIZE / 2}px, ${
          dotY - DOT_SIZE / 2
        }px, 0) scale(${dotScale})`;
      }

      if (ringRef.current) {
        // Keep transform purely positional; scaling handled here.
        ringRef.current.style.transform = `translate3d(${ringX - RING_SIZE / 2}px, ${
          ringY - RING_SIZE / 2
        }px, 0) scale(${ringScale})`;
        ringRef.current.style.borderColor = hoveringTarget
          ? 'rgba(59,130,246,0.9)'
          : 'rgba(45,212,191,0.4)';
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}