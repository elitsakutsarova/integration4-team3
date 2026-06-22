import { useCallback, useRef, useState } from 'react';

const DRAG_THRESHOLD_PX = 6;

function resolveDropIndex(rowRefs, itemCount, clientY) {
  for (let index = 0; index < itemCount; index += 1) {
    const row = rowRefs.current[index];
    if (!row) continue;
    const { top, height } = row.getBoundingClientRect();
    if (clientY < top + height / 2) return index;
  }
  return Math.max(0, itemCount - 1);
}

export function useEditJournalMemoReorder({ itemCount, onReorder }) {
  const rowRefs = useRef([]);
  const dragRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const setRowRef = useCallback((index) => (node) => {
    rowRefs.current[index] = node;
  }, []);

  const getMenuPointerHandlers = useCallback((index, onTap) => ({
    onPointerDown(event) {
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        index,
        startY: event.clientY,
        pointerId: event.pointerId,
        dragging: false,
        overIndex: index,
        onTap,
        target: event.currentTarget,
      };
    },
    onPointerMove(event) {
      const session = dragRef.current;
      if (!session || session.pointerId !== event.pointerId) return;

      const deltaY = event.clientY - session.startY;
      if (!session.dragging) {
        if (Math.abs(deltaY) < DRAG_THRESHOLD_PX) return;
        session.dragging = true;
        setDraggingIndex(session.index);
      }

      const nextOver = resolveDropIndex(rowRefs, itemCount, event.clientY);
      session.overIndex = nextOver;
      setOverIndex(nextOver);
    },
    onPointerUp(event) {
      const session = dragRef.current;
      if (!session || session.pointerId !== event.pointerId) return;

      if (session.target?.hasPointerCapture?.(event.pointerId)) {
        session.target.releasePointerCapture(event.pointerId);
      }

      if (session.dragging) {
        if (session.index !== session.overIndex) {
          onReorder(session.index, session.overIndex);
        }
      } else {
        session.onTap?.();
      }

      dragRef.current = null;
      setDraggingIndex(null);
      setOverIndex(null);
    },
    onPointerCancel(event) {
      const session = dragRef.current;
      if (!session || session.pointerId !== event.pointerId) return;

      if (session.target?.hasPointerCapture?.(event.pointerId)) {
        session.target.releasePointerCapture(event.pointerId);
      }

      dragRef.current = null;
      setDraggingIndex(null);
      setOverIndex(null);
    },
  }), [itemCount, onReorder]);

  return {
    setRowRef,
    draggingIndex,
    overIndex,
    getMenuPointerHandlers,
  };
}
