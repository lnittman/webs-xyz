'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { Empty } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptBar } from '@/components/shared/prompt-bar';
import { promptFocusedAtom } from '@/atoms/chat';
import { useAttachmentModals } from '@/hooks/attachment/use-attachment-modals';
import { TaskList } from '@/components/code/task-list';
import { useTasks } from '@/hooks/code/task/queries';
import { useCreateTask } from '@/hooks/code/task/mutations';
import { cn } from '@repo/design/lib/utils';

export default function CodePage() {
  const { tasks } = useTasks();
  const { createTask } = useCreateTask();
  const [workspaceId] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
  const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');
  const [activeTab, setActiveTab] = useState<'tasks' | 'archive'>('tasks');
  
  // Attachment modals hook
  const { previewAttachment } = useAttachmentModals();

  const handleSubmit = async (cmd: string) => {
    setIsSubmitting(true);
    try {
      await createTask({ workspaceId, prompt: cmd });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  // Filter tasks based on active tab
  // For now, show all tasks in 'tasks' tab since there's no archived status yet
  const activeTasks = tasks || [];
  const archivedTasks: typeof tasks = []; // Empty for now until archived status is implemented
  const displayTasks = activeTab === 'tasks' ? activeTasks : archivedTasks;

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area with centered layout */}
      <div className="flex flex-col items-center justify-start pt-20 px-6">
        {/* Prominent heading */}
        <div className="w-full max-w-2xl mb-8 text-center">
          <h1 className="text-2xl font-medium text-foreground mb-2">
            what are we coding next?
          </h1>
        </div>

        {/* Input area */}
        <div className="w-full max-w-2xl mb-8">
          <PromptBar 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isFocused={isPromptFocused}
            onFocusChange={setIsPromptFocused}
            onAttachmentPreview={previewAttachment}
            selectedModelId={selectedModelId}
            onModelChange={handleModelChange}
          />
        </div>

        {/* Task list section - always show tabs */}
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            {/* Tabs header */}
            <div className="flex items-center gap-4 mb-4 border-b border-border">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={cn(
                  "text-sm pb-2 border-b-2 transition-colors",
                  activeTab === 'tasks' 
                    ? "border-primary text-foreground font-medium" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                tasks
              </button>
              <button 
                onClick={() => setActiveTab('archive')}
                className={cn(
                  "text-sm pb-2 border-b-2 transition-colors",
                  activeTab === 'archive' 
                    ? "border-primary text-foreground font-medium" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                archive
              </button>
            </div>

            {/* Animated tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {/* Task list or empty state */}
                {displayTasks.length > 0 ? (
                  <TaskList tasks={displayTasks} />
                ) : (
                  <div className="flex flex-col py-8 text-center items-center justify-center">
                    <div className="w-12 h-12 bg-muted/40 flex items-center justify-center mb-4 rounded-lg">
                      <Empty weight="duotone" className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'tasks' ? 'no tasks yet' : 'no archived tasks yet'}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 