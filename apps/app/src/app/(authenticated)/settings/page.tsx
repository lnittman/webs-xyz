'use client';

import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/shared/client-layout';
import { cn } from '@repo/design/lib/utils';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/user-settings';
import { fonts, applyFont } from '@/lib/fonts';
import {
  Check,
  Palette,
  TextAa,
  Database,
  Bell,
  User,
  Shield,
  CreditCard,
  Download,
  Trash,
  CaretRight,
  MagnifyingGlass
} from '@phosphor-icons/react/dist/ssr';

const settingsNavigation = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const { updateSettings, isLoading: updateLoading } = useUpdateUserSettings();

  const [activeSection, setActiveSection] = useState('general');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply font when settings change
  useEffect(() => {
    if (settings?.fontFamily) {
      applyFont(settings.fontFamily);
    }
  }, [settings?.fontFamily]);

  // Handle font change
  const handleFontChange = async (fontId: string) => {
    try {
      await updateSettings({ fontFamily: fontId });
    } catch (error) {
      console.error('Failed to update font:', error);
    }
  };

  // Handle workspace name change
  const handleWorkspaceNameChange = async (workspaceName: string) => {
    try {
      await updateSettings({ workspaceName });
    } catch (error) {
      console.error('Failed to update workspace name:', error);
    }
  };

  // Handle default model change
  const handleDefaultModelChange = async (defaultModel: string) => {
    try {
      await updateSettings({ defaultModel });
    } catch (error) {
      console.error('Failed to update default model:', error);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update notification setting:', error);
    }
  };

  // Filter navigation items based on search
  const filteredNavigation = settingsNavigation.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (settingsLoading) {
      return (
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded animate-pulse"></div>
            <div className="h-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold font-mono mb-2">General Settings</h2>
              <p className="text-sm text-muted-foreground font-mono">
                Manage your account and workspace preferences.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium font-mono">Workspace Name</label>
                <input
                  type="text"
                  defaultValue={settings?.workspaceName || 'My Workspace'}
                  onBlur={(e) => handleWorkspaceNameChange(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                />
                <p className="text-xs text-muted-foreground font-mono">This is your workspace's visible name.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-mono">Default Model</label>
                <select
                  value={settings?.defaultModel || 'claude-4-sonnet'}
                  onChange={(e) => handleDefaultModelChange(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                >
                  <option value="claude-4-sonnet">Claude 4 Sonnet</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold font-mono mb-2">Appearance</h2>
              <p className="text-sm text-muted-foreground font-mono">
                Customize the look and feel of your workspace.
              </p>
            </div>

            <div className="space-y-6">
              {/* Font Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TextAa size={16} weight="duotone" className="text-muted-foreground" />
                  <h3 className="text-sm font-medium font-mono">Font Family</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => handleFontChange(font.id)}
                      disabled={updateLoading}
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg transition-all duration-200 text-left hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed",
                        settings?.fontFamily === font.id
                          ? "border-foreground/30 bg-accent/50"
                          : "border-border hover:bg-accent/30"
                      )}
                    >
                      <div className="space-y-1">
                        <div className={cn("text-sm font-medium", font.className)}>
                          {font.name}
                        </div>
                        <div className={cn("text-xs text-muted-foreground", font.className)}>
                          The quick brown fox jumps over the lazy dog 0123456789
                        </div>
                      </div>
                      {settings?.fontFamily === font.id && (
                        <Check size={16} weight="duotone" className="text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold font-mono mb-2">Data Management</h2>
              <p className="text-sm text-muted-foreground font-mono">
                Export, import, and manage your data.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4 hover:border-foreground/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Download size={16} weight="duotone" className="text-blue-600" />
                      <h3 className="text-sm font-medium font-mono">Export Data</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Download all your webs, processing data, and settings as JSON
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Last export: Never
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm font-mono bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg">
                    Export
                  </button>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 hover:border-foreground/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Trash size={16} weight="duotone" className="text-red-600" />
                      <h3 className="text-sm font-medium font-mono">Clear All Data</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Permanently delete all webs, cache, and processing history
                    </p>
                    <p className="text-xs text-red-600 font-mono">
                      This action cannot be undone
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm font-mono bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg">
                    Clear All
                  </button>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium font-mono">Storage Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Webs processed</span>
                      <span>24</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Cache size</span>
                      <span>2.4 MB</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Total storage</span>
                      <span>5.1 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold font-mono mb-2">Notifications</h2>
              <p className="text-sm text-muted-foreground font-mono">
                Configure how and when you receive notifications.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'notifyProcessingComplete',
                  title: 'Processing Complete',
                  description: 'Get notified when web processing finishes',
                  enabled: settings?.notifyProcessingComplete ?? true
                },
                {
                  key: 'notifyProcessingFailed',
                  title: 'Processing Failed',
                  description: 'Get notified when web processing encounters errors',
                  enabled: settings?.notifyProcessingFailed ?? true
                },
                {
                  key: 'notifyWeeklySummary',
                  title: 'Weekly Summary',
                  description: 'Receive a weekly summary of your activity',
                  enabled: settings?.notifyWeeklySummary ?? false
                },
                {
                  key: 'notifyFeatureUpdates',
                  title: 'Feature Updates',
                  description: 'Get notified about new features and improvements',
                  enabled: settings?.notifyFeatureUpdates ?? false
                }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-foreground/20 transition-colors">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium font-mono">{notification.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {notification.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notification.enabled}
                      onChange={(e) => handleNotificationToggle(notification.key, e.target.checked)}
                      disabled={updateLoading}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-foreground/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold font-mono mb-2">{activeSection}</h2>
              <p className="text-sm text-muted-foreground font-mono">
                This section is coming soon.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <ClientLayout>
      <div className="flex-1 relative">
        {/* Desktop Sidebar - Fixed Position */}
        {!isMobile && (
          <div className="fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] border-r border-border bg-muted/30 overflow-hidden flex flex-col z-10">
            <div className="p-6 flex-1 flex flex-col">
              <h1 className="text-lg font-semibold font-mono mb-4">Settings</h1>

              {/* Search Bar */}
              <div className="relative mb-6 flex-shrink-0">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-3 bg-background border border-border rounded-lg text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                />
              </div>

              <nav className="space-y-1 flex-1 overflow-hidden">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm font-mono rounded-lg transition-colors text-left flex-shrink-0",
                        activeSection === item.id
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon size={16} weight="duotone" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <div className="fixed top-14 left-0 right-0 bg-background border-b border-border z-40">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                {React.createElement(settingsNavigation.find(item => item.id === activeSection)?.icon || User, { size: 16, weight: "duotone" })}
                <span className="font-mono font-medium">
                  {settingsNavigation.find(item => item.id === activeSection)?.label}
                </span>
              </div>
              <CaretRight
                size={16}
                weight="duotone"
                className={cn("transition-transform", showMobileMenu && "rotate-90")}
              />
            </button>

            {showMobileMenu && (
              <div className="border-t border-border bg-muted/30">
                {/* Mobile Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                      type="text"
                      placeholder="Search settings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 pl-9 pr-3 bg-background border border-border rounded-lg text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                    />
                  </div>
                </div>

                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-mono transition-colors text-left",
                        activeSection === item.id
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon size={16} weight="duotone" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className={cn(
          "overflow-auto",
          !isMobile ? "ml-64" : "",
          isMobile ? "pt-20" : ""
        )}>
          <div className="p-6">
            <div className="max-w-2xl">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 