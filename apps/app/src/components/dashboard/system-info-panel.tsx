interface SystemInfoPanelProps {
    workspaceId: string;
    selectedModelId: string;
}

export function SystemInfoPanel({ workspaceId, selectedModelId }: SystemInfoPanelProps) {
    return (
        <div className="border border-border bg-card p-4">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                SYSTEM INFO
            </h3>
            <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Workspace:</span>
                    <span className="font-mono">{workspaceId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-mono">{selectedModelId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-mono text-green-600">READY</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-mono">v1.0.0</span>
                </div>
            </div>
        </div>
    );
} 