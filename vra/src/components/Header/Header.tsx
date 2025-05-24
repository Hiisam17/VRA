import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, KeyRoundIcon } from "lucide-react";
import { Logo1 } from "../../assets/images";
import UserMenu from "../Navigation/UserMenu";
import AnimatedButton from "../lib-animated/Button";

interface HeaderProps {
  scrollToLoginForm: () => void;
  setShowRegisterForm: (show: boolean) => void;
  isLoggedIn?: boolean;
  user?: {
    username: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  scrollToLoginForm,
  setShowRegisterForm,
  isLoggedIn = false,
  user,
  onLogout
}) => {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  // Helper function to check active routes
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/lesson-list' && location.pathname === '/lesson-list') return true;
    if (path === '/report-detail' && location.pathname === '/report-detail') return true;
    return false;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header Navigation */}
      <div className={`fixed top-0 left-0 right-0 z-50 header ${isHeaderScrolled ? 'header-scrolled' : ''}`}>
        <div className="flex items-center w-full px-6 lg:px-16 justify-between animate-fadeIn">
          <div className="flex items-center space-x-8">
            <img
              src={Logo1}
              alt="VRA Logo"
              className="logo transition-transform duration-300 hover:scale-105"
            />
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`nav-link font-semibold rounded transition-all duration-300 ${isActive('/')
                    ? 'text-primary-color border-b-2 border-primary-color'
                    : 'text-gray-800 hover:text-primary-light'
                  }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/lesson-list"
                className={`nav-link font-semibold rounded transition-all duration-300 ${isActive('/lesson-list')
                    ? 'text-primary-color border-b-2 border-primary-color'
                    : 'text-gray-800 hover:text-primary-light'
                  }`}
              >
                Danh sách học sinh
              </Link>
              <button
                className={`nav-link font-semibold rounded transition-all duration-300 ${location.pathname.includes('config')
                    ? 'text-primary-color border-b-2 border-primary-color'
                    : 'text-gray-800 hover:text-primary-light'
                  }`}
              >
                Quản lý cấu hình
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <button
                  className="btn text-primary-color font-semibold px-4 py-1.5 rounded-full transition-all duration-300"
                  onClick={scrollToLoginForm}
                >
                  Đăng nhập
                </button>
                <AnimatedButton
                  icon={KeyRoundIcon}
                  text="Đăng ký"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setShowRegisterForm(true)}
                />
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-primary-color/10 py-2 rounded-full">
                  <span className="text-primary-color font-medium text-[16.8px]">{user?.username}</span>
                </div>
                <UserMenu onLogout={onLogout || (() => { })} />
              </div>
            )}
          </div>
          <button
            className="md:hidden text-gray-800 p-2"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="mobile-menu absolute top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-xl transform transition-transform duration-300"
            style={{ transform: 'translateX(0)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b">
              <img src={Logo1} alt="VRA Logo" className="h-8" />
              <button onClick={() => setShowMobileMenu(false)}>
                <X className="h-6 w-6 text-gray-800" />
              </button>
            </div>
            <div className="flex flex-col p-5 space-y-4">
              <Link
                to="/"
                className={`text-lg py-2 border-b border-gray-100 ${isActive('/')
                    ? 'text-primary-color font-bold'
                    : 'text-gray-800 font-semibold'
                  }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/lesson-list"
                className={`text-lg py-2 border-b border-gray-100 ${isActive('/lesson-list')
                    ? 'text-primary-color font-bold'
                    : 'text-gray-800 font-semibold'
                  }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Danh sách học sinh
              </Link>
              <button
                className={`text-lg py-2 border-b border-gray-100 text-left ${location.pathname.includes('config')
                    ? 'text-primary-color font-bold'
                    : 'text-gray-800 font-semibold'
                  }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Quản lý cấu hình
              </button>
              <div className="pt-4 flex flex-col space-y-3">
                {!isLoggedIn ? (
                  <>
                    <button
                      className="bg-white text-primary-color border-2 border-primary-color font-bold w-full py-2.5 rounded-full"
                      onClick={() => {
                        scrollToLoginForm();
                        setShowMobileMenu(false);
                      }}
                    >
                      Đăng nhập
                    </button>
                    <button
                      className="bg-primary-color text-white font-bold w-full py-2.5 rounded-full"
                      onClick={() => {
                        setShowRegisterForm(true);
                        setShowMobileMenu(false);
                      }}
                    >
                      Đăng ký
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-2 bg-primary-color/10 px-4 py-2 rounded-full">
                      <div className="h-8 w-8 rounded-full bg-primary-color flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-primary-color font-medium">{user?.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setShowMobileMenu(false);
                      }}
                      className="bg-white text-primary-color border-2 border-primary-color font-bold w-full py-2.5 rounded-full flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 