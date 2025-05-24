import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Home,
  List,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Award
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LessonListService, LessonListItem } from "../../services/lessonService";
import { SupervisorService, Supervisor } from "../../services/supervisorService";

// Define the context type from MainLayout
type MainLayoutContext = {
  isLoggedIn: boolean;
  user: { username: string; avatar?: string } | null;
};

const LessonList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useOutletContext<MainLayoutContext>();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn && !hasShownAlert) {
      setHasShownAlert(true);
      window.alert("Bạn chưa đăng nhập, vui lòng đăng nhập để tiếp tục!");
      navigate('/');
    }
  }, [isLoggedIn, navigate, hasShownAlert]);

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

  useEffect(() => {
    const fetchLessons = async () => {
      if (!supervisor?.id) {
        console.log('No supervisor ID available, skipping fetch');
        return;
      }
      
      try {
        setIsLoading(true);
        const lessonService = LessonListService.getInstance();
        console.log('Fetching lessons for supervisorId:', supervisor.id);
        const lessonData = await lessonService.getLessonList(supervisor.id, selectedStatus);
        console.log('Fetched lessons:', lessonData);
        setLessons(lessonData);
        setError(null);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu bài học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [selectedStatus, supervisor?.id]);

  // Hàm tìm kiếm bài học
  const searchLessons = (query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      const searchResults = lessons.filter(lesson => {
        const searchLower = query.toLowerCase();
        return (
          lesson.title.toLowerCase().includes(searchLower) ||
          lesson.device.toLowerCase().includes(searchLower) ||
          lesson.date.toLowerCase().includes(searchLower) ||
          lesson.status.toLowerCase().includes(searchLower)
        );
      });
      setFilteredLessons(searchResults);
    }, 300); // Debounce 300ms

    setSearchTimeout(timeout);
  };

  const [filteredLessons, setFilteredLessons] = useState<LessonListItem[]>([]);

  // Cập nhật filteredLessons khi lessons thay đổi
  useEffect(() => {
    setFilteredLessons(lessons);
  }, [lessons]);

  // Xử lý thay đổi search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchLessons(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDetailClick = (lessonId: number) => {
    navigate(`/report-detail/${lessonId}`);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi status
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Content Container */}
      <div className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-12 py-3">            <div className="flex items-center text-sm text-gray-600">
            <Home size={16} className="mr-2 text-primary-color" />
            <button onClick={() => navigate('/')} className="hover:text-primary-color transition-colors duration-200 border-none bg-transparent cursor-pointer text-gray-600 p-0">Trang chủ</button>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="font-medium text-primary-color">Danh sách buổi học</span>
          </div>
          </div>
        </div>

        {/* Banner */}
        <div className="container mx-auto px-12 py-6">
          <div className="w-full h-40 md:h-48 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-blue-500 bg-opacity-20 rounded-full"></div>
              <div className="absolute -right-4 top-1/4 transform -translate-y-1/2 w-40 h-40 bg-blue-400 bg-opacity-20 rounded-full"></div>
              <div className="absolute right-1/4 bottom-0 w-24 h-24 bg-blue-300 bg-opacity-20 rounded-full"></div>
            </div>

            <div className="relative h-full flex items-center">
              <div className="px-8 md:px-12 py-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">Danh Sách Buổi Học</h1>
                <p className="text-blue-100 max-w-xl">Theo dõi và quản lý các buổi học của học sinh trên hệ thống VRA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="container mx-auto px-12 pb-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            {/* Header controls */}
            <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <List className="mr-2 text-primary-color" size={20} />
                  Danh Sách Buổi Học
                  <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Hiển thị {lessons.length} buổi học
                  </span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các buổi học đã diễn ra</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bài học, thiết bị, ngày hoặc trạng thái..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color transition-colors duration-200"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
                <div className="relative">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="pl-4 pr-10 py-2 w-full border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color transition-colors duration-200"
                  >
                    <option value="all">Tất cả</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="in_progress">Đang tiến hành</option>
                    <option value="assigned">Mới</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                        <List className="h-3 w-3 text-blue-600 mr-2" />
                        ID
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                        <Clock className="h-3 w-3 text-blue-600 mr-2" />
                        ID Thiết bị
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                        <Calendar className="h-3 w-3 text-blue-600 mr-2" />
                        Thời gian
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                        <BookOpen className="h-3 w-3 text-blue-600 mr-2" />
                        Bài học
                      </div>
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                        <Award className="h-3 w-3 text-blue-600 mr-2" />
                        Trạng thái
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color"></div>
                          <span className="ml-2">Đang tải dữ liệu...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : filteredLessons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        {searchQuery ? 'Không tìm thấy bài học phù hợp với từ khóa tìm kiếm' : 'Không có bài học nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredLessons.map((lesson, index) => (
                      <tr
                        key={lesson.id}
                        className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => handleDetailClick(lesson.id)}
                      >
                        <td className="px-6 py-4 text-base text-gray-700 font-medium text-center">{lesson.id}</td>
                        <td className="px-6 py-4 text-base text-center">
                          <span className="font-medium text-blue-600">{lesson.device}</span>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-700 text-center">
                          {lesson.date}
                        </td>
                        <td className="px-6 py-4 text-base font-medium text-blue-700 text-center">
                          {lesson.title}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusClass(lesson.status)}`}>
                            {lesson.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Trước
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Sau
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">10</span> trong số <span className="font-medium">97</span> kết quả
                  </p>
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Trang đầu</span>
                    <ChevronsLeft className="h-5 w-5" />
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Trang trước</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[1, 2, 3, 4, 5].map(page => (
                    <button
                      key={page}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                          ? "z-10 bg-primary-color border-primary-color text-white"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Trang sau</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Trang cuối</span>
                    <ChevronsRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </main>      </div>
    </div>
  );
}

export default LessonList;