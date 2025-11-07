import React, { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import './FacultyForm.css';

const FacultyForm = ({ faculty = null, onSubmit, onCancel }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: faculty?.name || '',
    email: faculty?.email || '',
    phone: faculty?.phone || '',
    department: faculty?.department || '',
    designation: faculty?.designation || '',
    qualification: faculty?.qualification || '',
    experience: faculty?.experience || '',
    specialization: faculty?.specialization || '',
    joiningDate: faculty?.joiningDate || '',
    salary: faculty?.salary || '',
    address: faculty?.address || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Delegate API call to parent (ManageFaculty)
      await onSubmit?.(formData);
      showNotification(faculty ? 'Faculty updated successfully' : 'Faculty added successfully', 'success');
    } catch (error) {
      showNotification(error?.userMessage || 'Failed to save faculty', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="faculty-form-overlay">
      <div className="faculty-form-container">
        <div className="faculty-form-header">
          <h2>{faculty ? 'Edit Faculty' : 'Add New Faculty'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="faculty-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={errors.department ? 'error' : ''}
              >
                <option value="">Select Department</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Arts">Arts</option>
                <option value="Music">Music</option>
                <option value="Library">Library</option>
                <option value="Administration">Administration</option>
                
              </select>
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="designation">Designation *</label>
              <select
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={errors.designation ? 'error' : ''}
              >
                <option value="">Select Designation</option>
                <option value="Principal">Principal</option>
                <option value="Vice Principal">Vice Principal</option>
                <option value="Head Teacher">Head Teacher</option>
                <option value="Senior Teacher">Senior Teacher</option>
                <option value="Teacher">Teacher</option>
                <option value="Assistant Teacher">Assistant Teacher</option>
               
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Librarian">Librarian</option>
                <option value="Sports Teacher">Sports Teacher</option>
                <option value="Music Teacher">Music Teacher</option>
                <option value="Art Teacher">Art Teacher</option>
                <option value="Computer Teacher">Computer Teacher</option>
                <option value="Counselor">Counselor</option>
              </select>
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="qualification">Qualification</label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., M.Sc, B.Ed, Ph.D"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience">Experience (Years)</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                placeholder="Years of experience"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="joiningDate">Joining Date</label>
              <input
                type="date"
                id="joiningDate"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Area of specialization"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                placeholder="Monthly salary"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter complete address"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (faculty ? 'Update Faculty' : 'Add Faculty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyForm;