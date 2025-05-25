'use client';

export function Settings() {
    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Configure your preferences and settings here.
                </p>
            </div>

            <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">General</h4>
                    <p className="text-xs text-muted-foreground">
                        General application settings will be available here.
                    </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">AI Model</h4>
                    <p className="text-xs text-muted-foreground">
                        AI model configuration options will be available here.
                    </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Data</h4>
                    <p className="text-xs text-muted-foreground">
                        Data management and export options will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
} 