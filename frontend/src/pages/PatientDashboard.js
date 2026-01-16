import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from './PatientDashboard.module.css';
import UploadForm from '../components/UploadForm';

const PatientDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { user, logout } = useAuth();

  // Set initial theme based on localStorage or system preference
  useEffect(() => {
    const lightButton = document.getElementById('light-button');
    const darkButton = document.getElementById('dark-button');

    // Check if user has a stored preference
    const storedTheme = localStorage.getItem('theme');

    let isDark = false;

    if (storedTheme) {
      // Use stored preference
      isDark = storedTheme === 'dark';
    } else {
      // Fall back to system preference only if no stored preference
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      if (darkButton) darkButton.classList.add('bg-primary-light', 'shadow-lg');
      if (lightButton) lightButton.classList.remove('bg-primary-light', 'shadow-lg');
      setDarkMode(true);
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      if (lightButton) lightButton.classList.add('bg-primary-light', 'shadow-lg');
      if (darkButton) darkButton.classList.remove('bg-primary-light', 'shadow-lg');
      setDarkMode(false);
    }
  }, []);

  // Stats data will be defined after the useMemo hook

  // Helper function to get time ago string
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return null;
  };

  // Format date for display with better error handling
  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return 'Date not available';

      // Handle both string and Date objects
      const date = new Date(dateValue);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return 'Date not available';
      }

      // Format options for date
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };

      const formattedDate = date.toLocaleString(undefined, options);
      const timeAgo = getTimeAgo(date);

      return timeAgo ? `${formattedDate} (${timeAgo})` : formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  // Get status display info (matching AllCases.js)
  const getStatusInfo = (status) => {
    switch (status) {
      case 'uploaded':
        return {
          text: 'In Review',
          icon: 'hourglass_top',
          class: 'text-amber-500',
          bgClass: 'bg-amber-100 text-amber-600',
          iconClass: 'text-amber-500'
        };
      case 'request_resubmission':
        return {
          text: 'Resubmission Requested',
          icon: 'warning',
          class: 'text-red-500',
          bgClass: 'bg-red-100 text-red-600',
          iconClass: 'text-red-500'
        };
      case 'reported':
        return {
          text: 'Report Ready',
          icon: 'check_circle',
          class: 'text-emerald-500',
          bgClass: 'bg-green-100 text-green-600',
          iconClass: 'text-green-500'
        };
      case 'completed':
        return {
          text: 'Completed',
          icon: 'task_alt',
          class: 'text-emerald-500',
          bgClass: 'bg-green-100 text-green-600',
          iconClass: 'text-green-500'
        };
      default:
        return {
          text: 'Processing...',
          icon: 'hourglass_top',
          class: 'text-amber-500',
          bgClass: 'bg-amber-100 text-amber-600',
          iconClass: 'text-amber-500'
        };
    }
  };

  // Add error state
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({ total: 0, inReview: 0, completed: 0 });

  // Memoize the fetch function
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stats and recent submissions in parallel
      const [statsRes, submissionsRes] = await Promise.all([
        api.get('/submissions/stats/patient'),
        api.get('/submissions/own?limit=5')
      ]);

      setStatsData(statsRes.data);
      setSubmissions(submissionsRes.data.submissions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats data using fetched values
  const stats = [
    {
      title: 'Total Cases',
      value: statsData.total.toString(),
      icon: 'folder',
      trend: '',
      color: 'cyan',
      trendIcon: 'trending_up'
    },
    {
      title: 'In Review',
      value: statsData.inReview.toString(),
      icon: 'hourglass_top',
      trend: '',
      color: 'amber',
      trendIcon: 'hourglass_top'
    },
    {
      title: 'Completed',
      value: statsData.completed.toString(),
      icon: 'task_alt',
      trend: '',
      color: 'emerald',
      trendIcon: 'check_circle'
    }
  ];

  const handleUpload = async (submissionData) => {
    try {
      setIsLoading(true);

      // The submission is already handled by the form, just update the UI
      if (submissionData && submissionData._id) {
        setSubmissions(prev => [submissionData, ...prev]);
        setShowUploadForm(false);
        return true;
      }

      // If we get here, something went wrong
      console.error('Invalid submission data received:', submissionData);
      toast.error('Error: Invalid submission data received');
      return false;

    } catch (error) {
      console.error('Error handling submission:', {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status
      });

      // Don't show an alert here as the form component already handles errors
      return false;
    } finally {
      setIsLoading(false);
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
        <div className={`${styles.mainContent} flex-1 overflow-y-auto overflow-x-hidden w-full`}>
          {/* eslint-disable-next-line no-undef */}
          {isLoading ? (
            <div className="h-[70vh] flex items-center justify-center">
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <LoadingSpinner message="Preparing your dashboard..." />
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between p-6 lg:p-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-text-primary dark:text-glow">Patient Dashboard</h1>
                  <p className="text-slate-600 dark:text-text-secondary mt-1">
                    {user?.name ? `Welcome back, Dr. ${user.name}` : 'Welcome back'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Theme Toggle */}
                  <div className="flex items-center p-1 bg-light-surface-accent dark:bg-surface-accent rounded-full border border-light-border-color dark:border-border-color cursor-pointer transition-colors duration-500" id="theme-toggle">
                    <button
                      onClick={() => {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.classList.add('light');
                        document.getElementById('light-button').classList.add('bg-primary-light', 'shadow-lg');
                        document.getElementById('dark-button').classList.remove('bg-primary-light', 'shadow-lg');
                        localStorage.setItem('theme', 'light');
                        setDarkMode(false);
                      }}
                      className="group p-2 rounded-full"
                      id="light-button"
                    >
                      <span className="material-symbols-outlined text-[#0A7599] text-lg">light_mode</span>
                    </button>
                    <button
                      onClick={() => {
                        document.documentElement.classList.remove('light');
                        document.documentElement.classList.add('dark');
                        document.getElementById('dark-button').classList.add('bg-primary-light', 'shadow-lg');
                        document.getElementById('light-button').classList.remove('bg-primary-light', 'shadow-lg');
                        localStorage.setItem('theme', 'dark');
                        setDarkMode(true);
                      }}
                      className="group p-2 rounded-full"
                      id="dark-button"
                    >
                      <span className="material-symbols-outlined text-light-text-secondary dark:text-text-secondary text-lg">dark_mode</span>
                    </button>
                  </div>

                  {/* New Case Button */}
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="group relative hidden sm:inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-light-surface-accent dark:bg-surface-accent px-6 font-bold text-light-text-primary dark:text-text-primary transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/90"
                  >
                    <span className="absolute -inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#0891b2_0%,#0e7490_50%,#0891b2_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute inset-[1.5px] rounded-full bg-light-surface-accent dark:bg-surface-accent"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="material-symbols-outlined">add</span>
                      New Case
                    </span>
                  </button>

                  {/* Profile Picture */}
                  <div className="relative">
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-2 border-light-border-color dark:border-border-color/50 transition-colors duration-500 overflow-hidden"
                      style={{
                        backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDqUYaEaDckomxAbG07gxogQk8cEGzFmfCiFmyXgOJPZltZWQm6fWvoZ76rRPtLcE_B1hSl9i-NUokyJ7AWNc6Odo0Edu5zknImgzQHH-5NpZ-NQmj79OWOuEilbjbRWDdpnmxVy68oW6VtbU-BP54mlf-LNyP8gDdFXAE_lVKSvALyesMCEgLHj0TKh1-irZ-Prfa1y9wkTsLGCXLSbHsyFlNKXKj32nSISTbH9nygO-086ss3VgWDgFstuJ8AkvRr42wwfoOBpUA)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center'
                      }}
                    ></div>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-900"></span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-red-500/50 dark:border-red-400/30 text-red-500 dark:text-red-400 font-semibold text-sm hover:bg-red-500/10 dark:hover:bg-red-400/10 hover:border-red-500/80 dark:hover:border-red-400/50 transition-all duration-300"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                  </button>
                </div>
              </header>

              <main className={`${styles.content} overflow-y-auto overflow-x-hidden h-full w-full max-w-full`}>
                {/* Upload Form Overlay */}
                {showUploadForm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                      <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setShowUploadForm(false)}
                      ></div>
                      <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all">
                        <UploadForm
                          onUpload={handleUpload}
                          onCancel={() => setShowUploadForm(false)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {submissions.length === 0 ? (
                  /* No Cases State */
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIllustration}>
                      <div className={styles.emptyStateCircle}>
                        <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 117.5-6.566 5 5 0 017.5 6.572"></path>
                          <path d="M12 6.428v11.144"></path>
                        </svg>
                      </div>
                    </div>
                    <h2 className={styles.emptyStateTitle}>Ready to Begin?</h2>
                    <p className={styles.emptyStateText}>
                      Your dashboard is waiting. Submit your first case to unlock powerful AI-driven dental analysis.
                    </p>
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className={styles.primaryButton}
                    >
                      <span className="material-symbols-outlined">add_circle</span>
                      <span>Submit Your First Case</span>
                    </button>
                  </div>
                ) : (
                  /* Has Cases State */
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {stats.map((stat, index) => (
                        <div key={index} className="relative overflow-hidden group rounded-2xl p-6 flex flex-col gap-4 bg-white dark:bg-surface/50 border border-slate-200 dark:border-border-color/50 backdrop-blur-lg shadow-md dark:card-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color === 'cyan' ? 'from-cyan-500/10' :
                            stat.color === 'amber' ? 'from-amber-500/10' :
                              'from-emerald-500/10'
                            } via-transparent to-transparent opacity-0 dark:opacity-50 dark:group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-lg text-slate-600 dark:text-text-secondary">{stat.title}</p>
                              <p className="text-5xl font-black tracking-tighter text-slate-900 dark:text-text-primary dark:text-glow">{stat.value}</p>
                            </div>
                            <div className={`p-3 ${stat.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
                              stat.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/20' :
                                'bg-emerald-500/10 border border-emerald-500/20'
                              } rounded-lg`}>
                              <span className={`material-symbols-outlined ${stat.color === 'cyan' ? 'text-cyan-400' :
                                stat.color === 'amber' ? 'text-amber-400' :
                                  'text-emerald-400'
                                }`}>{stat.icon}</span>
                            </div>
                          </div>
                          <p className={`${stat.color === 'cyan' ? 'text-cyan-400' :
                            stat.color === 'amber' ? 'text-amber-400' :
                              'text-emerald-400'
                            } text-sm font-medium flex items-center mt-auto`}>
                            <span className="material-symbols-outlined text-base mr-1">{stat.trendIcon}</span>
                            {stat.trend}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Recent Cases */}
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary px-1 pb-4">Recent Cases</h2>
                      <div className="flex flex-col gap-3">
                        {[...submissions]
                          .sort((a, b) => {
                            // Try multiple possible date fields and fallback to current date if none found
                            const getDate = (item) => {
                              const dateStr = item.uploadDate || item.createdAt || item.date || item.timestamp;
                              const date = dateStr ? new Date(dateStr) : new Date();
                              return isNaN(date.getTime()) ? new Date() : date;
                            };
                            return getDate(b) - getDate(a); // Newest first
                          })
                          .slice(0, 5)
                          .map((submission) => (
                            <div key={submission._id} className="group grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 py-3 px-5 rounded-xl bg-white dark:bg-surface/50 border border-slate-200 dark:border-border-color/50 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-surface-accent/70 hover:border-slate-300 dark:hover:border-border-color transition-all duration-300">
                              <div className={`h-11 w-11 flex items-center justify-center rounded-lg ${submission.status === 'completed' || submission.status === 'reported'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20'
                                : submission.status === 'request_resubmission'
                                  ? 'bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20'
                                  : 'bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20'
                                } transition-colors duration-300`}>
                                <span className={`material-symbols-outlined ${submission.status === 'completed' || submission.status === 'reported'
                                  ? 'text-emerald-400'
                                  : submission.status === 'request_resubmission'
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                  }`}>
                                  {getStatusInfo(submission.status).icon}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-text-primary">
                                  {submission.title || (submission.name ? `${submission.name}'s Case` : 'Dental Analysis')}
                                  {submission.patientID && ` (ID: ${submission.patientID})`}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-text-secondary">
                                  {formatDate(submission.uploadDate || submission.createdAt || submission.date || submission.timestamp)}
                                </p>
                              </div>
                              <div className={`flex items-center gap-2 text-sm font-medium ${submission.status === 'completed' || submission.status === 'reported'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                                }`}>
                                <span className={`h-2 w-2 rounded-full ${submission.status === 'completed' || submission.status === 'reported'
                                  ? 'bg-emerald-400'
                                  : 'bg-amber-400 animate-pulse'
                                  }`}></span>
                                {getStatusInfo(submission.status).text}
                              </div>
                              <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface hover:text-slate-900 dark:hover:text-text-primary transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </main>
            </>
          )}
        </div>
      </div>

      {/* Add Material Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    </div>
  );
};

export default PatientDashboard;