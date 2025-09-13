import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiClock, FiCheckCircle, FiAlertCircle, FiLogOut } from 'react-icons/fi';
import SubmissionListItem from '../components/SubmissionListItem';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, uploaded: 0, annotated: 0, reported: 0 });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/submissions');
        setSubmissions(data);
        
        // Calculate stats
        const uploaded = data.filter(s => s.status === 'uploaded').length;
        const annotated = data.filter(s => s.status === 'annotated').length;
        const reported = data.filter(s => s.status === 'reported').length;
        setStats({
          total: data.length,
          uploaded,
          annotated,
          reported,
        });
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center">
            <FiUsers className="text-2xl sm:text-3xl text-indigo-600 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <FiLogOut className="mr-1.5 sm:mr-2" />
            <span>Logout</span>
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-indigo-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Total Submissions</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-yellow-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium flex items-center">
              <FiClock className="mr-1.5 flex-shrink-0" />
              <span>Uploaded</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{stats.uploaded}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-blue-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Annotated</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{stats.annotated}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-5 md:p-6 border-l-4 border-green-500">
            <div className="text-xs sm:text-sm text-gray-500 font-medium flex items-center">
              <FiCheckCircle className="mr-1.5 flex-shrink-0" />
              <span>Reported</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.reported}</div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-xl shadow-sm sm:shadow-md overflow-hidden">
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <div key={sub._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <SubmissionListItem submission={sub} />
                </div>
              ))
            ) : (
              <div className="p-4 sm:p-6 text-center text-gray-500">
                <FiAlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No submissions</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">Get started by having patients submit their cases.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;