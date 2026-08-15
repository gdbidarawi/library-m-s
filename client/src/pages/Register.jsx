import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
  registrationNumber: Yup.string().required('Registration number is required'),
  department: Yup.string().required('Department is required'),
  phone: Yup.string(),
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      registrationNumber: '',
      department: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await register(values);
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <h2>Create Student Account</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" name="name" value={formik.values.name} onChange={formik.handleChange} />
            {formik.touched.name && formik.errors.name && <div className="error-text">{formik.errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" name="email" value={formik.values.email} onChange={formik.handleChange} />
            {formik.touched.email && formik.errors.email && <div className="error-text">{formik.errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" name="password" value={formik.values.password} onChange={formik.handleChange} />
            {formik.touched.password && formik.errors.password && <div className="error-text">{formik.errors.password}</div>}
          </div>
          <div className="form-group">
            <label>Registration Number</label>
            <input className="form-control" name="registrationNumber" value={formik.values.registrationNumber} onChange={formik.handleChange} />
            {formik.touched.registrationNumber && formik.errors.registrationNumber && (
              <div className="error-text">{formik.errors.registrationNumber}</div>
            )}
          </div>
          <div className="form-group">
            <label>Department</label>
            <input className="form-control" name="department" value={formik.values.department} onChange={formik.handleChange} />
            {formik.touched.department && formik.errors.department && (
              <div className="error-text">{formik.errors.department}</div>
            )}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" name="phone" value={formik.values.phone} onChange={formik.handleChange} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
