import { useCallback, useEffect, useState } from "react";
import { ADMIN_AFFIX_TABS } from "@vokcg/constants";
import type { AdminTab } from "@vokcg/constants";

type UseTabsDragOptions = {
  tabs: AdminTab[];
  draggable?: boolean;
  onSortTabs: (oldIndex: number, newIndex: number) => void;
};

function isAffixTab(tab: AdminTab) {
  return ADMIN_AFFIX_TABS.includes(tab);
}

/**
 * Tab drag-and-drop reorder — React port of Vben's use-tabs-drag.
 * @see https://github.com/vbenjs/vue-vben-admin/blob/main/packages/@core/ui-kit/tabs-ui/src/use-tabs-drag.ts
 */
export function useTabsDrag({
  tabs,
  draggable = true,
  onSortTabs,
}: UseTabsDragOptions) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enabled = draggable && !isMobile;

  const getTabDragProps = useCallback(
    (index: number, tab: AdminTab) => {
      const affix = isAffixTab(tab);
      const canDrag = enabled && !affix;

      return {
        draggable: canDrag,
        onDragStart: (e: React.DragEvent) => {
          if (!canDrag) {
            e.preventDefault();
            return;
          }
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", tab);
          setDragIndex(index);
        },
        onDragEnd: () => {
          setDragIndex(null);
          setDropIndex(null);
        },
        onDragOver: (e: React.DragEvent) => {
          if (dragIndex === null) return;
          const dragged = tabs[dragIndex];
          if (!dragged) return;
          // Affix and non-affix tabs cannot swap positions
          if (isAffixTab(tab) !== isAffixTab(dragged)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDropIndex(index);
        },
        onDragLeave: () => {
          setDropIndex((prev) => (prev === index ? null : prev));
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          if (dragIndex === null || dragIndex === index) return;
          const dragged = tabs[dragIndex];
          if (!dragged || isAffixTab(tab) !== isAffixTab(dragged)) return;
          onSortTabs(dragIndex, index);
          setDragIndex(null);
          setDropIndex(null);
        },
        dragClassName: [
          canDrag ? "draggable cursor-grab active:cursor-grabbing" : "",
          affix ? "affix-tab" : "",
          dragIndex === index ? "dragging opacity-60" : "",
          dropIndex === index && dragIndex !== index
            ? "ring-1 ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      };
    },
    [dragIndex, dropIndex, enabled, onSortTabs, tabs],
  );

  return {
    getTabDragProps,
    isDragging: dragIndex !== null,
    dragEnabled: enabled,
  };
}
