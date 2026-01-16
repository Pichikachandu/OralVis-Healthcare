import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth'; // added import

// Add the material-symbols-outlined styles
const useMaterialIcons = () => {
  useEffect(() => {
    // Only add the style if it doesn't exist
    if (!document.getElementById('material-icons-style')) {
      const style = document.createElement('style');
      style.id = 'material-icons-style';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        
        .input-wrapper {
          transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .input-wrapper:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.2), 0 4px 12px rgba(67, 56, 202, 0.1);
        }
        
        .input-wrapper:focus-within .input-icon {
          color: #4338ca;
          transform: scale(1.1);
        }
        
        .input-icon {
          transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
};

// Create a wrapper component to use the hook
const MaterialIcon = ({ icon, className = '' }) => {
  useMaterialIcons();
  return <span className={`material-symbols-outlined ${className}`}>{icon}</span>;
};

const FileUpload = ({ name, label, value, onChange, className = '' }) => {
  const fileInputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      onChange({ target: { name, files: [file] } });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onChange({ target: { name, files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`group/upload relative flex flex-col items-center justify-center rounded-xl border-2 ${value
        ? 'border-solid border-green-500/50 bg-green-500/10'
        : `border-dashed ${isDragging
          ? 'border-indigo-300 bg-white'
          : 'border-gray-300 bg-gray-50/50'
        }`
        } p-6 text-center transition-all duration-300 ease-out-expo hover:border-indigo-400 hover:bg-white cursor-pointer hover:-translate-y-1 hover:shadow-lg`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        name={name}
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img
              src={URL.createObjectURL(value)}
              alt="Uploaded preview"
              className="absolute inset-0 h-full w-full object-cover opacity-10 group-hover/upload:opacity-30 group-hover/upload:scale-110 transition-all duration-300"
            />
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500/20 mb-2 transition-transform duration-300 group-hover/upload:scale-110">
                <MaterialIcon
                  icon="check_circle"
                  className="text-2xl text-green-600"
                />
              </div>
              <p className="mt-1 text-sm font-semibold text-gray-900">{label}</p>
              <p className="mt-1 text-xs text-green-600">{value.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ target: { name, files: [] } });
                }}
                className="mt-2 text-xs text-indigo-600 hover:underline font-medium transition-transform duration-200 active:scale-95"
              >
                Replace
              </button>
            </div>
          </>
        ) : (
          <>
            <MaterialIcon
              icon="cloud_upload"
              className="text-4xl text-gray-400 group-hover/upload:text-indigo-600 transition-all duration-300 ease-out-expo group-hover/upload:scale-110 group-hover/upload:-translate-y-1"
            />
            <p className="mt-2 text-sm font-semibold text-gray-900">{label}</p>
            <p className="mt-1 text-xs text-gray-500">Drag & drop or click</p>
          </>
        )}
      </div>
    </div>
  );
};

const InputField = ({ icon, name, type = 'text', placeholder, value, onChange, required = false, readOnly = false, className = '' }) => {
  const inputId = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="group/input w-full">
      <label className="text-sm font-medium text-gray-700" htmlFor={inputId}>
        {placeholder} {required && <span className="text-pink-500/80">*</span>}
      </label>
      <div className={`relative mt-2 flex items-center w-full rounded-xl border border-gray-300 bg-white input-wrapper ${className}`}>
        <div className="pointer-events-none absolute left-0 flex items-center pl-4 text-gray-500 text-xl input-icon">
          <MaterialIcon icon={icon} />
        </div>
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-12 placeholder-gray-500 pl-12 pr-4 text-base font-normal bg-transparent focus:outline-none border-0 focus:ring-0 text-gray-900 ${readOnly ? 'cursor-not-allowed text-gray-500' : ''}`}
          required={required}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

const UploadForm = ({ onUpload, onCancel }) => {
  const { user } = useAuth(); // get logged-in user
  const [formData, setFormData] = useState({
    title: '',
    name: user?.name || '',
    patientID: localStorage.getItem('patientID') || '',
    email: user?.email || '',
    phone: '',
    note: '',
    upper: null,
    front: null,
    lower: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = {
    upper: useRef(),
    front: useRef(),
    lower: useRef()
  };

  // Populate name and email from AuthContext when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      name: user?.name || '',
      patientID: localStorage.getItem('patientID') || '',
      email: user?.email || '',
      phone: '',
      note: '',
      upper: null,
      front: null,
      lower: null,
    });
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredFields = ['title', 'name', 'patientID', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    const requiredFiles = ['upper', 'front', 'lower'];
    const missingFiles = requiredFiles.filter(file => !formData[file]);
    if (missingFiles.length > 0) {
      toast.error(`Please upload all three required images: ${missingFiles.join(', ')}`);
      return;
    }
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      const response = await axios.post('http://localhost:5000/api/submissions', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        timeout: 30000,
        withCredentials: true
      });
      if (response.status >= 200 && response.status < 300) {
        if (onUpload) await onUpload(response.data);
        toast.success('Case submitted successfully!');
        resetForm();
      } else {
        throw new Error(response.data?.message || 'Failed to submit form');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.msg || error.message || 'Failed to submit form. Please try again.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gray-50">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl animate-subtle-bob [animation-delay:-2s]"></div>
        <div className="absolute -right-16 top-1/4 h-64 w-64 rounded-full bg-pink-500/30 blur-3xl animate-subtle-bob [animation-delay:-4s]"></div>
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl animate-subtle-bob"></div>
      </div>

      <div className="group relative z-10 grid w-full max-w-7xl grid-cols-1 @5xl:grid-cols-12 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="relative hidden @5xl:flex flex-col justify-between p-12 bg-gray-900 @5xl:col-span-5">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out-expo group-hover:scale-110 opacity-40 group-hover:opacity-60" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDpoIg-kSkGkn50A8BWhQlTMz_jDaMf0CIbjiyCiiYvSPPpwa2_MEs-Ti_1VUx6p1MNhzcysMK_CXBLzYms_1-AMCUhco4JTtd0ERvk3FKyB8PtCw9qIvoJf0_WNkUdAhC9LmoqrOfeZeFkf2weBK2MVYwmCWUgJJb1y_7m6b1qb9bjyDE0NC8h0BSH0kiCEM5O-N3fshvwKZN3MU-SwU-KeanqCAt4bNdjSHIFDRlQz959fmY0ounzZ9P4FpNWpGY8PGs4Q9KI0Yc)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-secondary/40 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight flex items-center gap-3">
              <MaterialIcon icon="hub" className="text-5xl text-indigo-300" />
              <span>OralVis AI</span>
            </h2>
            <p className="mt-2 text-lg text-white/80 max-w-sm">Pioneering the future of dental diagnostics with unparalleled clarity.</p>
          </div>
          <div className="relative z-10 text-white/70 text-sm">
            <p className="border-l-2 border-indigo-400 pl-4">"The most advanced platform for case submission and analysis. Secure, intuitive, and built for professionals who demand excellence."</p>
            <p className="mt-4 font-semibold">— Dr. Amelia Thorne, Chief Dental Officer</p>
          </div>
        </div>

        <div className="w-full @5xl:col-span-7 p-6 sm:p-10 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-[-0.03em]">New Case Submission</h1>
              <p className="mt-2 text-base text-gray-600">Please provide patient details and upload clear photos for analysis.</p>
            </div>

            <div className="mb-6">
              <InputField
                name="title"
                type="text"
                placeholder="Case Title"
                value={formData.title}
                onChange={handleChange}
                required
                icon="title"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold leading-tight text-gray-900 mb-4 border-b border-gray-200 pb-3">Patient Information</h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <InputField
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  icon="person"
                  readOnly={true}
                />
                <InputField
                  name="patientID"
                  type="text"
                  placeholder="Patient ID"
                  value={formData.patientID}
                  onChange={handleChange}
                  required
                  icon="badge"
                  readOnly={true}
                />
                <InputField
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon="mail"
                  readOnly={true}
                />
                <InputField
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  icon="phone_iphone"
                />
              </div>
            </div>

            <div className="group/input">
              <label className="text-sm font-medium text-subtext-light dark:text-subtext-dark">Additional Notes</label>
              <div className="relative mt-2 flex w-full rounded-xl border border-gray-300 bg-white input-wrapper">
                <div className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-4 text-gray-500 text-xl input-icon">
                  <MaterialIcon icon="edit_note" />
                </div>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Any specific concerns or information for the analysis..."
                  className="flex w-full resize-none min-h-32 placeholder-gray-500 py-3 pl-12 pr-4 text-base font-normal bg-transparent focus:outline-none border-0 focus:ring-0 text-gray-900"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold leading-tight text-gray-900 mb-4 border-b border-gray-200 pb-3">Dental Photos <span className="text-pink-500/80">*</span></h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FileUpload
                  name="upper"
                  label="Upper Arch"
                  value={formData.upper}
                  onChange={handleChange}
                />
                <FileUpload
                  name="front"
                  label="Bite View"
                  value={formData.front}
                  onChange={handleChange}
                />
                <FileUpload
                  name="lower"
                  label="Lower Arch"
                  value={formData.lower}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto rounded-lg px-6 py-3 text-base font-medium text-gray-700 bg-transparent hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group/btn relative w-full sm:w-auto rounded-lg px-8 py-3 text-base font-semibold text-white transition-all duration-300 overflow-hidden disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 bg-[length:200%_auto] hover:bg-[position:100%_0] active:scale-95 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? 'Submitting...' : 'Submit Case'}
                  <MaterialIcon
                    icon="arrow_forward"
                    className="ml-2 group-hover/btn:translate-x-1.5 transition-transform duration-300"
                  />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;