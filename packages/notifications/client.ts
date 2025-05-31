// Export client-side components and hooks
export * from './components';

// Re-export Knock React hooks so apps don't need to depend on @knocklabs/react directly
export {
    useKnockClient,
    useNotifications,
    useNotificationStore,
    KnockProvider,
    KnockFeedProvider
} from '@knocklabs/react'; 