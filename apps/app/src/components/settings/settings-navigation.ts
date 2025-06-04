import {
  User,
  Palette,
  Database,
  Bell,
  Shield,
  CreditCard,
} from '@phosphor-icons/react/dist/ssr';

export const settingsNavigation = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
] as const;

export type SettingsSection = typeof settingsNavigation[number]['id']; 