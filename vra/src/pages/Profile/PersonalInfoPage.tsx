import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import PersonalInfo from '../../components/PersonalInfo';
import dayjs from 'dayjs';
import './PersonalInfoPage.css';
import { ProfileService, DetailedChildProfile } from '../../services/profileService';
import { SupervisorService } from '../../services/supervisorService';

interface MainLayoutContext {
  isLoggedIn: boolean;
  user: { username: string; email: string; avatar?: string } | null;
}

const PersonalInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<DetailedChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState<any>(null);
  const { isLoggedIn, user } = useOutletContext<MainLayoutContext>();

  //Fetch supervisor data when user is available
  useEffect(() => {   
    const fetchSupervisor = async () => {
      if (!user?.email) return;
      
      try {
        console.log('Fetching supervisor for email:', user.email);
        const supervisorService = SupervisorService.getInstance();
        const supervisorData = await supervisorService.getSupervisorByEmail(user.email);
        console.log('Fetched supervisor data:', supervisorData);
        setSupervisor(supervisorData);
      } catch (err) {
        console.error('Error fetching supervisor:', err);
      }
    };

    fetchSupervisor();
  }, [user?.email]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!supervisor?.id) {
        console.log('No supervisor ID available, skipping fetch');
        return;
      }

      try {
        setLoading(true);
        const profileService = ProfileService.getInstance();
        console.log('Fetching child profiles for supervisorId:', supervisor.id);
        const profiles = await profileService.getDetailedChildProfiles(supervisor.id);
        console.log('Fetched child profiles:', profiles);
        
        if (profiles.length > 0) {
          setStudentData(profiles[0]);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [supervisor?.id]);

  return (
    <div className="personal-info-container">
      <div className="personal-info-form">
        <h2>Thông tin cá nhân</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <PersonalInfo studentData={studentData || {
            fullName: '',
            avatar: '',
            age: 0,
            dateOfBirth: dayjs(),
            gender: '',
            language: '',
            guardianName: supervisor?.name || '',
            guardianPhone: '',
            guardianEmail: supervisor?.email || '',
            relationship: ''
          }} />
        )}
      </div>
    </div>
  );
};

export default PersonalInfoPage; 
