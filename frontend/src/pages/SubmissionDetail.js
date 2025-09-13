import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiDownload, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';
import AnnotationCanvas from '../components/AnnotationCanvas';
import api from '../services/api';

const StatusBadge = ({ status }) => {
  const statusMap = {
    uploaded: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="w-4 h-4 mr-1" /> },
    annotated: { color: 'bg-purple-100 text-purple-800', icon: <FiCheckCircle className="w-4 h-4 mr-1" /> },
    reported: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="w-4 h-4 mr-1" /> },
    default: { color: 'bg-gray-100 text-gray-800', icon: null },
  };
  
  const { color, icon } = statusMap[status] || statusMap.default;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
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
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data } = await api.get(`/submissions/${id}`);
        setSubmission(data);
        setUpperJson(data.upperAnnotations || null);
        setFrontJson(data.frontAnnotations || null);
        setLowerJson(data.lowerAnnotations || null);
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
            
            // Show success message after a short delay
            setTimeout(() => {
              alert('PDF report has been generated successfully!');
            }, 100);
            
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
              
              // Show success message after a short delay
              setTimeout(() => {
                alert('PDF report has been generated successfully!');
              }, 100);
              
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
          }
        }, 2000);
        
        // Show generating message after a short delay to ensure UI updates
        setTimeout(() => {
          alert('Annotations saved! Generating PDF report...');
        }, 100);
        
      } else if (data.pdfStatus === 'requires_more_annotations') {
        setTimeout(() => {
          alert(`Annotations saved! Please add at least ${data.requiredAnnotations} more issue types to generate the PDF report.`);
        }, 100);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(role === 'admin' ? '/admin' : '/patient')}
          className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Submission for {submission.name} (ID: {submission.patientID})
              </h2>
              {(pdfStatus === 'generating' || pdfStatus === 'completed' || pdfStatus === 'error') && (
                <div className="mt-4 w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${
                      pdfStatus === 'error' ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {pdfStatus === 'generating' 
                        ? 'Generating PDF report...' 
                        : pdfStatus === 'completed' 
                          ? 'PDF generated successfully!' 
                          : 'Error generating PDF'}
                    </span>
                    <span className={`font-medium ${
                      pdfStatus === 'error' ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {pdfProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                        pdfStatus === 'completed' 
                          ? 'bg-green-500' 
                          : pdfStatus === 'error'
                            ? 'bg-red-500'
                            : 'bg-blue-600'
                      }`}
                      style={{ 
                        width: `${pdfProgress}%`,
                        transition: 'width 0.5s ease-out, background-color 0.3s ease'
                      }}
                    ></div>
                  </div>
                  {pdfStatus === 'error' && (
                    <p className="mt-1 text-sm text-red-600">
                      Failed to generate PDF. Please try again.
                    </p>
                  )}
                </div>
              )}
              {pdfStatus === 'completed' && submission.reportUrl && (
                <div className="mt-2 text-green-600">
                  <span>PDF report generated successfully!</span>
                </div>
              )}
              {pdfStatus === 'error' && (
                <div className="mt-2 text-red-600">
                  <span>Error generating PDF. Please try again.</span>
                </div>
              )}
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              {submission.reportUrl && (
                <a
                  href={submission.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
                >
                  <FiDownload className="mr-2" />
                  Download Report
                </a>
              )}
              <StatusBadge status={submission.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient Details</h3>
              <p><strong>Name:</strong> {submission.name}</p>
              <p><strong>Patient ID:</strong> {submission.patientID}</p>
              <p><strong>Email:</strong> {submission.email}</p>
              <p><strong>Phone:</strong> {submission.phone || 'N/A'}</p>
              <p><strong>Upload Date:</strong> {new Date(submission.uploadDate).toLocaleString()}</p>
              {submission.note && <p><strong>Note:</strong> {submission.note}</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Original Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {submission.originalUpperUrl && (
                  <div>
                    <img src={submission.originalUpperUrl} alt="Upper Teeth" className="w-full h-32 object-contain rounded" />
                    <p className="text-sm text-center text-gray-600 mt-1">Upper Teeth</p>
                  </div>
                )}
                {submission.originalFrontUrl && (
                  <div>
                    <img src={submission.originalFrontUrl} alt="Front Teeth" className="w-full h-32 object-contain rounded" />
                    <p className="text-sm text-center text-gray-600 mt-1">Front Teeth</p>
                  </div>
                )}
                {submission.originalLowerUrl && (
                  <div>
                    <img src={submission.originalLowerUrl} alt="Lower Teeth" className="w-full h-32 object-contain rounded" />
                    <p className="text-sm text-center text-gray-600 mt-1">Lower Teeth</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {role === 'admin' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Annotate Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Upper Teeth</h4>
                  <div className="relative">
                    <AnnotationCanvas
                      imageUrl={submission.originalUpperUrl}
                      annotations={upperJson}
                      onSave={handleSaveUpper}
                      saveButtonText={
                        savingStates.upper.isLoading 
                          ? 'Saving...' 
                          : savingStates.upper.isSaved 
                            ? 'Saved!' 
                            : 'Save Annotations'
                      }
                      isSaveDisabled={savingStates.upper.isLoading || savingStates.upper.isSaved}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Front Teeth</h4>
                  <div className="relative">
                    <AnnotationCanvas
                      imageUrl={submission.originalFrontUrl}
                      annotations={frontJson}
                      onSave={handleSaveFront}
                      saveButtonText={
                        savingStates.front.isLoading 
                          ? 'Saving...' 
                          : savingStates.front.isSaved 
                            ? 'Saved!' 
                            : 'Save Annotations'
                      }
                      isSaveDisabled={savingStates.front.isLoading || savingStates.front.isSaved}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Lower Teeth</h4>
                  <div className="relative">
                    <AnnotationCanvas
                      imageUrl={submission.originalLowerUrl}
                      annotations={lowerJson}
                      onSave={handleSaveLower}
                      saveButtonText={
                        savingStates.lower.isLoading 
                          ? 'Saving...' 
                          : savingStates.lower.isSaved 
                            ? 'Saved!' 
                            : 'Save Annotations'
                      }
                      isSaveDisabled={savingStates.lower.isLoading || savingStates.lower.isSaved}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {role !== 'admin' && (submission.upperAnnotatedUrl || submission.frontAnnotatedUrl || submission.lowerAnnotatedUrl) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Annotated Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {submission.upperAnnotatedUrl && (
                  <div>
                    <img src={submission.upperAnnotatedUrl} alt="Annotated Upper" className="w-full h-32 object-contain rounded" />
                    <p className="text-sm text-center text-gray-600 mt-1">Annotated Upper</p>
                  </div>
                )}
                {submission.frontAnnotatedUrl && (
                  <div>
                    <img src={submission.frontAnnotatedUrl} alt="Annotated Front" className="w-full h-32 object-contain rounded" />
                    <p className="text-sm text-center text-gray-600 mt-1">Annotated Front</p>
                  </div>
                )}
                {submission.lowerAnnotatedUrl && (
                  <div>
                    <img src={submission.lowerAnnotatedUrl} alt="Annotated Lower" className="w-full h-32 object-contain rounded" />
                    <p className="text-sm text-center text-gray-600 mt-1">Annotated Lower</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 text-red-600">
              <FiAlertTriangle className="inline mr-2" />
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            {role === 'admin' && (
              <>
                <button
                  onClick={handleSaveAll}
                  disabled={savingStates.all.isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${savingStates.all.isLoading || savingStates.all.isSaved ? 'opacity-75' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                >
                  {savingStates.all.isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : savingStates.all.isSaved ? (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save All Annotations
                    </>
                  )}
                </button>
                {submission.status === 'annotated' && (
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isGeneratingPDF ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiDownload className="mr-2" />
                        Generate PDF Report
                      </>
                    )}
                  </button>
                )}
              </>
            )}
            {submission.reportUrl && (
              <a
                href={submission.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FiDownload className="mr-2" />
                Download Report
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;