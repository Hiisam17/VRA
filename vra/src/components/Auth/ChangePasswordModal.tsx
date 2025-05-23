import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, Lock, KeyRound } from 'lucide-react';
import { message, Tooltip } from 'antd';
import AnimatedButton from '../lib-animated/Button';
import { apiConfig } from '../../api/config';
import './ChangePasswordModal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Hàm đánh giá độ mạnh mật khẩu
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  return score;
}

function getStrengthLabel(score: number) {
  if (score <= 2) return { label: 'Yếu', color: '#ef4444' };
  if (score <= 4) return { label: 'Trung bình', color: '#f59e42' };
  if (score <= 5) return { label: 'Mạnh', color: '#22c55e' };
  return { label: 'Rất mạnh', color: '#2563eb' };
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const resetForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      currentPassword: !passwordData.currentPassword 
        ? 'Vui lòng nhập mật khẩu hiện tại' : '',
      newPassword: !passwordData.newPassword 
        ? 'Vui lòng nhập mật khẩu mới' 
        : passwordData.newPassword.length < 6 
        ? 'Mật khẩu mới phải có ít nhất 6 ký tự' 
        : passwordData.newPassword === passwordData.currentPassword
        ? 'Mật khẩu mới phải khác mật khẩu hiện tại'
        : '',
      confirmPassword: !passwordData.confirmPassword 
        ? 'Vui lòng xác nhận mật khẩu mới'
        : passwordData.confirmPassword !== passwordData.newPassword
        ? 'Mật khẩu xác nhận không khớp'
        : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };
  const handleSubmit = async () => {
  console.log('handleSubmit called');
    console.log('passwordData:', passwordData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, starting API call');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token ? 'exists' : 'not found');
      
      if (!token) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const apiUrl = `${apiConfig.baseURL}/auth/change-password`;
      console.log('API URL:', apiUrl);      // Send request to change password
      console.log("Token being used:", token);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',  // Include cookies
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        message.success('Đổi mật khẩu thành công! Đang đăng xuất...');
        // Gọi API logout để xóa session phía server
        const token = localStorage.getItem('access_token');
        if (token) {
          fetch(`${apiConfig.baseURL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
        }
        // Xóa token và thông tin đăng nhập phía client
        localStorage.removeItem('access_token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        resetForm();
        onClose();
        window.location.href = '/';
      } else {
        message.error(data.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error) {
      console.error('Change password error:', error);
      message.error('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="change-password-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="change-password-modal-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="change-password-modal-content"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 8px 40px 0 rgba(80, 112, 255, 0.13), 0 1.5px 8px 0 rgba(0,0,0,0.08)',
              padding: '2.5rem 2rem 2rem 2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6">
              {/* Icon minh họa phía trên tiêu đề */}
              <div className="flex flex-col items-center mb-6 pt-2">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mb-4 shadow-md">
                  <KeyRound className="h-10 w-10 text-primary-color" />
                </div>
                <h2 className="text-gray-900 text-3xl font-extrabold mb-1 text-center tracking-tight">
                  Đổi mật khẩu
                </h2>
                <p className="text-gray-600 text-base text-center max-w-xs mx-auto">
                  Cập nhật mật khẩu để bảo mật tài khoản của bạn
                </p>
              </div>

              <div className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className={`flex items-center border-2 ${errors.currentPassword ? 'border-red-500 animate-shake' : 'border-gray-200'} rounded-xl px-4 py-3 focus-within:border-primary-color transition-all duration-300 bg-white/80`}>                <Lock className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      placeholder="Nhập mật khẩu hiện tại"
                      value={passwordData.currentPassword}
                      onChange={handleInputChange}
                      className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none text-base px-1"
                    />
                    <Tooltip title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} placement="top">
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                  {errors.currentPassword && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-red-500 text-xs font-medium">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#ef4444" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
                      </span>
                      <p className="text-red-500 text-xs font-medium">{errors.currentPassword}</p>
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className={`flex items-center border-2 ${errors.newPassword ? 'border-red-500 animate-shake' : 'border-gray-200'} rounded-xl px-4 py-3 focus-within:border-primary-color transition-all duration-300 bg-white/80`}>                <KeyRound className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      placeholder="Nhập mật khẩu mới"
                      value={passwordData.newPassword}
                      onChange={handleInputChange}
                      className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none text-base px-1"
                    />
                    <Tooltip title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} placement="top">
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                  <PasswordStrengthBar password={passwordData.newPassword} />
                  {errors.newPassword && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-red-500 text-xs font-medium">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#ef4444" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
                      </span>
                      <p className="text-red-500 text-xs font-medium">{errors.newPassword}</p>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className={`flex items-center border-2 ${errors.confirmPassword ? 'border-red-500 animate-shake' : 'border-gray-200'} rounded-xl px-4 py-3 focus-within:border-primary-color transition-all duration-300 bg-white/80`}>                <KeyRound className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu mới"
                      value={passwordData.confirmPassword}
                      onChange={handleInputChange}
                      className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none text-base px-1"
                    />
                    <Tooltip title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} placement="top">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-red-500 text-xs font-medium">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#ef4444" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
                      </span>
                      <p className="text-red-500 text-xs font-medium">{errors.confirmPassword}</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <AnimatedButton
                    icon={KeyRound}
                    text="Đổi mật khẩu"
                    size="full"
                    withFullWidth={true}
                    primary
                    isLoading={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.03] transition-transform duration-300 text-center justify-center shadow-lg shadow-blue-100/40 border-0"
                    style={{ fontWeight: 600, fontSize: 18, letterSpacing: 0.5 }}
                    onClick={handleSubmit}
                  />
                </div>

                {/* Cancel Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.08, color: '#ef4444', backgroundColor: '#fef2f2' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleClose}
                    className="w-full py-3 text-gray-600 hover:text-red-500 transition-colors duration-300 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                    style={{ fontWeight: 500, fontSize: 16, letterSpacing: 0.2 }}
                  >
                    Hủy
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// Thanh đánh giá độ mạnh mật khẩu
const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const score = getPasswordStrength(password);
  const { label, color } = getStrengthLabel(score);
  const percent = Math.min((score / 6) * 100, 100);
  return (
    <div style={{ marginTop: 8, marginBottom: 2 }}>
      <div style={{ height: 8, borderRadius: 6, background: '#e5e7eb', width: '100%' }}>
        <div
          style={{
            width: `${percent}%`,
            height: 8,
            borderRadius: 6,
            background: color,
            transition: 'width 0.3s, background 0.3s',
          }}
        />
      </div>
      {password && (
        <span style={{ fontSize: 13, color, fontWeight: 500, marginLeft: 2 }}>{label}</span>
      )}
    </div>
  );
};

export default ChangePasswordModal;
