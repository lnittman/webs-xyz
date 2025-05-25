'use client';

import { Task } from '@/hooks/code/task/queries';
import { cn } from '@repo/design/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  Clock, 
  Warning,
  Spinner,
  CaretRight
} from '@phosphor-icons/react/dist/ssr';

interface TaskListProps {
  tasks: Task[];
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Pending',
    animate: false,
  },
  processing: {
    icon: Spinner,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Processing',
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Completed',
    animate: false,
  },
  failed: {
    icon: Warning,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Failed',
    animate: false,
  },
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const config = statusConfig[task.status];
        const Icon = config.icon;

        return (
          <div
            key={task.id}
            className={cn(
              'group relative rounded-lg border p-4',
              'transition-all duration-200',
              'hover:border-ring hover:shadow-sm',
              'cursor-pointer',
            )}
          >
            <div className="flex items-start gap-3">
              {/* Status icon */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  config.bgColor,
                )}
              >
                <Icon
                  size={16}
                  weight="duotone"
                  className={cn(
                    config.color,
                    config.animate && 'animate-spin',
                  )}
                />
              </div>

              {/* Task content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-relaxed">
                    {task.prompt}
                  </p>
                  <CaretRight size={16} weight="duotone" className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Task metadata */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={cn('font-medium', config.color)}>
                    {config.label}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Error message if failed */}
                {task.status === 'failed' && task.error && (
                  <div className="mt-2 rounded-md bg-red-500/10 p-2">
                    <p className="text-xs text-red-500">{task.error}</p>
                  </div>
                )}

                {/* Result preview if completed */}
                {task.status === 'completed' && task.result && (
                  <div className="mt-2 rounded-md bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.result}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 