import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Shield, Send, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface AdminAuthProps {
  onBack: () => void;
  onAuthenticated: () => void;
  apiBase: string;
  authToken: string;
}

export function AdminAuth({ onBack, onAuthenticated, apiBase, authToken }: AdminAuthProps) {
  const [step, setStep] = useState<'login' | 'otp' | 'forgot-password' | 'reset-otp' | 'new-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setSessionId(data.sessionId);
      setStep('otp');
      toast.success('OTP sent! Check your email (or server logs if email is not configured)');
    } catch (error: any) {
      console.error('Error during login:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/admin/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ sessionId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      toast.success('Admin verification successful!');
      onAuthenticated();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSessionId(data.sessionId);
      setStep('reset-otp');
      toast.success('OTP sent! Check your email (or server logs if email is not configured)');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async () => {
    if (otp.length !== 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/admin/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ sessionId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setStep('new-password');
      toast.success('OTP verified! Please set a new password');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Please enter new password and confirm password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ sessionId, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('Password reset successful!');
      setStep('login');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-[#2d2d2d] rounded-xl p-8 border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="bg-[#2d8659]/20 p-4 rounded-full">
              <Shield className="w-12 h-12 text-[#2d8659]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-400 text-center mb-8">
            {step === 'login' ? 'Secure administrator access' : 'Two-factor authentication'}
          </p>

          {step === 'login' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-email" className="text-gray-300 text-sm mb-2 block">
                  Admin Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="admin-password" className="text-gray-300 text-sm mb-2 block">
                  Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('forgot-password')}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Login with 2FA
                  </>
                )}
              </Button>
            </div>
          ) : step === 'otp' ? (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#2d8659] mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      OTP sent to your email
                    </p>
                    <p className="text-gray-400 text-xs">
                      Please check your inbox and enter the 4-digit code below
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      💡 If email isn't configured yet, check the Supabase Function logs for your OTP
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="admin-otp" className="text-gray-300 text-sm mb-2 block">
                  Enter OTP Code
                </Label>
                <Input
                  id="admin-otp"
                  type="text"
                  placeholder="0000"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otp.length === 4) {
                      handleVerifyOTP();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 4}
                className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Access Dashboard'
                )}
              </Button>
              <button
                onClick={() => {
                  setStep('login');
                  setOtp('');
                }}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back to login
              </button>
            </div>
          ) : step === 'forgot-password' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-gray-300 text-sm mb-2 block">
                  Admin Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                  autoComplete="email"
                />
              </div>
              <Button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <button
                onClick={() => setStep('login')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back to login
              </button>
            </div>
          ) : step === 'reset-otp' ? (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#2d8659] mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      OTP sent to your email
                    </p>
                    <p className="text-gray-400 text-xs">
                      Please check your inbox and enter the 4-digit code below
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      💡 If email isn't configured yet, check the Supabase Function logs for your OTP
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="reset-otp" className="text-gray-300 text-sm mb-2 block">
                  Enter OTP Code
                </Label>
                <Input
                  id="reset-otp"
                  type="text"
                  placeholder="0000"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otp.length === 4) {
                      handleVerifyResetOTP();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleVerifyResetOTP}
                disabled={loading || otp.length !== 4}
                className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <button
                onClick={() => {
                  setStep('login');
                  setOtp('');
                }}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back to login
              </button>
            </div>
          ) : step === 'new-password' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password" className="text-gray-300 text-sm mb-2 block">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-gray-300 text-sm mb-2 block">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                  autoComplete="new-password"
                />
              </div>
              <Button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
              <button
                onClick={() => setStep('login')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back to login
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-xs text-center">
            🔒 This is a secure area. All login attempts are monitored.
          </p>
        </div>
      </div>
    </div>
  );
}