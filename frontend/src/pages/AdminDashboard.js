import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from './PatientDashboard.module.css';
import LoadingSpinner from '../components/LoadingSpinner';
import SubmissionDetail from './SubmissionDetail';

// Sub-component for Stats Overview
const DashboardOverview = ({ stats, recentPatients }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="relative overflow-hidden group rounded-2xl p-6 flex flex-col gap-4 bg-white dark:bg-surface/50 border border-slate-200 dark:border-border-color/50 backdrop-blur-lg shadow-md dark:card-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color === 'cyan' ? 'from-cyan-500/10' :
              stat.color === 'blue' ? 'from-blue-500/10' :
                stat.color === 'amber' ? 'from-amber-500/10' :
                  'from-emerald-500/10'
              } via-transparent to-transparent opacity-0 dark:opacity-50 dark:group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-lg text-slate-600 dark:text-text-secondary">{stat.title}</p>
                <p className="text-5xl font-black tracking-tighter text-slate-900 dark:text-text-primary dark:text-glow">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
                stat.color === 'blue' ? 'bg-blue-500/10 border border-blue-500/20' :
                  stat.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/20' :
                    'bg-emerald-500/10 border border-emerald-500/20'
                } rounded-lg`}>
                <span className={`material-symbols-outlined ${stat.color === 'cyan' ? 'text-cyan-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'amber' ? 'text-amber-400' :
                      'text-emerald-400'
                  }`}>{stat.icon}</span>
              </div>
            </div>
            <p className={`${stat.color === 'cyan' ? 'text-cyan-400' :
              stat.color === 'blue' ? 'text-blue-400' :
                stat.color === 'amber' ? 'text-amber-400' :
                  'text-emerald-400'
              } text-sm font-medium flex items-center mt-auto`}>
              <span className="material-symbols-outlined text-base mr-1">{stat.trendIcon}</span>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-text-primary">Recent Patients</h2>
          <NavLink to="/admin/patients" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View All <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </NavLink>
        </div>

        <div className="bg-white dark:bg-surface/50 backdrop-blur-md border border-slate-200 dark:border-border-color/50 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-border-color/50 bg-slate-50/50 dark:bg-white/5">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Patient</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Joined</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border-color/50">
                {recentPatients && recentPatients.length > 0 ? (
                  recentPatients.map(patient => (
                    <tr key={patient._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-200 dark:border-indigo-800">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-text-primary text-sm">{patient.name}</p>
                            <p className="text-xs text-slate-500 dark:text-text-secondary">{patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-text-secondary font-mono">
                        {patient.patientID || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-text-secondary">
                        {new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">Active</span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-xl">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-text-secondary italic">
                      No recent patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// Sub-component for Patients List
const PatientsList = ({ formatDate }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [userSubmissions, setUserSubmissions] = useState({}); // Cache for fetched submissions

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/users/with-submissions?page=${page}&limit=10`);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserExpansion = async (userId) => {
    const isExpanded = !expandedUsers[userId];
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: isExpanded
    }));

    // If expanding and submissions not loaded, fetch them
    if (isExpanded && !userSubmissions[userId]) {
      try {
        // Fetch recent 5 submissions for the user
        const res = await api.get(`/users/${userId}/submissions?limit=5`);
        setUserSubmissions(prev => ({
          ...prev,
          [userId]: res.data.submissions
        }));
      } catch (err) {
        console.error(`Error fetching submissions for user ${userId}:`, err);
        toast.error('Failed to load user submissions');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-text-primary">Patient Records</h2>

      {error ? (
        <div className="p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading data</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-10">
          <LoadingSpinner message="Loading patients..." />
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="group bg-white dark:bg-surface/50 backdrop-blur-md border border-slate-200 dark:border-border-color/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-border-color">
              <div
                className="p-5 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                onClick={() => toggleUserExpansion(user._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-text-primary flex items-center gap-2">
                      {user.name}
                      <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                        {user.role}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-text-secondary">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary">
                    <span className="font-bold text-slate-900 dark:text-text-primary">{user.submissionCount}</span> cases
                    <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: expandedUsers[user._id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {expandedUsers[user._id] && (
                <div className="bg-slate-50/50 dark:bg-black/20 border-t border-slate-200 dark:border-border-color/50 p-5">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-text-secondary uppercase tracking-wider mb-3">
                    Recent Cases
                  </h4>

                  {userSubmissions[user._id] ? (
                    userSubmissions[user._id].length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {userSubmissions[user._id].map((submission) => (
                          <div key={submission._id} className="bg-white dark:bg-surface p-4 rounded-lg border border-slate-200 dark:border-border-color/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-slate-900 dark:text-text-primary truncate pr-2">
                                {submission.title || 'Untitled Case'}
                              </h5>
                              <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${submission.status === 'uploaded' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                                submission.status === 'annotated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                                  submission.status === 'reported' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                                }`}>
                                {submission.status || 'unknown'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 dark:text-text-secondary mb-3 space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">badge</span>
                                <span>ID: {submission.patientID || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                <span>{formatDate(submission.uploadDate || submission.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <a
                                href={`/admin/patients/submission/${submission._id}`}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs font-medium text-slate-700 dark:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                View
                              </a>
                              {submission.reportUrl && (
                                <a
                                  href={submission.reportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors shadow-sm hover:shadow"
                                >
                                  <span className="material-symbols-outlined text-[14px]">description</span>
                                  Report
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-text-secondary italic">No cases submitted yet.</p>
                    )
                  ) : (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner message="Loading cases..." />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
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
      ) : (
        <div className="p-10 text-center bg-white dark:bg-surface rounded-xl border border-slate-200 dark:border-border-color/50 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">group_off</span>
          <h3 className="text-lg font-medium text-slate-900 dark:text-text-primary">No patients found</h3>
          <p className="text-slate-500 dark:text-text-secondary">No patients have been registered yet.</p>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Set initial theme based on system preference
  useEffect(() => {
    const lightButton = document.getElementById('light-button');
    const darkButton = document.getElementById('dark-button');

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
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

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch stats
      const statsRes = await api.get('/submissions/stats');
      const statsData = statsRes.data;

      // Transform stats object to array for display
      const transformedStats = [
        {
          title: 'Total Patients',
          value: statsData.totalPatients.toString(),
          icon: 'group',
          trend: 'Active Users',
          color: 'cyan',
          trendIcon: 'trending_up'
        },
        {
          title: 'Total Cases',
          value: statsData.totalSubmissions.toString(),
          icon: 'folder_shared',
          trend: 'All Time',
          color: 'blue',
          trendIcon: 'folder'
        },
        {
          title: 'In Progress',
          value: (statsData.uploaded + statsData.annotated).toString(),
          icon: 'pending_actions',
          trend: 'Needs Action',
          color: 'amber',
          trendIcon: 'hourglass_top'
        },
        {
          title: 'Completed',
          value: statsData.reported.toString(),
          icon: 'task_alt',
          trend: 'Reports Sent',
          color: 'emerald',
          trendIcon: 'check_circle'
        }
      ];
      setStats(transformedStats);

      // Fetch recent patients (limit 5)
      const recentRes = await api.get('/users/with-submissions?limit=5');
      setRecentPatients(recentRes.data.users);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white dark:bg-background min-h-screen w-full">
      {/* Aurora Background */}
      <div className="aurora-bg transition-all duration-500 fixed inset-0 -z-10"></div>

      {/* Add Material Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="flex flex-col h-full bg-slate-50/80 dark:bg-surface/50 backdrop-blur-2xl border border-slate-200 dark:border-border-color/50 rounded-2xl p-4 shadow-lg dark:shadow-2xl">
            <div className="flex items-center gap-3 px-3 py-2">
              <img
                src="/logo.svg"
                alt="OralVis Logo"
                className="h-10 w-10 dark:icon-glow"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-text-primary dark:text-glow tracking-tight">OralVis</h1>
                <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-widest ml-1 self-start mt-1">Admin</span>
              </div>
            </div>

            <nav className="mt-10 flex flex-col gap-3">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 ${isActive ? 'text-slate-900 dark:text-text-primary border-primary dark:border-primary-light bg-slate-100 dark:bg-transparent dark:nav-link-active' : 'border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent'} ${isActive ? 'font-semibold' : 'font-medium'} transition-all duration-300 dark:nav-link`
                }
              >
                <span className="material-symbols-outlined text-2xl">dashboard</span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/patients"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 ${isActive ? 'text-slate-900 dark:text-text-primary border-primary dark:border-primary-light bg-slate-100 dark:bg-transparent dark:nav-link-active' : 'border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent'} ${isActive ? 'font-semibold' : 'font-medium'} transition-all duration-300 dark:nav-link`
                }
              >
                <span className="material-symbols-outlined text-2xl">group</span>
                <span>Patients</span>
              </NavLink>
              <a
                href="#"
                className="flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent font-medium transition-all duration-300"
              >
                <span className="material-symbols-outlined text-2xl">settings</span>
                <span>Settings</span>
              </a>
            </nav>

            <div className="mt-auto p-4 bg-slate-100 dark:bg-surface rounded-xl border border-slate-200 dark:border-border-color/50">
              <h3 className="font-semibold text-slate-900 dark:text-text-primary">Admin Controls</h3>
              <p className="text-sm text-slate-600 dark:text-text-secondary mt-1">Manage system settings and user permissions.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`${styles.mainContent} flex-1 flex flex-col min-w-0`}>
          {isLoading ? (
            <div className="h-[70vh] flex items-center justify-center">
              <LoadingSpinner message="Loading admin dashboard..." />
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between p-6 lg:p-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-text-primary dark:text-glow">Admin Dashboard</h1>
                  <p className="text-slate-600 dark:text-text-secondary mt-1">
                    Manage patients and case submissions
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Theme Toggle */}
                  <div className="flex items-center p-1 bg-light-surface-accent dark:bg-surface-accent rounded-full border border-light-border-color dark:border-border-color cursor-pointer transition-colors duration-500" id="theme-toggle">
                    <button
                      onClick={() => {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.classList.add('light');
                        const lightBtn = document.getElementById('light-button');
                        const darkBtn = document.getElementById('dark-button');
                        if (lightBtn) lightBtn.classList.add('bg-primary-light', 'shadow-lg');
                        if (darkBtn) darkBtn.classList.remove('bg-primary-light', 'shadow-lg');
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
                        const lightBtn = document.getElementById('light-button');
                        const darkBtn = document.getElementById('dark-button');
                        if (darkBtn) darkBtn.classList.add('bg-primary-light', 'shadow-lg');
                        if (lightBtn) lightBtn.classList.remove('bg-primary-light', 'shadow-lg');
                        setDarkMode(true);
                      }}
                      className="group p-2 rounded-full"
                      id="dark-button"
                    >
                      <span className="material-symbols-outlined text-light-text-secondary dark:text-text-secondary text-lg">dark_mode</span>
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchData}
                    className="group relative hidden sm:inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-light-surface-accent dark:bg-surface-accent px-6 font-bold text-light-text-primary dark:text-text-primary transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/90"
                  >
                    <span className="absolute -inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#0891b2_0%,#0e7490_50%,#0891b2_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute inset-[1.5px] rounded-full bg-light-surface-accent dark:bg-surface-accent"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="material-symbols-outlined">refresh</span>
                      Refresh
                    </span>
                  </button>

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

              <main className={`${styles.content} flex-1 w-full max-w-full px-6 lg:px-8 pb-8`}>
                <Routes>
                  <Route path="/" element={<DashboardOverview stats={stats} recentPatients={recentPatients} />} />
                  <Route
                    path="/patients"
                    element={
                      <PatientsList
                        formatDate={(date) => new Date(date).toLocaleDateString()}
                      />
                    }
                  />
                  <Route path="/patients/submission/:id" element={<SubmissionDetail />} />
                </Routes>
              </main>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;