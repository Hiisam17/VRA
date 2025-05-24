import React, { useState, useEffect } from 'react';
import { Avatar, Input, Select, DatePicker, Form, message, Upload, Modal } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { ProfileService, DetailedChildProfile } from '../services/profileService';
import { SupervisorService } from '../services/supervisorService';
import { useOutletContext } from 'react-router-dom';

const { Option } = Select;

interface PersonalInfoProps {
  studentData?: DetailedChildProfile;
  supervisorId?: string;
}

// Define the context type from MainLayout
type MainLayoutContext = {
  isLoggedIn: boolean;
  user: { username: string; avatar?: string } | null;
};

const PersonalInfo: React.FC<PersonalInfoProps> = ({ studentData: initialStudentData, supervisorId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState<DetailedChildProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [supervisor, setSupervisor] = useState<any>(null);
  const { user } = useOutletContext<MainLayoutContext>();

  // Fetch supervisor data when user is available
  useEffect(() => {
    const fetchSupervisor = async () => {
      if (!user?.username) return;
      
      try {
        console.log('Fetching supervisor for email:', user.username);
        const supervisorService = SupervisorService.getInstance();
        const supervisorData = await supervisorService.getSupervisorByEmail(user.username);
        console.log('Fetched supervisor data:', supervisorData);
        setSupervisor(supervisorData);
      } catch (err) {
        console.error('Error fetching supervisor:', err);
      }
    };

    fetchSupervisor();
  }, [user?.username]);

  // Load data when component mounts or supervisorId changes
  useEffect(() => {
    const loadData = async () => {
      if (!supervisorId) return;

      try {
        setLoading(true);
        const profileService = ProfileService.getInstance();
        const profiles = await profileService.getDetailedChildProfiles(supervisorId);
        
        if (profiles.length > 0) {
          console.log('Loaded profile data:', profiles[0]);
          const formattedData = {
            ...profiles[0],
            dateOfBirth: profiles[0].dateOfBirth ? dayjs(profiles[0].dateOfBirth) : dayjs(),
            guardianName: profiles[0].guardianName,
            guardianPhone: profiles[0].guardianPhone,
            guardianEmail: profiles[0].guardianEmail,
            relationship: profiles[0].relationship
          };
          console.log('Formatted data for form:', formattedData);
          setCurrentData(formattedData);
          form.setFieldsValue(formattedData);
          // Set avatar URL from database
          if (formattedData.avatar) {
            setAvatarUrl(formattedData.avatar);
          }
        }
      } catch (error) {
        console.error('Error loading student data:', error);
        message.error('Có lỗi xảy ra khi tải thông tin học sinh!');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supervisorId, form]);

  // Set initial form values when initialStudentData changes
  useEffect(() => {
    if (initialStudentData) {
      console.log('Setting initial student data:', initialStudentData);
      const formattedData = {
        ...initialStudentData,
        dateOfBirth: initialStudentData.dateOfBirth ? dayjs(initialStudentData.dateOfBirth) : dayjs(),
        guardianName: initialStudentData.guardianName,
        guardianPhone: initialStudentData.guardianPhone,
        guardianEmail: initialStudentData.guardianEmail,
        relationship: initialStudentData.relationship
      };
      console.log('Formatted initial data for form:', formattedData);
      setCurrentData(formattedData);
      form.setFieldsValue(formattedData);
      // Set avatar URL from initial data
      if (initialStudentData.avatar) {
        setAvatarUrl(initialStudentData.avatar);
      }
    }
  }, [initialStudentData, form]);

  const handleSubmit = async (values: any) => {
    try {
      console.log('Bắt đầu xử lý submit form với giá trị:', values);
      console.log('Supervisor ID:', supervisor?.id);
      if (!supervisor?.id) {
        console.error('Không có supervisorId');
        message.error('Không thể cập nhật thông tin: Thiếu ID người giám hộ');
        return;
      }

      setLoading(true);
      const profileService = ProfileService.getInstance();
      const supervisorService = SupervisorService.getInstance();
      
      // Format the data for submission
      const formattedValues = {
        ...values,
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        avatar: avatarUrl || currentData?.avatar
      };
      console.log('Dữ liệu đã được format:', formattedValues);

      // Update child profile
      console.log('Gọi API cập nhật profile với supervisorId:', supervisor.id);
      const updatedData = await profileService.updateProfile(formattedValues, supervisor.id);
      console.log('Nhận được dữ liệu cập nhật từ server:', updatedData);

      // Update supervisor information
      const supervisorUpdateData = {
        name: values.guardianName,
        email: values.guardianEmail,
        phone_numbers: values.guardianPhone,
        relationship: values.relationship
      };
      await supervisorService.updateSupervisor(supervisor.id, supervisorUpdateData);
      
      setCurrentData({
        ...updatedData,
        dateOfBirth: dayjs(updatedData.dateOfBirth)
      });
      console.log('Đã cập nhật state currentData');
      
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Chi tiết lỗi khi cập nhật thông tin:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setLoading(false);
      console.log('Đã hoàn thành quá trình cập nhật');
    }
  };

  const showConfirmAndSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận cập nhật',
      content: 'Bạn có chắc chắn muốn cập nhật thông tin cá nhân?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        form.submit();
      }
    });
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể upload file JPG/PNG!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // TODO: Implement image upload to Supabase storage
      const imageUrl = URL.createObjectURL(info.file.originFileObj as Blob);
      setAvatarUrl(imageUrl);
      setLoading(false);
      message.success('Upload ảnh thành công!');
    }
  };

  return (
    <div>
      {/* Title is already in parent component */}
      <Form
        form={form}
        layout="vertical"
        initialValues={currentData || {
          fullName: '',
          avatar: '',
          age: 0,
          dateOfBirth: null,
          gender: '',
          language: '',
          guardianName: '',
          guardianPhone: '',
          guardianEmail: '',
          relationship: '',
          supervisorName: '',
          supervisorEmail: '',
          supervisorPhone: ''
        }}
        className="personal-form"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <Avatar
            size={150}
            src={avatarUrl || currentData?.avatar}
            icon={<UserOutlined />}
            className="avatar-glow mb-4"
            onError={() => {
              // If image fails to load, show default icon
              setAvatarUrl('');
              return true;
            }}
          />
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess?.("ok");
              }, 0);
            }}
          >
            <button
              type="button"
              className="flex items-center justify-center px-3 py-1 bg-black bg-opacity-25 rounded-md border border-white border-opacity-20 hover:bg-opacity-40 transition-all duration-300 text-sm avatar-upload-btn"
            >
              <UploadOutlined className="mr-1" />
              Thay đổi ảnh
            </button>
          </Upload>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            className="flex-1"
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" style={{ height: '42px' }} />
          </Form.Item>
          
          <Form.Item
            label="Tuổi"
            name="age"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
            className="flex-1"
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tuổi" style={{ height: '42px' }} />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
            className="flex-1"
          >
            <DatePicker className="w-full" placeholder="Chọn ngày sinh" style={{ height: '42px' }} />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            className="flex-1"
          >
            <Select placeholder="Chọn giới tính" style={{ height: '42px' }}>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngôn ngữ"
            name="language"
            rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
            className="md:col-span-2"
            style={{ marginTop: '8px' }}
          >
            <Select placeholder="Chọn ngôn ngữ">
              <Option value="vietnamese">Tiếng Việt</Option>
              <Option value="english">Tiếng Anh</Option>
              <Option value="chinese">Tiếng Trung</Option>
            </Select>
          </Form.Item>
        </div>
        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl font-semibold mb-6">Thông tin người giám hộ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label="Tên người giám hộ"
              name="guardianName"
              rules={[{ required: true, message: 'Vui lòng nhập tên người giám hộ' }]}
              className="flex-1"
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên người giám hộ" style={{ height: '42px' }} />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="guardianPhone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
              className="flex-1"
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" style={{ height: '42px' }} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="guardianEmail"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
              className="flex-1"
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" style={{ height: '42px' }} />
            </Form.Item>

            <Form.Item
              label="Mối quan hệ"
              name="relationship"
              rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ' }]}
              className="flex-1"
            >
              <Select placeholder="Chọn mối quan hệ" style={{ height: '42px' }}>
                <Option value="parent">Cha/Mẹ</Option>
                <Option value="grandparent">Ông/Bà</Option>
                <Option value="sibling">Anh/Chị</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 w-auto min-w-[200px] text-white font-medium rounded-md hover:bg-opacity-90 transition-all duration-300"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default PersonalInfo; 