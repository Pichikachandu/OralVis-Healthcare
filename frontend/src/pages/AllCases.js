import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AllCases = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Fetch submissions
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const { data } = await api.get(`/submissions/own?page=${page}&limit=10`);
                setSubmissions(data.submissions);
                setTotalPages(data.pages);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                const errorMessage = 'Failed to load submissions. Please try again later.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [page]);

    // Map status to display info (matching PatientDashboard)
    const getStatusInfo = (status) => {
        switch (status) {
            case 'uploaded':
                return {
                    text: 'In Review',
                    icon: 'hourglass_top',
                    class: 'text-amber-500',
                    bgClass: 'bg-amber-100 text-amber-600',
                    iconClass: 'text-amber-500',
                    color: 'amber'
                };
            case 'request_resubmission':
                return {
                    text: 'Resubmission Requested',
                    icon: 'warning',
                    class: 'text-red-500',
                    bgClass: 'bg-red-100 text-red-600',
                    iconClass: 'text-red-500',
                    color: 'red'
                };
            case 'reported':
                return {
                    text: 'Report Ready',
                    icon: 'check_circle',
                    class: 'text-emerald-500',
                    bgClass: 'bg-green-100 text-green-600',
                    iconClass: 'text-green-500',
                    color: 'green'
                };
            case 'completed':
                return {
                    text: 'Completed',
                    icon: 'task_alt',
                    class: 'text-emerald-500',
                    bgClass: 'bg-green-100 text-green-600',
                    iconClass: 'text-green-500',
                    color: 'green'
                };
            default:
                return {
                    text: 'Processing...',
                    icon: 'hourglass_top',
                    class: 'text-amber-500',
                    bgClass: 'bg-amber-100 text-amber-600',
                    iconClass: 'text-amber-500',
                    color: 'amber'
                };
        }
    };

    const getStatusClasses = (color) => {
        const classes = {
            amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
            green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300',
            red: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300'
        };
        return classes[color] || classes.amber;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleViewDetails = (submissionId) => {
        navigate(`/patient/all-cases/submission/${submissionId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="bg-white dark:bg-background h-screen w-full overflow-hidden">
            {/* Aurora Background */}
            <div className="aurora-bg transition-all duration-500 fixed inset-0 -z-10"></div>

            <div className="flex h-full w-full">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-72 p-4">
                    <div className="flex flex-col h-full bg-slate-50/80 dark:bg-surface/50 backdrop-blur-2xl border border-slate-200 dark:border-border-color/50 rounded-2xl p-4 shadow-lg dark:shadow-2xl">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <img
                                src="/logo.svg"
                                alt="OralVis Logo"
                                className="h-10 w-10 dark:icon-glow"
                            />
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary dark:text-glow tracking-tight">OralVis</h1>
                        </div>

                        <nav className="mt-10 flex flex-col gap-3">
                            <NavLink
                                to="/patient"
                                end
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 ${isActive ? 'text-slate-900 dark:text-text-primary border-primary dark:border-primary-light bg-slate-100 dark:bg-transparent dark:nav-link-active' : 'border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent'} ${isActive ? 'font-semibold' : 'font-medium'} transition-all duration-300 dark:nav-link`
                                }
                            >
                                <span className="material-symbols-outlined text-2xl">grid_view</span>
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="/patient/all-cases"
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 ${isActive ? 'text-slate-900 dark:text-text-primary border-primary dark:border-primary-light bg-slate-100 dark:bg-transparent dark:nav-link-active' : 'border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent'} ${isActive ? 'font-semibold' : 'font-medium'} transition-all duration-300 dark:nav-link`
                                }
                            >
                                <span className="material-symbols-outlined text-2xl">folder_open</span>
                                <span>All Cases</span>
                            </NavLink>
                            <a
                                href="#"
                                className="flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent font-medium transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl">person</span>
                                <span>Profile</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent font-medium transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl">settings</span>
                                <span>Settings</span>
                            </a>
                        </nav>

                        <div className="mt-auto p-4 bg-slate-100 dark:bg-surface rounded-xl border border-slate-200 dark:border-border-color/50">
                            <h3 className="font-semibold text-slate-900 dark:text-text-primary">Upgrade to Pro</h3>
                            <p className="text-sm text-slate-600 dark:text-text-secondary mt-1">Unlock advanced analytics and unlimited case storage.</p>
                            <button className="w-full mt-4 bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all duration-300 dark:shadow-glow-cyan">Learn More</button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 sm:p-8 md:p-10">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-[#0e121b] dark:text-white">Your Case Submissions</h1>
                                <button
                                    onClick={() => navigate('/patient')}
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    <span className="truncate">Submit a New Case</span>
                                </button>
                            </div>

                            {/* Loading State */}
                            {isLoading ? (
                                <div className="mt-8 flex justify-center">
                                    <LoadingSpinner message="Loading your cases..." />
                                </div>
                            ) : error ? (
                                <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <p className="text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="mt-8 p-12 text-center bg-slate-50 dark:bg-surface/30 rounded-xl border border-slate-200 dark:border-border-color/50">
                                    <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-600 mb-4">folder_open</span>
                                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No cases yet</h2>
                                    <p className="text-slate-500 dark:text-slate-400">Submit your first case to get started</p>
                                </div>
                            ) : (
                                <div className="mt-8 space-y-6">
                                    {submissions.map((submission) => {
                                        const statusInfo = getStatusInfo(submission.status);
                                        return (
                                            <div key={submission._id} className="glassmorphic-card shadow-lg shadow-slate-200/20 dark:shadow-black/20 rounded-xl p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                                                <div className="flex flex-wrap items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#0e121b] dark:text-white">
                                                                {submission.title || `${submission.name}'s Case`}
                                                            </h2>
                                                            <div className={`flex h-7 items-center justify-center gap-x-2 rounded-full px-3 w-fit ${getStatusClasses(statusInfo.color)}`}>
                                                                <span className={`material-symbols-outlined text-sm ${statusInfo.iconClass}`}>{statusInfo.icon}</span>
                                                                <p className="text-sm font-medium leading-normal">{statusInfo.text}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-base">badge</span>
                                                                <p>Patient ID: {submission.patientID}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                                                <p>Submitted: {formatDate(submission.uploadDate)}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-base">update</span>
                                                                <p>Updated: {formatDate(submission.uploadDate)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewDetails(submission._id)}
                                                        className="flex min-w-[84px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200/80 dark:bg-slate-700/50 text-[#0e121b] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300/80 dark:hover:bg-slate-700/80 transition-colors"
                                                    >
                                                        <span className="truncate">View Details</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                                            <button
                                                onClick={() => handlePageChange(page - 1)}
                                                disabled={page === 1}
                                                className="px-4 py-2 rounded-lg bg-white dark:bg-surface border border-slate-200 dark:border-border-color text-slate-600 dark:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-slate-600 dark:text-text-secondary font-medium">
                                                Page {page} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(page + 1)}
                                                disabled={page === totalPages}
                                                className="px-4 py-2 rounded-lg bg-white dark:bg-surface border border-slate-200 dark:border-border-color text-slate-600 dark:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AllCases;
