'use client';

import { useState, useRef, useEffect, type ReactNode, type HTMLAttributes } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export default function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className = '',
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tabListRef = useRef<HTMLDivElement>(null);

  // Update indicator position
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab);
    if (activeButton && tabListRef.current) {
      const tabListRect = tabListRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - tabListRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.id === tabs[currentIndex].id);
    let nextIndex: number;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentEnabledIndex + 1) % enabledTabs.length;
        handleTabClick(enabledTabs[nextIndex].id);
        tabRefs.current.get(enabledTabs[nextIndex].id)?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
        handleTabClick(enabledTabs[nextIndex].id);
        tabRefs.current.get(enabledTabs[nextIndex].id)?.focus();
        break;
      case 'Home':
        e.preventDefault();
        handleTabClick(enabledTabs[0].id);
        tabRefs.current.get(enabledTabs[0].id)?.focus();
        break;
      case 'End':
        e.preventDefault();
        handleTabClick(enabledTabs[enabledTabs.length - 1].id);
        tabRefs.current.get(enabledTabs[enabledTabs.length - 1].id)?.focus();
        break;
    }
  };

  const variantClasses = {
    default: {
      list: 'bg-[var(--tab-bg)] rounded-xl p-1',
      tab: 'rounded-lg px-4 py-2 text-sm',
      active: 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm',
      inactive: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    },
    pills: {
      list: 'gap-2',
      tab: 'rounded-full px-5 py-2 text-sm',
      active: 'bg-primary text-white shadow-glow',
      inactive: 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]',
    },
    underline: {
      list: 'border-b border-[var(--border-color)] gap-0',
      tab: 'px-4 py-3 text-sm border-b-2 -mb-px',
      active: 'border-primary text-primary',
      inactive: 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]',
    },
  };

  const styles = variantClasses[variant];
  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className} {...props}>
      {/* Tab list */}
      <div
        ref={tabListRef}
        className={`relative flex ${styles.list} transition-all duration-200`}
        role="tablist"
        aria-orientation="horizontal"
      >
        {/* Sliding indicator for default variant */}
        {variant === 'default' && (
          <div
            className="absolute top-1 bottom-1 bg-[var(--bg-card)] rounded-lg shadow-sm transition-all duration-300 ease-[var(--ease-smooth)]"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            aria-hidden="true"
          />
        )}

        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            className={`
              relative z-10 font-medium flex items-center gap-2
              transition-all duration-200 cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed
              ${styles.tab}
              ${activeTab === tab.id ? styles.active : styles.inactive}
            `.trim()}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
        style={{ animation: 'fade-in 0.3s ease forwards' }}
        key={activeTab}
      >
        {activeContent}
      </div>
    </div>
  );
}
