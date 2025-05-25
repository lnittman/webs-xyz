import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { CustomSignUp } from '@/components/auth/sign-up';

const title = 'Create an account';
const description = 'Enter your details to get started.';

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = () => <CustomSignUp />;

export default SignUpPage;
