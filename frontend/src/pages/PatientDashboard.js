import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiClock, FiCheckCircle, FiAlertCircle, FiFilePlus, FiLogOut } from 'react-icons/fi';
import UploadForm from '../components/UploadForm';
import SubmissionListItem from '../components/SubmissionListItem';
import api from '../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/submissions/own');
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };
    fetchSubmissions();
  }, []);

  const handleUpload = (newSubmission) => {
    setSubmissions(prev => [newSubmission, ...prev]);
    setShowUploadForm(false);
  };

  const statusCounts = submissions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Cases</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage your dental case submissions</p>
          </div>
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-3">
            <button
              onClick={handleLogout}
              className="w-full xs:w-auto flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <FiLogOut className="mr-1.5 sm:mr-2 flex-shrink-0" />
              <span>Logout</span>
            </button>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="w-full xs:w-auto flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <FiFilePlus className="mr-1.5 sm:mr-2 flex-shrink-0" />
              <span>{showUploadForm ? 'Cancel' : 'New Case'}</span>
            </button>
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Submit New Case</h2>
            <UploadForm onUpload={handleUpload} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-indigo-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Total Cases</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{submissions.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-yellow-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium flex items-center">
              <FiClock className="mr-1.5 flex-shrink-0" />
              <span>In Review</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">
              {statusCounts.pending || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-green-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium flex items-center">
              <FiCheckCircle className="mr-1.5 flex-shrink-0" />
              <span>Completed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
              {statusCounts.reported || 0}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-xl shadow-sm sm:shadow-md overflow-hidden">
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Case History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <SubmissionListItem submission={submission} />
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No cases yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by submitting your first case.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiFilePlus className="mr-2 -ml-1" />
                    New Case
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;