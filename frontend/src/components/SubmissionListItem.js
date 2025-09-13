import { Link } from 'react-router-dom';

const SubmissionListItem = ({ submission }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-4 hover:bg-gray-50 transition">
      <h4 className="font-bold">Patient: {submission.name} (ID: {submission.patientID})</h4>
      <p>Status: {submission.status}</p>
      <p>Date: {new Date(submission.uploadDate).toLocaleString()}</p>
      {submission.reportUrl && <a href={submission.reportUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Download Report</a>}
      <Link to={`/submission/${submission._id}`} className="ml-4 text-primary underline">View Details</Link>
    </div>
  );
};

export default SubmissionListItem;