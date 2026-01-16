import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiDownload, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AnnotationCanvas from '../components/AnnotationCanvas';
import api from '../services/api';

const StatusBadge = ({ status }) => {
  const statusMap = {
    uploaded: {
      color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200',
      icon: <FiClock className="w-4 h-4 mr-1.5" />
    },
    annotated: {
      color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200',
      icon: <FiCheckCircle className="w-4 h-4 mr-1.5" />
    },
    reported: {
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
      icon: <FiCheckCircle className="w-4 h-4 mr-1.5" />
    },
    request_resubmission: {
      color: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200',
      icon: <FiAlertTriangle className="w-4 h-4 mr-1.5" />
    },
    default: { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: null },
  };

  const { color, icon } = statusMap[status] || statusMap.default;
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${color}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [upperJson, setUpperJson] = useState(null);
  const [frontJson, setFrontJson] = useState(null);
  const [lowerJson, setLowerJson] = useState(null);
  const [upperBase64, setUpperBase64] = useState('');
  const [frontBase64, setFrontBase64] = useState('');
  const [lowerBase64, setLowerBase64] = useState('');
  const [error, setError] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [resubmissionReason, setResubmissionReason] = useState('');
  const [showResubmissionModal, setShowResubmissionModal] = useState(false);
  const [showReuploadForm, setShowReuploadForm] = useState(false);
  const [reuploadImages, setReuploadImages] = useState({ upper: null, front: null, lower: null });
  const [isReuploading, setIsReuploading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const pdfLoadingToastRef = useRef(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data } = await api.get(`/submissions/${id}`);
        setSubmission(data);
        setUpperJson(data.upperAnnotations || null);
        setFrontJson(data.frontAnnotations || null);
        setLowerJson(data.lowerAnnotations || null);
        setDoctorNotes(data.doctorNotes || '');
      } catch (err) {
        console.error('Fetch submission error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError('Failed to load submission. Check network or permissions.');
      }
    };
    fetchSubmission();
  }, [id]);

  const handleSaveUpper = async (json, base64) => {
    setSavingStates(prev => ({ ...prev, upper: { ...prev.upper, isLoading: true } }));
    setUpperJson(json);
    setUpperBase64(base64);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSavingStates(prev => ({
      ...prev,
      upper: { ...prev.upper, isLoading: false, isSaved: true }
    }));

    setTimeout(() => {
      setSavingStates(prev => ({
        ...prev,
        upper: { ...prev.upper, isSaved: false }
      }));
    }, 2000);
  };

  const handleSaveFront = async (json, base64) => {
    setSavingStates(prev => ({ ...prev, front: { ...prev.front, isLoading: true } }));
    setFrontJson(json);
    setFrontBase64(base64);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setSavingStates(prev => ({
      ...prev,
      front: { ...prev.front, isLoading: false, isSaved: true }
    }));

    setTimeout(() => {
      setSavingStates(prev => ({
        ...prev,
        front: { ...prev.front, isSaved: false }
      }));
    }, 2000);
  };

  const handleSaveLower = async (json, base64) => {
    setSavingStates(prev => ({ ...prev, lower: { ...prev.lower, isLoading: true } }));
    setLowerJson(json);
    setLowerBase64(base64);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setSavingStates(prev => ({
      ...prev,
      lower: { ...prev.lower, isLoading: false, isSaved: true }
    }));

    setTimeout(() => {
      setSavingStates(prev => ({
        ...prev,
        lower: { ...prev.lower, isSaved: false }
      }));
    }, 2000);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [savingStates, setSavingStates] = useState({
    upper: { isLoading: false, isSaved: false },
    front: { isLoading: false, isSaved: false },
    lower: { isLoading: false, isSaved: false },
    all: { isLoading: false, isSaved: false }
  });

  // Check PDF status periodically if generating
  useEffect(() => {
    if (pdfStatus === 'generating') {
      const interval = setInterval(async () => {
        try {
          const { data } = await api.get(`/submissions/${id}`);
          if (data.reportUrl) {
            setSubmission(data);
            setPdfStatus('completed');
            setPdfProgress(100);
            clearInterval(interval);

            // Dismiss loading toast and show success
            if (pdfLoadingToastRef.current) {
              toast.dismiss(pdfLoadingToastRef.current);
              pdfLoadingToastRef.current = null;
            }
            toast.success('PDF report has been generated successfully!');

            // Hide success message after 5 seconds
            setTimeout(() => {
              setPdfStatus(null);
            }, 5000);
          }
        } catch (err) {
          console.error('Error checking PDF status:', err);
          clearInterval(interval);
          setPdfStatus('error');
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [pdfStatus, id]);

  // Function to compress base64 image
  const compressImage = async (base64, quality = 0.7) => {
    if (!base64) return '';

    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200; // Max width/height
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for better compression
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };

      // If image fails to load, return original
      img.onerror = () => resolve(base64);
    });
  };

  const handleSaveAll = async () => {
    // Validate at least one annotation
    if (!upperJson?.objects?.length && !frontJson?.objects?.length && !lowerJson?.objects?.length) {
      setError('No annotations to save. Please annotate at least one image.');
      return;
    }

    setIsSaving(true);
    setSavingStates(prev => ({
      ...prev,
      all: { ...prev.all, isLoading: true, isSaved: false },
      upper: { ...prev.upper, isLoading: true },
      front: { ...prev.front, isLoading: true },
      lower: { ...prev.lower, isLoading: true }
    }));
    setError(null);

    try {
      // Compress images before sending
      const [compressedUpper, compressedFront, compressedLower] = await Promise.all([
        upperBase64 ? compressImage(upperBase64) : '',
        frontBase64 ? compressImage(frontBase64) : '',
        lowerBase64 ? compressImage(lowerBase64) : ''
      ]);

      const payload = {
        upperAnnotations: upperJson || null,
        frontAnnotations: frontJson || null,
        lowerAnnotations: lowerJson || null,
        upperBase64: compressedUpper || '',
        frontBase64: compressedFront || '',
        lowerBase64: compressedLower || '',
        doctorNotes: doctorNotes || null,
      };

      console.log('Saving annotations:', {
        id,
        hasUpper: !!upperJson?.objects?.length,
        hasFront: !!frontJson?.objects?.length,
        hasLower: !!lowerJson?.objects?.length,
        sizes: {
          upper: compressedUpper?.length || 0,
          front: compressedFront?.length || 0,
          lower: compressedLower?.length || 0,
        }
      });

      const { data } = await api.put(`/submissions/${id}/annotate`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
      setSubmission(data);

      // Update saving states
      setSavingStates(prev => ({
        ...prev,
        all: { ...prev.all, isLoading: false, isSaved: true },
        upper: { ...prev.upper, isLoading: false, isSaved: true },
        front: { ...prev.front, isLoading: false, isSaved: true },
        lower: { ...prev.lower, isLoading: false, isSaved: true }
      }));

      // Check if PDF is being generated or if more annotations are needed
      if (data.pdfStatus === 'generating') {
        // Show persistent loading toast for PDF generation immediately
        pdfLoadingToastRef.current = toast.loading('Annotations saved! Generating PDF report...', {
          duration: Infinity // Keep showing until we dismiss it
        });

        setPdfStatus('generating');

        // Start progress from 0%
        setPdfProgress(0);

        // Simulate progress until we reach 90%
        const progressInterval = setInterval(() => {
          setPdfProgress(prev => {
            // Increase by 2% every 200ms until 90%
            const newProgress = Math.min(prev + 2, 90);
            if (newProgress >= 90) {
              clearInterval(progressInterval);
            }
            return newProgress;
          });
        }, 200);

        // Check PDF status periodically
        const checkPdfStatus = setInterval(async () => {
          try {
            const { data: statusData } = await api.get(`/submissions/${id}`);
            if (statusData.reportUrl) {
              clearInterval(checkPdfStatus);
              clearInterval(progressInterval);

              // Quickly complete the progress to 100%
              setPdfProgress(100);

              // Update submission with the new report URL
              setSubmission(prev => ({ ...prev, reportUrl: statusData.reportUrl }));
              setPdfStatus('completed');

              // Dismiss loading toast and show success
              if (pdfLoadingToastRef.current) {
                toast.dismiss(pdfLoadingToastRef.current);
                pdfLoadingToastRef.current = null;
              }
              toast.success('PDF report has been generated successfully!');

              // Hide success message after 5 seconds
              setTimeout(() => {
                setPdfStatus(null);
              }, 5000);
            }
          } catch (err) {
            console.error('Error checking PDF status:', err);
            clearInterval(checkPdfStatus);
            clearInterval(progressInterval);
            setPdfStatus('error');
            // Dismiss loading toast on error
            if (pdfLoadingToastRef.current) {
              toast.dismiss(pdfLoadingToastRef.current);
              pdfLoadingToastRef.current = null;
            }
            toast.error('Failed to generate PDF report');
          }
        }, 2000);

      } else if (data.pdfStatus === 'requires_more_annotations') {
        toast.error(`Annotations saved! Please add at least ${data.requiredAnnotations} more issue types to generate the PDF report.`, { duration: 5000 });
      } else {
        // Just show success for saving annotations
        toast.success('Annotations saved successfully!');
      }

      // Reset save states after 2 seconds
      setTimeout(() => {
        setSavingStates(prev => ({
          ...prev,
          all: { ...prev.all, isSaved: false },
          upper: { ...prev.upper, isSaved: false },
          front: { ...prev.front, isSaved: false },
          lower: { ...prev.lower, isSaved: false }
        }));
      }, 2000);

      setError(null);
    } catch (err) {
      console.error('Save annotations error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(`Failed to save annotations: ${err.response?.data?.msg || err.message}`);

      // Reset all loading states on error
      setSavingStates({
        upper: { isLoading: false, isSaved: false },
        front: { isLoading: false, isSaved: false },
        lower: { isLoading: false, isSaved: false },
        all: { isLoading: false, isSaved: false }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Validate at least two annotation types
      const usedColors = new Set();
      [upperJson, frontJson, lowerJson].forEach(json => {
        if (json?.objects) {
          json.objects.forEach(obj => {
            if (obj.stroke) usedColors.add(obj.stroke.toUpperCase());
          });
        }
      });
      if (usedColors.size < 2) {
        setError('At least two different issue types are required for PDF generation.');
        return;
      }

      setIsGeneratingPDF(true);
      setPdfStatus('generating');
      setPdfProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setPdfProgress(prev => {
          const newProgress = Math.min(prev + 5, 90); // Cap at 90% until complete
          return newProgress;
        });
      }, 500);

      try {
        const { data } = await api.post(`/submissions/${id}/pdf`);
        clearInterval(progressInterval);
        setPdfProgress(100);
        setSubmission({ ...submission, reportUrl: data.reportUrl, status: 'reported' });
        setPdfStatus('completed');

        // Hide success message after 5 seconds
        setTimeout(() => setPdfStatus(null), 5000);
      } catch (err) {
        clearInterval(progressInterval);
        setPdfStatus('error');
        throw err;
      }
    } catch (err) {
      console.error('Generate PDF error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(`Failed to generate PDF: ${err.response?.data?.msg || err.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleRequestResubmission = async () => {
    if (!resubmissionReason.trim()) {
      setError('Please provide a reason for requesting resubmission');
      return;
    }

    try {
      const { data } = await api.put(`/submissions/${id}/request-resubmission`, {
        resubmissionReason: resubmissionReason.trim()
      });

      setSubmission(data.submission);
      setShowResubmissionModal(false);
      setResubmissionReason('');
      toast.success('Resubmission request sent successfully!');
    } catch (err) {
      console.error('Request resubmission error:', err);
      setError(`Failed to request resubmission: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleReupload = async () => {
    // Validate all images are uploaded
    if (!reuploadImages.upper || !reuploadImages.front || !reuploadImages.lower) {
      setError('Please upload all three images');
      return;
    }

    setIsReuploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('upper', reuploadImages.upper);
      formData.append('front', reuploadImages.front);
      formData.append('lower', reuploadImages.lower);

      const { data } = await api.put(`/submissions/${id}/reupload-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmission(data);
      setShowReuploadForm(false);
      setReuploadImages({ upper: null, front: null, lower: null });
      toast.success('Images uploaded successfully! Your case is now under review.');
    } catch (err) {
      console.error('Reupload error:', err);
      setError(`Failed to upload images: ${err.response?.data?.msg || err.message}`);
    } finally {
      setIsReuploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSendingMessage(true);
    setError(null);

    try {
      const { data } = await api.post(`/submissions/${id}/message`, {
        message: newMessage.trim(),
        sender: role === 'admin' ? 'doctor' : 'patient'
      });

      setSubmission(data);
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
      setError(`Failed to send message: ${err.response?.data?.msg || err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!submission) {
    return (
      <div className="p-8 text-center">
        {error ? (
          <div className="text-red-600">
            <FiAlertTriangle className="mx-auto h-12 w-12" />
            <p>{error}</p>
          </div>
        ) : (
          'Loading...'
        )}
      </div>
    );
  }

  // Admin View
  if (role === 'admin') {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        {/* Header Navigation */}
        <button
          onClick={() => navigate('/admin/patients')}
          className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <FiArrowLeft className="mr-2 w-4 h-4" />
          Back to Patients
        </button>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-surface/50 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-border-color/50 p-6 lg:p-8">
          {/* Page Header with Patient Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 pb-6 border-b border-slate-200 dark:border-border-color/50">
            <div className="flex-1">
              <div className="flex items-center mb-3 gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-text-primary tracking-tight">
                  Case Review: {submission.name}
                </h1>
                <StatusBadge status={submission.status} />
              </div>
              <p className="text-sm text-slate-600 dark:text-text-secondary font-medium">
                Patient ID: <span className="text-slate-900 dark:text-text-primary font-bold">{submission.patientID}</span>
              </p>

              {/* PDF Progress Indicator */}
              {(pdfStatus === 'generating' || pdfStatus === 'completed' || pdfStatus === 'error') && (
                <div className="mt-4 w-full max-w-2xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`font-bold ${pdfStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {pdfStatus === 'generating'
                        ? 'Generating Clinical Report...'
                        : pdfStatus === 'completed'
                          ? 'Report Generated Successfully'
                          : 'Report Generation Failed'}
                    </span>
                    <span className={`font-bold ${pdfStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {pdfProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ease-out ${pdfStatus === 'completed'
                        ? 'bg-emerald-500'
                        : pdfStatus === 'error'
                          ? 'bg-red-500'
                          : 'bg-indigo-600'
                        }`}
                      style={{
                        width: `${pdfProgress}%`,
                        transition: 'width 0.5s ease-out, background-color 0.3s ease'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              {submission.reportUrl && (
                <a
                  href={submission.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FiDownload className="mr-2 w-4 h-4" />
                  Download Report
                </a>
              )}
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Patient Details */}
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-border-color/50">
              <h2 className="text-base font-bold text-slate-900 dark:text-text-primary uppercase tracking-wide mb-4 pb-2 border-b border-slate-200 dark:border-border-color/50">
                Patient Information
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-semibold text-slate-600 dark:text-text-secondary">Full Name:</dt>
                  <dd className="text-sm font-bold text-slate-900 dark:text-text-primary">{submission.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-semibold text-slate-600 dark:text-text-secondary">Patient ID:</dt>
                  <dd className="text-sm font-bold text-slate-900 dark:text-text-primary">{submission.patientID}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-semibold text-slate-600 dark:text-text-secondary">Email Address:</dt>
                  <dd className="text-sm font-medium text-slate-900 dark:text-text-primary">{submission.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-semibold text-slate-600 dark:text-text-secondary">Contact Number:</dt>
                  <dd className="text-sm font-medium text-slate-900 dark:text-text-primary">{submission.phone || 'Not Provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-semibold text-slate-600 dark:text-text-secondary">Submission Date:</dt>
                  <dd className="text-sm font-medium text-slate-900 dark:text-text-primary">{new Date(submission.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                </div>
                {submission.note && (
                  <div className="pt-2 border-t border-slate-200 dark:border-border-color/50">
                    <dt className="text-sm font-semibold text-slate-600 dark:text-text-secondary mb-1">Clinical Notes:</dt>
                    <dd className="text-sm text-slate-700 dark:text-text-primary leading-relaxed">{submission.note}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Original Images Preview */}
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-border-color/50">
              <h2 className="text-base font-bold text-slate-900 dark:text-text-primary uppercase tracking-wide mb-4 pb-2 border-b border-slate-200 dark:border-border-color/50">
                Original Dental Images
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {submission.originalUpperUrl && (
                  <div className="bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-border-color/50 shadow-sm">
                    <img src={submission.originalUpperUrl} alt="Upper Arch" className="w-full h-24 object-cover rounded" />
                    <p className="text-xs text-center font-bold text-slate-700 dark:text-text-secondary mt-2">Upper Arch</p>
                  </div>
                )}
                {submission.originalFrontUrl && (
                  <div className="bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-border-color/50 shadow-sm">
                    <img src={submission.originalFrontUrl} alt="Frontal View" className="w-full h-24 object-cover rounded" />
                    <p className="text-xs text-center font-bold text-slate-700 dark:text-text-secondary mt-2">Frontal View</p>
                  </div>
                )}
                {submission.originalLowerUrl && (
                  <div className="bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-border-color/50 shadow-sm">
                    <img src={submission.originalLowerUrl} alt="Lower Arch" className="w-full h-24 object-cover rounded" />
                    <p className="text-xs text-center font-bold text-slate-700 dark:text-text-secondary mt-2">Lower Arch</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor's Remarks Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800/50">
              <label className="block text-sm font-bold text-slate-900 dark:text-text-primary uppercase tracking-wide mb-3">
                Doctor's Remarks
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Add clinical observations, treatment recommendations, or any specific notes for this case..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                rows="4"
              />
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                These remarks will be included in the generated PDF report.
              </p>
            </div>
          </div>

          {/* Request Resubmission Section */}
          <div className="mb-8">
            {submission.status === 'request_resubmission' ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-lg">
                <div className="flex items-start">
                  <FiClock className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-2">
                      Resubmission Requested - Waiting for Patient
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                      You have requested the patient to submit new images. The patient will be notified and can reupload from their dashboard.
                    </p>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-orange-200 dark:border-orange-800">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Request Reason:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{submission.resubmissionReason}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResubmissionModal(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-semibold rounded-lg text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <FiAlertTriangle className="mr-2 w-4 h-4" />
                Request Resubmission
              </button>
            )}
          </div>

          {/* Resubmission Modal */}
          {showResubmissionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Request Resubmission
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Please provide a reason for requesting new images from the patient:
                </p>
                <textarea
                  value={resubmissionReason}
                  onChange={(e) => setResubmissionReason(e.target.value)}
                  placeholder="e.g., Images are blurry, incorrect angle, missing views..."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 resize-none mb-4"
                  rows="3"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowResubmissionModal(false);
                      setResubmissionReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestResubmission}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Annotation Section */}
          <div className="mb-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-text-primary uppercase tracking-tight mb-1">
                Clinical Annotations
              </h2>
              <p className="text-sm text-slate-600 dark:text-text-secondary">
                Mark and document clinical observations on dental images
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-900 dark:text-text-primary uppercase tracking-wide mb-3 pb-2 border-b-2 border-indigo-500">
                  Upper Arch
                </h3>
                <div className="relative flex-grow">
                  <AnnotationCanvas
                    key={submission.originalUpperUrl}
                    imageUrl={submission.originalUpperUrl}
                    annotations={upperJson}
                    onSave={handleSaveUpper}
                    saveButtonText={
                      savingStates.upper.isLoading
                        ? 'Saving...'
                        : savingStates.upper.isSaved
                          ? 'Saved ✓'
                          : 'Save'
                    }
                    isSaveDisabled={savingStates.upper.isLoading || savingStates.upper.isSaved}
                  />
                </div>
              </div>
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-900 dark:text-text-primary uppercase tracking-wide mb-3 pb-2 border-b-2 border-indigo-500">
                  Frontal View
                </h3>
                <div className="relative flex-grow">
                  <AnnotationCanvas
                    key={submission.originalFrontUrl}
                    imageUrl={submission.originalFrontUrl}
                    annotations={frontJson}
                    onSave={handleSaveFront}
                    saveButtonText={
                      savingStates.front.isLoading
                        ? 'Saving...'
                        : savingStates.front.isSaved
                          ? 'Saved ✓'
                          : 'Save'
                    }
                    isSaveDisabled={savingStates.front.isLoading || savingStates.front.isSaved}
                  />
                </div>
              </div>
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-900 dark:text-text-primary uppercase tracking-wide mb-3 pb-2 border-b-2 border-indigo-500">
                  Lower Arch
                </h3>
                <div className="relative flex-grow">
                  <AnnotationCanvas
                    key={submission.originalLowerUrl}
                    imageUrl={submission.originalLowerUrl}
                    annotations={lowerJson}
                    onSave={handleSaveLower}
                    saveButtonText={
                      savingStates.lower.isLoading
                        ? 'Saving...'
                        : savingStates.lower.isSaved
                          ? 'Saved ✓'
                          : 'Save'
                    }
                    isSaveDisabled={savingStates.lower.isLoading || savingStates.lower.isSaved}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-600 dark:text-red-400 w-5 h-5 mr-3" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-border-color/50 flex flex-wrap gap-4">
            <button
              onClick={handleSaveAll}
              disabled={savingStates.all.isLoading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-md transition-all duration-200 ${savingStates.all.isLoading || savingStates.all.isSaved
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600'
                }`}
            >
              {savingStates.all.isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : savingStates.all.isSaved ? (
                <>
                  <FiCheckCircle className="mr-2 w-5 h-5" />
                  Saved Successfully
                </>
              ) : (
                <>
                  <FiSave className="mr-2 w-5 h-5" />
                  Save All
                </>
              )}
            </button>
            {submission.status === 'annotated' && (
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-md transition-all duration-200 ${isGeneratingPDF
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600'
                  }`}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiDownload className="mr-2 w-5 h-5" />
                    Generate Clinical Report
                  </>
                )}
              </button>
            )}
            {submission.reportUrl && (
              <a
                href={submission.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all duration-200"
              >
                <FiDownload className="mr-2 w-5 h-5" />
                Download Clinical Report
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Patient View (New Design with Dashboard Layout)
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
                  `flex items-center gap-4 px-4 py-3 rounded-lg border-l-2 ${isActive || window.location.pathname.includes('/submission/') ? 'text-slate-900 dark:text-text-primary border-primary dark:border-primary-light bg-slate-100 dark:bg-transparent dark:nav-link-active' : 'border-transparent text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-50 dark:hover:bg-transparent'} ${isActive || window.location.pathname.includes('/submission/') ? 'font-semibold' : 'font-medium'} transition-all duration-300 dark:nav-link`
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
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-transparent">
          <div className="py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="mx-auto max-w-[1600px] space-y-8">
              {/* Header */}
              <header className="flex items-start justify-between gap-4">
                <div className="flex flex-col items-start gap-4">
                  <button
                    onClick={() => navigate('/patient/all-cases')}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Cases
                  </button>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Case Review: {submission.name}
                    </h1>
                    <div className={`inline-flex items-center justify-center gap-x-2 rounded-full px-3 py-1 text-sm font-medium ${submission.status === 'reported' ? 'bg-green-100 text-green-700' :
                      submission.status === 'annotated' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      <span className={`size-2 rounded-full ${submission.status === 'reported' ? 'bg-green-500' :
                        submission.status === 'annotated' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`}></span>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </div>
                  </div>
                  <p className="text-base text-slate-500 dark:text-slate-400">Patient ID: {submission.patientID}</p>
                </div>

                {submission.reportUrl && (
                  <a
                    href={submission.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-5 bg-blue-600 text-white text-base font-semibold leading-normal shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <FiDownload className="text-xl" />
                    <span className="hidden sm:inline">Download Report</span>
                  </a>
                )}
              </header>

              {/* Resubmission Alert */}
              {submission.status === 'request_resubmission' && submission.resubmissionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                        Resubmission Requested
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                        The doctor has requested new images for this case. Please review the reason below and submit new images.
                      </p>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-md border border-red-200 dark:border-red-800">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{submission.resubmissionReason}</p>
                      </div>
                      <button
                        onClick={() => setShowReuploadForm(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Submit New Images
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reupload Form Modal */}
              {showReuploadForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Upload New Images
                      </h3>
                      <button
                        onClick={() => {
                          setShowReuploadForm(false);
                          setReuploadImages({ upper: null, front: null, lower: null });
                          setError(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Please upload all three dental images. Make sure they are clear and well-lit.
                    </p>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Upper Arch */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Upper Arch *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReuploadImages(prev => ({ ...prev, upper: e.target.files[0] }))}
                            className="hidden"
                            id="upper-upload"
                          />
                          <label
                            htmlFor="upper-upload"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50"
                          >
                            {reuploadImages.upper ? (
                              <div className="text-center p-2">
                                <img
                                  src={URL.createObjectURL(reuploadImages.upper)}
                                  alt="Upper preview"
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  {reuploadImages.upper.name}
                                </p>
                              </div>
                            ) : (
                              <>
                                <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Front View */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Front View *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReuploadImages(prev => ({ ...prev, front: e.target.files[0] }))}
                            className="hidden"
                            id="front-upload"
                          />
                          <label
                            htmlFor="front-upload"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50"
                          >
                            {reuploadImages.front ? (
                              <div className="text-center p-2">
                                <img
                                  src={URL.createObjectURL(reuploadImages.front)}
                                  alt="Front preview"
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  {reuploadImages.front.name}
                                </p>
                              </div>
                            ) : (
                              <>
                                <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Lower Arch */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Lower Arch *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReuploadImages(prev => ({ ...prev, lower: e.target.files[0] }))}
                            className="hidden"
                            id="lower-upload"
                          />
                          <label
                            htmlFor="lower-upload"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-700/50"
                          >
                            {reuploadImages.lower ? (
                              <div className="text-center p-2">
                                <img
                                  src={URL.createObjectURL(reuploadImages.lower)}
                                  alt="Lower preview"
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  {reuploadImages.lower.name}
                                </p>
                              </div>
                            ) : (
                              <>
                                <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setShowReuploadForm(false);
                          setReuploadImages({ upper: null, front: null, lower: null });
                          setError(null);
                        }}
                        className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReupload}
                        disabled={isReuploading}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isReuploading ? 'Uploading...' : 'Upload Images'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patient Info */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 shadow-[0_4px_12px_0_rgba(0,0,0,0.05)] dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Patient Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">{submission.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Patient ID</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">{submission.patientID}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">{submission.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Contact Number</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">{submission.phone || 'Not Provided'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submission Date</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                        {new Date(submission.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {submission.note && (
                      <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Clinical Notes</p>
                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mt-1">{submission.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Images */}
                <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 md:p-8 shadow-[0_4px_12px_0_rgba(0,0,0,0.05)] dark:from-slate-800 dark:to-slate-900 dark:border dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Original Uploaded Images</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {submission.originalUpperUrl && (
                      <div className="flex flex-col gap-2">
                        <div className="relative overflow-hidden rounded-lg border border-slate-200/50 shadow-sm">
                          <img className="aspect-[4/3] w-full object-cover" src={submission.originalUpperUrl} alt="Upper Arch" />
                        </div>
                        <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">Upper Arch</p>
                      </div>
                    )}
                    {submission.originalFrontUrl && (
                      <div className="flex flex-col gap-2">
                        <div className="relative overflow-hidden rounded-lg border border-slate-200/50 shadow-sm">
                          <img className="aspect-[4/3] w-full object-cover" src={submission.originalFrontUrl} alt="Frontal View" />
                        </div>
                        <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">Frontal View</p>
                      </div>
                    )}
                    {submission.originalLowerUrl && (
                      <div className="flex flex-col gap-2">
                        <div className="relative overflow-hidden rounded-lg border border-slate-200/50 shadow-sm">
                          <img className="aspect-[4/3] w-full object-cover" src={submission.originalLowerUrl} alt="Lower Arch" />
                        </div>
                        <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">Lower Arch</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Annotated Images Section */}
              {(submission.annotatedUpperUrl || submission.annotatedFrontUrl || submission.annotatedLowerUrl) && (
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-[0_4px_12px_0_rgba(0,0,0,0.05)] p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Final Clinical Results (Annotated Images)</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submission.annotatedUpperUrl && (
                      <div className="flex flex-col gap-3">
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                          <img className="aspect-video w-full object-cover" src={submission.annotatedUpperUrl} alt="Annotated Upper" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 text-center">Upper Arch (Annotated)</p>
                      </div>
                    )}
                    {submission.annotatedFrontUrl && (
                      <div className="flex flex-col gap-3">
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                          <img className="aspect-video w-full object-cover" src={submission.annotatedFrontUrl} alt="Annotated Frontal" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 text-center">Frontal View (Annotated)</p>
                      </div>
                    )}
                    {submission.annotatedLowerUrl && (
                      <div className="flex flex-col gap-3">
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                          <img className="aspect-video w-full object-cover" src={submission.annotatedLowerUrl} alt="Annotated Lower" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 text-center">Lower Arch (Annotated)</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Footer */}
              {submission.reportUrl && (
                <footer className="flex justify-center pt-8 pb-4">
                  <a
                    href={submission.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-[300px] cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg h-14 px-8 bg-blue-600 text-white text-lg font-bold leading-normal shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <FiDownload className="text-2xl" />
                    <span>Download Clinical Report</span>
                  </a>
                </footer>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Material Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    </div>
  );
};

export default SubmissionDetail;