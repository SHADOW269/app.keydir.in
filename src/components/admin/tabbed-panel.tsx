'use client';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabbedPanelProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export function TabbedPanel({ tabs, activeTab, onTabChange, children }: TabbedPanelProps) {
  return (
    <>
      <div className="vd-tab-bar">
        <div className="vd-tab-bar-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`vd-tab ${activeTab === tab.id ? 'vd-tab--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon && <span className="vd-tab-icon">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </>
  );
}

interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ tabId, activeTab, children }: TabPanelProps) {
  if (activeTab !== tabId) return null;
  return <div>{children}</div>;
}
