import { useState, useRef } from 'react';
import { FiUpload, FiUser, FiHash, FiMail, FiPhone, FiFileText, FiImage } from 'react-icons/fi';
import api from '../services/api';

const FileUpload = ({ name, label, onChange, required = false }) => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(e);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        onClick={() => fileInputRef.current.click()}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
      >
        <div className="space-y-1 text-center">
          <FiImage className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <p className="pl-1">
              {fileName || (
                <span>
                  Click to upload or drag and drop<br />
                  <span className="text-xs text-gray-500">JPG, PNG up to 5MB</span>
                </span>
              )}
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          onChange={handleFileChange}
          accept="image/*"
          className="sr-only"
          required={required}
        />
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, name, type = 'text', placeholder, onChange, required = false }) => (
  <div className="mb-4">
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        name={name}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
        required={required}
      />
    </div>
  </div>
);

const UploadForm = ({ onUpload, onCancel }) => {
  const fileInputRefs = {
    upper: useRef(),
    front: useRef(),
    lower: useRef()
  };
  const [formData, setFormData] = useState({
    name: '',
    patientID: '',
    email: '',
    phone: '',
    note: '',
    upper: null,
    front: null,
    lower: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      patientID: '',
      email: '',
      phone: '',
      note: '',
      upper: null,
      front: null,
      lower: null,
    });
    // Reset file input references if needed
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    
    try {
      const res = await api.post('/submissions', data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      onUpload(res.data);
      resetForm();
      if (onCancel) onCancel();
    } catch (err) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Submit New Case</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload clear photos of your teeth for professional analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              icon={FiUser}
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              value={formData.name}
              required
            />
            <InputField
              icon={FiHash}
              name="patientID"
              placeholder="Patient ID"
              onChange={handleChange}
              value={formData.patientID}
              required
            />
            <InputField
              icon={FiMail}
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              value={formData.email}
              required
            />
            <InputField
              icon={FiPhone}
              name="phone"
              type="tel"
              placeholder="Phone Number"
              onChange={handleChange}
              value={formData.phone}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <div className="mt-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3">
                  <FiFileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="note"
                  rows={3}
                  onChange={handleChange}
                  value={formData.note}
                  placeholder="Any specific concerns or additional information..."
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border border-gray-300 rounded-md p-2.5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Upload Teeth Photos</h3>
            <p className="text-sm text-gray-500">
              Please upload clear photos of your teeth from the following angles. Ensure good lighting and focus.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileUpload 
                name="upper" 
                label="Upper Teeth" 
                onChange={handleChange} 
                required 
              />
              <FileUpload 
                name="front" 
                label="Front Teeth" 
                onChange={handleChange} 
                required 
              />
              <FileUpload 
                name="lower" 
                label="Lower Teeth" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <FiUpload className="mr-2 h-4 w-4" />
                    Submit Case
                  </>
                )}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              )}
            </div>
            <p className="text-center text-xs text-gray-500">
              Your information is secure and will only be used for dental analysis purposes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;