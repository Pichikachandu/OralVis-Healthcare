import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Patient'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Convert role to lowercase before sending
      const registrationData = {
        ...formData,
        role: formData.role.toLowerCase()
      };

      // Register the user with lowercase role
      await api.post('/auth/register', registrationData);

      // Redirect to login page with success message
      navigate('/login', {
        state: {
          registered: true,
          email: formData.email,
          message: 'Registration successful! Please log in to continue.'
        }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

      <main className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl shadow-2xl shadow-primary/20 md:grid-cols-2">
        {/* Left side - Graphics */}
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
            <h2 className="mt-8 font-display text-4xl font-semibold tracking-tight">Join the Future of Oral Healthcare.</h2>
            <p className="mt-4 text-lg text-blue-100/90">Create your account to access state-of-the-art tools for oral health visualization and management.</p>

            <div className="mt-12 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-accent">person_add</span>
                </div>
                <div>
                  <h3 className="font-semibold">Seamless Onboarding</h3>
                  <p className="text-blue-200">Get started in minutes and transform your practice.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-accent">business_center</span>
                </div>
                <div>
                  <h3 className="font-semibold">Flexible Roles</h3>
                  <p className="text-blue-200">Register as a Patient or an Admin to suit your needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="relative bg-white/80 p-8 backdrop-blur-2xl sm:p-12">
          <div className="absolute inset-0 -z-10 rounded-3xl md:rounded-l-none" style={{
            background: 'radial-gradient(circle at top right, rgba(45, 212, 191, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.1), transparent 40%)'
          }}></div>

          <div className="text-left">
            <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Create Your OralVis Account</h2>
            <p className="mt-2 text-sm text-gray-500">Begin your journey to better oral health management.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">Email address</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-400 shadow-sm transition-shadow focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="role">Role</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">manage_accounts</span>
                <select
                  id="role"
                  name="role"
                  required
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-gray-900 shadow-sm transition-shadow focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Patient">Patient</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-primary via-secondary to-accent py-3 px-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundSize: '200% 200%' }}
              >
                <span className="absolute inset-0 w-full animate-gradient-animation rounded-lg bg-gradient-to-r from-primary via-secondary to-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                <span className="relative">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary transition-colors hover:text-primary/80">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;