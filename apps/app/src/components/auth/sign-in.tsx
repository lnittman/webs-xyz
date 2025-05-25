'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next-view-transitions';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsAsciiLogo } from '@/components/shared/webs-ascii';

// Custom Apple Icon that works in both light and dark modes
const AppleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

// Custom Google Icon
const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export function CustomSignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Wait for component to be fully mounted and ready
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    if (!isLoaded) {
        return (
            <div className="w-full space-y-6 opacity-0">
                {/* Invisible placeholder to prevent layout shift */}
                <div className="text-center space-y-4">
                    <div className="h-16 w-full" /> {/* ASCII logo placeholder */}
                </div>
                <div className="space-y-4">
                    <div className="h-10 w-full" /> {/* Social buttons placeholder */}
                    <div className="h-10 w-full" />
                    <div className="h-8 w-full" /> {/* Divider placeholder */}
                    <div className="h-10 w-full" /> {/* Email input placeholder */}
                    <div className="h-10 w-full" /> {/* Password input placeholder */}
                    <div className="h-10 w-full" /> {/* Submit button placeholder */}
                </div>
                <div className="h-4 w-full" /> {/* Footer placeholder */}
            </div>
        );
    }

    return (
        <motion.div
            className="w-full space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Header */}
            <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <WebsAsciiLogo size="medium" className="mx-auto" />
            </motion.div>

            <SignIn.Root>
                <SignIn.Step name="start">
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        {/* Social Sign In */}
                        <div className="space-y-3">
                            <Clerk.Connection
                                name="apple"
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-background border border-border hover:border-foreground/20 hover:bg-accent/50 transition-all duration-200 font-mono text-sm rounded-lg h-10"
                            >
                                <AppleIcon className="w-4 h-4 text-foreground" />
                                Continue with Apple
                            </Clerk.Connection>

                            <Clerk.Connection
                                name="google"
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-background border border-border hover:border-foreground/20 hover:bg-accent/50 transition-all duration-200 font-mono text-sm rounded-lg h-10"
                            >
                                <GoogleIcon className="w-4 h-4" />
                                Continue with Google
                            </Clerk.Connection>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-background px-3 text-muted-foreground font-mono">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <div className="space-y-4">
                            <Clerk.Field name="identifier">
                                <Clerk.Label className="block text-sm font-medium font-mono text-foreground mb-2">
                                    Email
                                </Clerk.Label>
                                <Clerk.Input
                                    className="w-full h-10 px-3 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors rounded-lg"
                                    placeholder="user@example.com"
                                />
                                <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <Clerk.Field name="password">
                                <div className="flex items-center justify-between mb-2">
                                    <Clerk.Label className="text-sm font-medium font-mono text-foreground">
                                        Password
                                    </Clerk.Label>
                                    <SignIn.Action
                                        navigate="forgot-password"
                                        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Forgot password?
                                    </SignIn.Action>
                                </div>
                                <div className="relative">
                                    <Clerk.Input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full h-10 px-3 pr-10 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors rounded-lg"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlash size={16} weight="duotone" />
                                        ) : (
                                            <Eye size={16} weight="duotone" />
                                        )}
                                    </button>
                                </div>
                                <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors font-mono text-sm rounded-lg h-10 group"
                            >
                                Sign In
                                <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-1">
                                    <ArrowRight size={14} weight="duotone" />
                                </span>
                            </SignIn.Action>
                        </div>
                    </motion.div>
                </SignIn.Step>

                {/* Verification Step */}
                <SignIn.Step name="verifications">
                    <SignIn.Strategy name="email_code">
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-semibold font-mono">Check your email</h2>
                                <p className="text-sm text-muted-foreground font-mono">
                                    We sent a verification code to{' '}
                                    <span className="text-foreground">
                                        <SignIn.SafeIdentifier />
                                    </span>
                                </p>
                            </div>

                            <Clerk.Field name="code">
                                <Clerk.Label className="block text-sm font-medium font-mono text-foreground mb-2">
                                    Verification Code
                                </Clerk.Label>
                                <Clerk.Input
                                    className="w-full h-10 px-3 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors text-center tracking-widest rounded-lg"
                                    placeholder="000000"
                                />
                                <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors font-mono text-sm rounded-lg h-10 group"
                            >
                                Verify
                                <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-0.5">
                                    <ArrowRight size={14} weight="duotone" />
                                </span>
                            </SignIn.Action>
                        </div>
                    </SignIn.Strategy>

                    <SignIn.Strategy name="password">
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-semibold font-mono">Enter password</h2>
                                <p className="text-sm text-muted-foreground font-mono">
                                    Please enter your password to continue
                                </p>
                            </div>

                            <Clerk.Field name="password">
                                <Clerk.Label className="block text-sm font-medium font-mono text-foreground mb-2">
                                    Password
                                </Clerk.Label>
                                <div className="relative">
                                    <Clerk.Input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full h-10 px-3 pr-10 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors rounded-lg"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlash size={16} weight="duotone" />
                                        ) : (
                                            <Eye size={16} weight="duotone" />
                                        )}
                                    </button>
                                </div>
                                <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors font-mono text-sm rounded-lg h-10 group"
                            >
                                Sign In
                                <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-0.5">
                                    <ArrowRight size={14} weight="duotone" />
                                </span>
                            </SignIn.Action>

                            <SignIn.Action
                                navigate="forgot-password"
                                className="w-full text-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Forgot password?
                            </SignIn.Action>
                        </div>
                    </SignIn.Strategy>
                </SignIn.Step>

                {/* Forgot Password Step */}
                <SignIn.Step name="forgot-password">
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-semibold font-mono">Reset password</h2>
                            <p className="text-sm text-muted-foreground font-mono">
                                Enter your email to receive a reset link
                            </p>
                        </div>

                        <Clerk.Field name="identifier">
                            <Clerk.Label className="block text-sm font-medium font-mono text-foreground mb-2">
                                Email
                            </Clerk.Label>
                            <Clerk.Input
                                className="w-full h-10 px-3 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors rounded-lg"
                                placeholder="user@example.com"
                            />
                            <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                        </Clerk.Field>

                        <SignIn.SupportedStrategy name="reset_password_email_code">
                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors font-mono text-sm rounded-lg h-10 group"
                            >
                                Send reset link
                                <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-0.5">
                                    <ArrowRight size={14} weight="duotone" />
                                </span>
                            </SignIn.Action>
                        </SignIn.SupportedStrategy>

                        <SignIn.Action
                            navigate="start"
                            className="w-full text-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Back to sign in
                        </SignIn.Action>
                    </div>
                </SignIn.Step>

                {/* Reset Password Step */}
                <SignIn.Step name="reset-password">
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-semibold font-mono">New password</h2>
                            <p className="text-sm text-muted-foreground font-mono">
                                Create a new password for your account
                            </p>
                        </div>

                        <Clerk.Field name="password">
                            <Clerk.Label className="block text-sm font-medium font-mono text-foreground mb-2">
                                New Password
                            </Clerk.Label>
                            <div className="relative">
                                <Clerk.Input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full h-10 px-3 pr-10 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors rounded-lg"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlash size={16} weight="duotone" />
                                    ) : (
                                        <Eye size={16} weight="duotone" />
                                    )}
                                </button>
                            </div>
                            <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                        </Clerk.Field>

                        <Clerk.Field name="confirmPassword">
                            <Clerk.Label className="block text-sm font-medium font-mono text-foreground mb-2">
                                Confirm Password
                            </Clerk.Label>
                            <Clerk.Input
                                type="password"
                                className="w-full h-10 px-3 bg-background border border-border hover:border-foreground/20 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20 font-mono text-sm transition-colors rounded-lg"
                                placeholder="••••••••"
                            />
                            <Clerk.FieldError className="text-red-600 text-xs font-mono mt-1" />
                        </Clerk.Field>

                        <SignIn.Action
                            submit
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors font-mono text-sm rounded-lg h-10 group"
                        >
                            Reset password
                            <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-0.5">
                                <ArrowRight size={14} weight="duotone" />
                            </span>
                        </SignIn.Action>
                    </div>
                </SignIn.Step>
            </SignIn.Root>

            {/* Footer */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <p className="text-xs text-muted-foreground font-mono">
                    Don't have an account?{' '}
                    <Link
                        href="/sign-up"
                        className="text-foreground hover:text-foreground/80 transition-colors"
                    >
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
} 