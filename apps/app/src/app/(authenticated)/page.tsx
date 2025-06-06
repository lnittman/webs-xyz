import { redirect } from 'next/navigation';
import { currentUser } from '@repo/auth/server';
import { spaceService } from '@repo/api';

export default async function RootPage() {
  const user = await currentUser();

  if (!user) {
    // This shouldn't happen due to middleware, but just in case
    redirect('/sign-in');
  }

  // Fetch user's spaces using the proper service
  const spaces = await spaceService.listSpaces(user.id);

  if (spaces.length === 0) {
    // No spaces found - redirect to settings to create one
    redirect('/settings');
  }

  // Find default space or use first space
  const defaultSpace = spaces.find(s => s.isDefault) || spaces[0];

  // Convert space name to URL format (kebab-case)
  const spaceUrlName = defaultSpace.name.toLowerCase().replace(/\s+/g, '-');

  // Server-side redirect to default space
  redirect(`/${spaceUrlName}`);
} 
