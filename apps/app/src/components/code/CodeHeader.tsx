"use client";

import { useState, useMemo } from 'react';
import { CaretDown, CaretUp, Plus } from '@phosphor-icons/react';
import { motion, AnimatePresence } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";

import { cn } from '@repo/design/lib/utils';
import { CodeUserMenu } from '@/components/code/CodeUserMenu';
import { Menu, MenuGroup } from '@/components/shared/menu';

interface Workspace {
  id: string;
  name: string;
}

export function CodeHeader() {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
  const router = useTransitionRouter();

  // TODO: Replace with actual workspace data from API/hooks
  const workspaces: Workspace[] = [
    // Empty for now - will be populated from API
  ];

  const currentWorkspaceData = workspaces.find(w => w.id === currentWorkspace);

  // Handle creating a new workspace
  const handleCreateWorkspace = () => {
    setWorkspaceMenuOpen(false);
    router.push('/settings?tab=workspaces&action=create');
  };

  // Define workspace menu groups
  const workspaceMenuGroups = useMemo<MenuGroup[]>(() => {
    const workspaceItems = workspaces.map(workspace => ({
      id: workspace.id,
      label: workspace.name,
      onClick: () => {
        setCurrentWorkspace(workspace.id);
        setWorkspaceMenuOpen(false);
      }
    }));

    const groups: MenuGroup[] = [];

    // Add existing workspaces if any
    if (workspaceItems.length > 0) {
      groups.push({
        items: workspaceItems,
        showDivider: true
      });
    }

    // Always show create workspace option
    groups.push({
      items: [{
        id: 'create-workspace',
        label: 'create new',
        icon: <Plus weight="duotone" className="h-4 w-4" />,
        onClick: handleCreateWorkspace
      }]
    });

    return groups;
  }, [workspaces]);

  const displayText = currentWorkspaceData?.name || 'no workspace selected';
  const isWorkspaceSelected = !!currentWorkspaceData;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Workspace selector */}
        <div className="flex items-center">
          <Menu
            trigger={
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  !isWorkspaceSelected && "text-muted-foreground"
                )}>
                  {displayText}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  {workspaceMenuOpen ? (
                    <motion.div
                      key="up"
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CaretUp weight="duotone" className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="down"
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CaretDown weight="duotone" className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            }
            groups={workspaceMenuGroups}
            triggerClassName={cn(
              "flex items-center border border-input bg-background px-3 py-1 transition-all hover:bg-accent/40 hover:text-accent-foreground hover:border-accent/90 select-none rounded-lg",
              !isWorkspaceSelected && "border-orange-500/50 bg-orange-500/5"
            )}
            triggerActiveClassName="!bg-accent/50 !border-accent text-accent-foreground"
            onOpenChange={setWorkspaceMenuOpen}
            contentClassName="z-[500] min-w-[200px] shadow-sm"
            side="bottom"
            align="start"
            sideOffset={8}
          />
        </div>

        {/* Center - 'arbor code' title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => router.push('/')}
            className="text-lg font-medium text-foreground select-none transition-all duration-200 hover:opacity-70 active:opacity-50 active:scale-[0.98] rounded-md px-2 py-1 -mx-2 -my-1"
          >
            arbor code
          </button>
        </div>

        {/* Right side - User menu */}
        <CodeUserMenu />
      </div>
    </header>
  );
} 