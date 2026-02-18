import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BookOpen, ArrowRight, Mail, Lock, User, GraduationCap, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    qualifications: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register-reviewer', formData);
      setSuccess('Registration successful! Please wait for admin approval.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-medium">
            <ArrowRight size={16} className="rotate-180" /> Back to Home
          </Link>
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-primary">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600">Join our panel of expert reviewers.</p>
        </div>

        {success ? (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Registration Successful!</h3>
            <p className="text-slate-600 text-sm">Your application has been submitted. Please wait for admin approval before logging in.</p>
            <Button className="w-full mt-4 h-11 text-base bg-slate-900 hover:bg-primary text-white" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                    required
                    placeholder="Dr. John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                    required
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications & Expertise</Label>
                <div className="relative group">
                  <GraduationCap className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <Input
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                    required
                    placeholder="PhD in CS, Machine Learning Expert..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-[5px]"
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                  {error}
                </div>
              )}

              <Button className="w-full h-12 text-base shadow-md hover:shadow-lg transition-all bg-slate-900 hover:bg-primary text-white" type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Register as Reviewer <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline transition-all">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
