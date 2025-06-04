'use client';

import React, { useState } from 'react';
import { Download, Trash } from '@phosphor-icons/react/dist/ssr';
import { exportUserData, clearAllUserData } from '@/app/actions/user-settings';
import { useRouter } from 'next/navigation';

export function DataSettings() {
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportUserData();

            if ('error' in result) {
                console.error('Export failed:', result.error);
                return;
            }

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `webs-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export data:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearData = async () => {
        setIsClearing(true);
        try {
            const result = await clearAllUserData();

            if ('error' in result) {
                console.error('Clear data failed:', result.error);
                return;
            }

            // Redirect to home page after clearing data
            router.push('/');
        } catch (error) {
            console.error('Failed to clear data:', error);
        } finally {
            setIsClearing(false);
            setShowConfirmDialog(false);
        }
    };

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
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="px-4 py-2 text-sm font-mono bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg disabled:opacity-50"
                        >
                            {isExporting ? 'Exporting...' : 'Export'}
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
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={isClearing}
                            className="px-4 py-2 text-sm font-mono bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg disabled:opacity-50"
                        >
                            {isClearing ? 'Clearing...' : 'Clear All'}
                        </button>
                    </div>
                </div>

                {/* Storage usage would need to be calculated from actual data */}
                <div className="border border-border rounded-lg p-4">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium font-mono">Storage Usage</h3>
                        <p className="text-xs text-muted-foreground font-mono">
                            Storage metrics will be calculated from your actual data
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background border border-border rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold font-mono mb-2">Confirm Data Deletion</h3>
                        <p className="text-sm text-muted-foreground font-mono mb-4">
                            Are you sure you want to delete all your data? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-sm font-mono border border-border hover:bg-accent rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearData}
                                disabled={isClearing}
                                className="px-4 py-2 text-sm font-mono bg-red-600 text-white hover:bg-red-700 rounded-lg disabled:opacity-50"
                            >
                                {isClearing ? 'Clearing...' : 'Delete All Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 