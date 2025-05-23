import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import MainLayout from "./layouts/MainLayout";
import { HomePage, VRALessonList, VRADetailReport } from "./pages";
import PersonalInfoPage from "./pages/Profile/PersonalInfoPage";

/**
 * Main application component with routing configuration
 * Using nested routes with MainLayout as the parent layout
 */
function App() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic đăng ký ở đây
    console.log('Form submitted:', formData);
  };

  return (
    <Router>
      <Routes>
        {/* Main Layout contains consistent header and footer */}
        <Route element={<MainLayout />}>
          {/* Child routes rendered within MainLayout */}
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson-list" element={<VRALessonList />} />
          <Route path="/report-detail" element={<VRADetailReport />} />
          <Route path="/profile" element={<PersonalInfoPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
