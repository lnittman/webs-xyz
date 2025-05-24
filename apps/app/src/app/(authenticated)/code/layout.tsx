import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'arbor code',
};

export default function CodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 