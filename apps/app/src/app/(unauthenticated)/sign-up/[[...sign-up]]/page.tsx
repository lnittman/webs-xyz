import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { CustomSignUp } from '@/components/auth/sign-up';

const title = 'Create an account';
const description = 'Create your space and start spinning AI-powered web analysis.';

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = () => <CustomSignUp />;

export default SignUpPage;
