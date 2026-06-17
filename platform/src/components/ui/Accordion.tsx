'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode, type HTMLAttributes } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [heights, setHeights] = useState<Map<string, number>>(new Map());

  // Measure content heights
  useEffect(() => {
    const newHeights = new Map<string, number>();
    contentRefs.current.forEach((el, id) => {
      if (el) {
        newHeights.set(id, el.scrollHeight);
      }
    });
    setHeights(newHeights);
  }, [items]);

  const toggleItem = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!allowMultiple) next.clear();
          next.add(id);
        }
        return next;
      });
    },
    [allowMultiple]
  );

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        {
          const nextIndex = (index + 1) % items.length;
          const nextButton = document.getElementById(`accordion-button-${items[nextIndex].id}`);
          nextButton?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        {
          const prevIndex = (index - 1 + items.length) % items.length;
          const prevButton = document.getElementById(`accordion-button-${items[prevIndex].id}`);
          prevButton?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        document.getElementById(`accordion-button-${items[0].id}`)?.focus();
        break;
      case 'End':
        e.preventDefault();
        document.getElementById(`accordion-button-${items[items.length - 1].id}`)?.focus();
        break;
    }
  };

  return (
    <div
      className={`
        divide-y divide-[var(--border-color)]
        border border-[var(--border-color)] rounded-xl overflow-hidden
        ${className}
      `.trim()}
      {...props}
    >
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        const contentHeight = heights.get(item.id) || 0;

        return (
          <div key={item.id}>
            <h3>
              <button
                id={`accordion-button-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                disabled={item.disabled}
                className="
                  w-full flex items-center justify-between
                  px-5 py-4 text-left
                  text-[var(--text-primary)] font-medium text-sm
                  bg-transparent hover:bg-[var(--bg-surface)]/50
                  transition-colors duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  cursor-pointer
                  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]
                "
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <span className="flex items-center gap-3">
                  {item.icon && <span className="text-[var(--text-muted)]" aria-hidden="true">{item.icon}</span>}
                  {item.title}
                </span>
                <svg
                  className={`
                    w-5 h-5 text-[var(--text-muted)] flex-shrink-0
                    transition-transform duration-300 ease-[var(--ease-smooth)]
                    ${isOpen ? 'rotate-180' : 'rotate-0'}
                  `}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-button-${item.id}`}
              className="overflow-hidden transition-all duration-300 ease-[var(--ease-smooth)]"
              style={{
                maxHeight: isOpen ? `${contentHeight}px` : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div
                ref={(el) => {
                  if (el) contentRefs.current.set(item.id, el);
                }}
                className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed"
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
