import React, { useState } from "react";
import { Menu, X, User, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChangePasswordModal from "../Auth/ChangePasswordModal";

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <User className="h-5 w-5" />,
      label: "Thông tin cá nhân",
      onClick: () => {
        navigate("/profile");
      },
    },    {
      icon: <Lock className="h-5 w-5" />,
      label: "Đổi mật khẩu",
      onClick: () => {
        setShowChangePasswordModal(true);
        setIsOpen(false); // Đóng menu khi mở modal
      },
    },
    {
      icon: <LogOut className="h-5 w-5" />,
      label: "Đăng xuất",
      onClick: onLogout,
    },
  ];
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-primary-color/10 transition-all duration-300 hover:shadow-md"
      >
        <Menu className="h-[26px] w-[26px] text-primary-color" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ 
                duration: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] py-2 z-50 border border-gray-100 overflow-hidden"
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: {
                      delay: index * 0.1
                    }
                  }}
                  whileHover={{ 
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    x: 5
                  }}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 flex items-center gap-3 transition-colors duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="text-primary-color"
                  >
                    {item.icon}
                  </motion.div>
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

export default UserMenu;
