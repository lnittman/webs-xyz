'use client';

import React, { useState } from 'react';
import { useUser } from '@repo/auth/client';
import { cn } from '@repo/design/lib/utils';
import {
    User,
    PencilSimple,
    Calendar,
    Check,
    X
} from '@phosphor-icons/react/dist/ssr';

export function AccountProfile() {
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        username: user?.username || '',
        bio: ''
    });

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Implement save functionality
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
        }, 1000);
    };

    const initials = user?.firstName && user?.lastName
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
        : user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U';

    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your personal information and preferences
                </p>
            </div>

            {/* Profile Card */}
            <div className="border border-border bg-card rounded-lg p-8">
                <div className="flex flex-col items-center space-y-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="h-24 w-24 bg-accent text-foreground rounded-full flex items-center justify-center text-2xl font-medium border-2 border-border">
                            {initials}
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="absolute -bottom-2 -right-2 h-8 w-8 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-foreground/90 transition-colors border-2 border-background"
                        >
                            <PencilSimple size={14} weight="duotone" />
                        </button>
                    </div>

                    {/* Edit Mode */}
                    {isEditing ? (
                        <div className="w-full max-w-sm space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium font-mono">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                                    placeholder="Enter your first name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium font-mono">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                                    placeholder="Enter your last name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium font-mono">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                                    placeholder="Choose a username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium font-mono">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full h-20 px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                                    placeholder="Tell us about yourself"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 h-10 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    ) : (
                                        <Check size={16} weight="duotone" />
                                    )}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="h-10 px-4 bg-muted hover:bg-muted/80 transition-colors rounded-lg text-sm flex items-center justify-center"
                                >
                                    <X size={16} weight="duotone" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Display Mode */
                        <div className="text-center space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {user?.firstName && user?.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user?.firstName || 'User'
                                    }
                                </h2>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {user?.emailAddresses?.[0]?.emailAddress}
                                </p>
                            </div>

                            {joinDate && (
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Calendar size={14} weight="duotone" />
                                    Joined {joinDate}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Account Information */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">Account Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">User ID</div>
                        <div className="text-xs text-muted-foreground font-mono break-all">
                            {user?.id || 'Not available'}
                        </div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Email Verified</div>
                        <div className="text-xs text-muted-foreground">
                            {user?.emailAddresses?.[0]?.verification?.status === 'verified' ? 'Yes' : 'No'}
                        </div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Last Sign In</div>
                        <div className="text-xs text-muted-foreground">
                            {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Not available'}
                        </div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Account Type</div>
                        <div className="text-xs text-muted-foreground">Personal</div>
                    </div>
                </div>
            </div>
        </div>
    );
} 