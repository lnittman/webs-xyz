'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next-view-transitions';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsAsciiLogo } from '@/components/shared/webs-ascii';

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
                    <div className="h-12 w-full" /> {/* Social buttons placeholder */}
                    <div className="h-12 w-full" />
                    <div className="h-8 w-full" /> {/* Divider placeholder */}
                    <div className="h-12 w-full" /> {/* Email input placeholder */}
                    <div className="h-12 w-full" /> {/* Password input placeholder */}
                    <div className="h-12 w-full" /> {/* Submit button placeholder */}
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
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-background border border-border hover:border-foreground/50 transition-all duration-200 font-mono text-sm uppercase"
                            >
                                <Clerk.Icon className="w-4 h-4" />
                                CONTINUE WITH APPLE
                            </Clerk.Connection>

                            <Clerk.Connection
                                name="google"
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-background border border-border hover:border-foreground/50 transition-all duration-200 font-mono text-sm uppercase"
                            >
                                <Clerk.Icon className="w-4 h-4" />
                                CONTINUE WITH GOOGLE
                            </Clerk.Connection>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-background px-3 text-muted-foreground font-mono uppercase">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <div className="space-y-4">
                            <Clerk.Field name="identifier">
                                <Clerk.Label className="block text-sm font-mono uppercase text-foreground mb-2">
                                    EMAIL
                                </Clerk.Label>
                                <Clerk.Input
                                    className="w-full px-3 py-3 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200"
                                    placeholder="user@example.com"
                                />
                                <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <Clerk.Field name="password">
                                <div className="flex items-center justify-between mb-2">
                                    <Clerk.Label className="text-sm font-mono uppercase text-foreground">
                                        PASSWORD
                                    </Clerk.Label>
                                    <SignIn.Action
                                        navigate="forgot-password"
                                        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase"
                                    >
                                        FORGOT PASSWORD?
                                    </SignIn.Action>
                                </div>
                                <div className="relative">
                                    <Clerk.Input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-3 py-3 pr-10 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200"
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
                                <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 font-mono text-sm uppercase"
                            >
                                SIGN IN
                                <ArrowRight size={14} weight="duotone" />
                            </SignIn.Action>
                        </div>
                    </motion.div>
                </SignIn.Step>

                {/* Verification Step */}
                <SignIn.Step name="verifications">
                    <SignIn.Strategy name="email_code">
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-mono uppercase">CHECK YOUR EMAIL</h2>
                                <p className="text-sm text-muted-foreground font-mono">
                                    We sent a verification code to{' '}
                                    <span className="text-foreground">
                                        <SignIn.SafeIdentifier />
                                    </span>
                                </p>
                            </div>

                            <Clerk.Field name="code">
                                <Clerk.Label className="block text-sm font-mono uppercase text-foreground mb-2">
                                    VERIFICATION CODE
                                </Clerk.Label>
                                <Clerk.Input
                                    className="w-full px-3 py-3 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200 text-center tracking-widest"
                                    placeholder="000000"
                                />
                                <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 font-mono text-sm uppercase"
                            >
                                VERIFY
                                <ArrowRight size={14} weight="duotone" />
                            </SignIn.Action>
                        </div>
                    </SignIn.Strategy>

                    <SignIn.Strategy name="password">
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-mono uppercase">ENTER PASSWORD</h2>
                                <p className="text-sm text-muted-foreground font-mono">
                                    Please enter your password to continue
                                </p>
                            </div>

                            <Clerk.Field name="password">
                                <Clerk.Label className="block text-sm font-mono uppercase text-foreground mb-2">
                                    PASSWORD
                                </Clerk.Label>
                                <div className="relative">
                                    <Clerk.Input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-3 py-3 pr-10 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200"
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
                                <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                            </Clerk.Field>

                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 font-mono text-sm uppercase"
                            >
                                SIGN IN
                                <ArrowRight size={14} weight="duotone" />
                            </SignIn.Action>

                            <SignIn.Action
                                navigate="forgot-password"
                                className="w-full text-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase"
                            >
                                FORGOT PASSWORD?
                            </SignIn.Action>
                        </div>
                    </SignIn.Strategy>
                </SignIn.Step>

                {/* Forgot Password Step */}
                <SignIn.Step name="forgot-password">
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-mono uppercase">RESET PASSWORD</h2>
                            <p className="text-sm text-muted-foreground font-mono">
                                Enter your email to receive a reset link
                            </p>
                        </div>

                        <Clerk.Field name="identifier">
                            <Clerk.Label className="block text-sm font-mono uppercase text-foreground mb-2">
                                EMAIL
                            </Clerk.Label>
                            <Clerk.Input
                                className="w-full px-3 py-3 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200"
                                placeholder="user@example.com"
                            />
                            <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                        </Clerk.Field>

                        <SignIn.SupportedStrategy name="reset_password_email_code">
                            <SignIn.Action
                                submit
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 font-mono text-sm uppercase"
                            >
                                SEND RESET LINK
                                <ArrowRight size={14} weight="duotone" />
                            </SignIn.Action>
                        </SignIn.SupportedStrategy>

                        <SignIn.Action
                            navigate="start"
                            className="w-full text-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase"
                        >
                            BACK TO SIGN IN
                        </SignIn.Action>
                    </div>
                </SignIn.Step>

                {/* Reset Password Step */}
                <SignIn.Step name="reset-password">
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-mono uppercase">NEW PASSWORD</h2>
                            <p className="text-sm text-muted-foreground font-mono">
                                Create a new password for your account
                            </p>
                        </div>

                        <Clerk.Field name="password">
                            <Clerk.Label className="block text-sm font-mono uppercase text-foreground mb-2">
                                NEW PASSWORD
                            </Clerk.Label>
                            <div className="relative">
                                <Clerk.Input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-3 py-3 pr-10 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200"
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
                            <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                        </Clerk.Field>

                        <Clerk.Field name="confirmPassword">
                            <Clerk.Label className="block text-sm font-mono uppercase text-foreground mb-2">
                                CONFIRM PASSWORD
                            </Clerk.Label>
                            <Clerk.Input
                                type="password"
                                className="w-full px-3 py-3 bg-background border border-border focus:border-foreground/50 focus:outline-none font-mono text-sm transition-all duration-200"
                                placeholder="••••••••"
                            />
                            <Clerk.FieldError className="text-red-500 text-xs font-mono mt-1" />
                        </Clerk.Field>

                        <SignIn.Action
                            submit
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 font-mono text-sm uppercase"
                        >
                            RESET PASSWORD
                            <ArrowRight size={14} weight="duotone" />
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
                <p className="text-xs text-muted-foreground font-mono uppercase">
                    DON'T HAVE AN ACCOUNT?{' '}
                    <Link
                        href="/sign-up"
                        className="text-foreground hover:text-foreground/80 transition-colors"
                    >
                        SIGN UP
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
} 