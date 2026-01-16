import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for success message from registration
    useEffect(() => {
        if (location.state?.registered) {
            setSuccessMessage(location.state.message || 'Registration successful! Please log in.');
            // Clear the state to prevent showing the message again on refresh
            window.history.replaceState({}, document.title);

            // Pre-fill email if provided
            if (location.state.email) {
                setEmail(location.state.email);
            }
        }
    }, [location.state]);

    // Check for remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        const result = await login(email, password, rememberMe);
        if (!result.success) {
            setError(result.error || 'Login failed. Please check your credentials.');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
            {/* Background elements */}
            <div aria-hidden="true" className="absolute inset-0 z-0">
                <svg
                    className="absolute inset-0 h-full w-full stroke-blue-100/30 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern id="wave-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                            <path d="M 0 40 Q 20 40 40 40 Q 60 40 80 40" fill="none" strokeLinecap="round" strokeWidth="1"></path>
                            <path d="M 0 50 Q 20 50 40 50 Q 60 50 80 50" fill="none" strokeLinecap="round" strokeWidth="1"></path>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#wave-pattern)"></rect>
                </svg>
                <div className="absolute -left-1/4 top-0 h-96 w-96 animate-subtle-pulse rounded-full bg-primary/20 blur-3xl"></div>
                <div className="absolute -right-1/4 bottom-0 h-96 w-96 animate-subtle-pulse rounded-full bg-accent/20 blur-3xl [animation-delay:-4s]"></div>
                <div className="absolute left-1/3 top-1/2 h-80 w-80 animate-subtle-pulse rounded-full bg-secondary/10 blur-3xl [animation-delay:-2s]"></div>
            </div>

            {/* Main content */}
            <main className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl shadow-2xl shadow-primary/20 md:grid-cols-2">
                {/* Left side - Branding */}
                <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary p-12 md:flex">
                    <div className="absolute inset-0 animate-subtle-spin opacity-10 [background-image:radial-gradient(circle_at_center,_#ffffff33_1px,_transparent_1px),radial-gradient(circle_at_center,_#ffffff33_1px,_transparent_1px)] [background-size:40px_40px,80px_80px] [background-position:0_0,20px_20px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <div className="flex items-center gap-3">
                            <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
                            </svg>
                            <h1 className="font-display text-3xl font-bold tracking-tight">OralVis</h1>
                        </div>
                        <h2 className="mt-8 font-display text-4xl font-semibold tracking-tight">Revolutionizing Oral Health Management.</h2>
                        <p className="mt-4 text-lg text-blue-100 opacity-90">Visualize, analyze, and manage patient data with unparalleled clarity and precision.</p>

                        <div className="mt-12 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-accent">query_stats</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Advanced Analytics</h3>
                                    <p className="text-blue-200">Gain deep insights with our powerful visualization tools.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-accent">shield</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Enterprise-Grade Security</h3>
                                    <p className="text-blue-200">Your data is protected with industry-leading security protocols.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="relative bg-white/80 p-8 backdrop-blur-2xl sm:p-12">
                    <div className="absolute inset-0 -z-10 rounded-3xl md:rounded-l-none" style={{
                        background: 'radial-gradient(circle at top right, rgba(45, 212, 191, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.1), transparent 40%)'
                    }}></div>

                    <div className="text-left">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Welcome Back to OralVis</h2>
                        <p className="mt-2 text-sm text-gray-500">Sign in to access your dashboard</p>

                        {successMessage && (
                            <div className="mt-4 rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
                                Email address
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {showPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-white"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={() => toast('Please contact support to reset your password.', { icon: '🔑', duration: 4000 })}
                                    className="font-medium text-primary transition-colors hover:text-blue-700"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={false}
                                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-primary via-secondary to-accent py-3 px-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white active:scale-100"
                                style={{
                                    backgroundSize: '200% 200%',
                                }}
                            >
                                <span
                                    className="absolute inset-0 w-full animate-gradient-animation rounded-lg bg-gradient-to-r from-primary via-secondary to-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                ></span>
                                <span className="relative">
                                    Log in
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 space-y-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center text-sm text-gray-600">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-primary transition-colors hover:text-blue-700">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;