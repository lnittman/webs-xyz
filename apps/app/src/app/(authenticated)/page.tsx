import { auth } from '@repo/auth/server';
import { notFound } from 'next/navigation';

const App = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return <div className="flex flex-1 p-4" />;
};

export default App;
