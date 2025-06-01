'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, SpinnerGap, Warning, Globe, Brain, Sparkle, Package, Check } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import type { WorkflowStep } from '@/hooks/code/web/workflow-stream';

interface WorkflowProgressProps {
    steps: WorkflowStep[];
    currentStep?: WorkflowStep;
    progress: number;
    className?: string;
}

const STEP_INFO = {
    'fetch-urls': {
        name: 'Fetching Content',
        description: 'Retrieving web pages',
        icon: Globe,
        color: 'blue',
    },
    'generate-quick-metadata': {
        name: 'Quick Analysis',
        description: 'Generating title & emoji',
        icon: Sparkle,
        color: 'purple',
    },
    'detailed-analysis': {
        name: 'Deep Analysis',
        description: 'Analyzing content in detail',
        icon: Brain,
        color: 'green',
    },
    'enhanced-combine': {
        name: 'Combining Insights',
        description: 'Finding connections',
        icon: Package,
        color: 'orange',
    },
    'final-assembly': {
        name: 'Final Assembly',
        description: 'Preparing results',
        icon: Check,
        color: 'indigo',
    },
};

function StepIcon({ step, status }: { step: string; status: string }) {
    const info = STEP_INFO[step as keyof typeof STEP_INFO] || { icon: Circle, color: 'gray' };
    const Icon = info.icon;

    if (status === 'completed') {
        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    `bg-${info.color}-600`
                )}
            >
                <CheckCircle size={20} weight="fill" className="text-white" />
            </motion.div>
        );
    }

    if (status === 'started') {
        return (
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                `bg-${info.color}-100 dark:bg-${info.color}-950`
            )}>
                <SpinnerGap size={20} weight="duotone" className={cn(
                    "animate-spin",
                    `text-${info.color}-600`
                )} />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-950">
                <Warning size={20} weight="duotone" className="text-red-600" />
            </div>
        );
    }

    // Not started yet
    return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Icon size={20} weight="duotone" className="text-gray-400" />
        </div>
    );
}

export function WorkflowProgress({ steps, currentStep, progress, className }: WorkflowProgressProps) {
    const allStepKeys = Object.keys(STEP_INFO);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Progress bar */}
            <div className="relative">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
                <div className="absolute -top-1 left-0 right-0 flex justify-between">
                    {allStepKeys.map((stepKey, index) => {
                        const step = steps.find(s => s.step === stepKey);
                        const isActive = currentStep?.step === stepKey;
                        const position = (index / (allStepKeys.length - 1)) * 100;

                        return (
                            <div
                                key={stepKey}
                                className="absolute -translate-x-1/2"
                                style={{ left: `${position}%` }}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 transition-all",
                                    step?.status === 'completed'
                                        ? "bg-green-600 border-green-600"
                                        : isActive
                                            ? "bg-white border-blue-600"
                                            : "bg-gray-200 border-gray-300"
                                )}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step list */}
            <div className="space-y-3">
                {allStepKeys.map((stepKey) => {
                    const step = steps.find(s => s.step === stepKey);
                    const info = STEP_INFO[stepKey as keyof typeof STEP_INFO];
                    const isActive = currentStep?.step === stepKey;

                    return (
                        <motion.div
                            key={stepKey}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-all",
                                isActive && "bg-muted",
                                step?.status === 'completed' && "opacity-70"
                            )}
                        >
                            <StepIcon step={stepKey} status={step?.status || 'pending'} />

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isActive && "text-foreground",
                                        !step && "text-muted-foreground"
                                    )}>
                                        {info.name}
                                    </span>
                                    {step?.status === 'completed' && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-xs text-green-600 font-mono"
                                        >
                                            ✓ DONE
                                        </motion.span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {info.description}
                                </span>
                            </div>

                            {step?.timestamp && (
                                <span className="text-xs text-muted-foreground font-mono">
                                    {new Date(step.timestamp).toLocaleTimeString()}
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Current step details */}
            <AnimatePresence mode="wait">
                {currentStep && currentStep.status === 'started' && (
                    <motion.div
                        key={currentStep.step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-sm">
                            <SpinnerGap size={16} className="animate-spin text-blue-600" />
                            <span className="text-blue-900 dark:text-blue-100">
                                {STEP_INFO[currentStep.step as keyof typeof STEP_INFO]?.name || currentStep.step}...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 