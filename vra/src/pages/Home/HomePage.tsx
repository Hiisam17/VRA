import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  CheckCircle,
  Star,
  User,
  User2,
  Key,
  LogIn,
  ArrowRight,
  ArrowLeft,
  Rotate3dIcon,
  NotebookText,
  BookAIcon,
} from "lucide-react";
import {
  anh1,
  anh2,
  anh3,
  doctor,
  AI,
  googleLogo,
  doctor4,
  doctor1,
  doctor3,
} from "../../assets/images";
import RegisterForm, {
  RegisterFormData,
} from "../../components/Auth/RegisterForm";
import { apiConfig } from "../../api/config";
import RotatingText from "../../components/lib-animated/RoatingText";
import { CardBody, CardContainer, CardItem } from "../../components/lib-animated/3d-card";
import Stack from "../../components/lib-animated/CardRotate";
import AnimatedButton from "../../components/lib-animated/Button";
import { LensDemo } from "./components/Lens";
import { SupervisorService } from "../../services/supervisorService";
import { ProfileService, ChildLearningStats } from "../../services/profileService";

// Define the context type from MainLayout
type MainLayoutContext = {
  showRegisterForm: boolean;
  setShowRegisterForm: (show: boolean) => void;
  scrollToTop: () => void;
  scrollToLoginForm: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: { username: string; email: string; avatar?: string } | null;
  setUser: (user: { username: string; email: string; avatar?: string } | null) => void;
};

// Add Child type
type ChildType = {
  name: string;
  age: number;
  avatar?: string;
  sessionsCompleted: number;
  averageScore: number;
  totalStudyTime: number;
};

const HomePage: React.FC = () => {
  // Get context from MainLayout
  const {
    showRegisterForm,
    setShowRegisterForm,
    scrollToTop,
    scrollToLoginForm,
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
  } = useOutletContext<MainLayoutContext>();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [supervisor, setSupervisor] = useState<any>(null);
  const [childStats, setChildStats] = useState<ChildLearningStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const testimonials = [
    {
      quote:
        "Nhờ hệ thống VRA mà tình trạng của con tôi ngày càng tiến triển tốt đẹp hơn. Tôi tin rằng đội ngũ y bác sĩ đã luôn cố gắng hết mình trong việc chăm sóc và điều trị.",
      name: "Dang Quang",
      role: "Phụ huynh",
      gender: "male",
    },
    {
      quote:
        "Sau khi hoàn thành liệu trình điều trị, con trai tôi đã có thể giao tiếp với thê giới bên ngoài. VRA quả là một hệ thống tuyệt vời.",
      name: "Dương Nguyễn",
      role: "Phụ huynh",
      gender: "male",
    },
    {
      quote:
        "Trong quá trình điều trị, tôi luôn có thể theo dõi chi tiết quá trình điều trị của con nhỏ. Đội ngũ y bác sĩ cũng tư vấn rất nhiệt tình và tận tâm.",
      name: "Dung Trần",
      role: "Phụ huynh",
      gender: "female",
    },
    {
      quote:
        "Con tôi rất thích các bài học tương tác trên VRA. Các hoạt động vừa học vừa chơi giúp bé hứng thú và tiếp thu tốt hơn.",
      name: "Minh Anh",
      role: "Phụ huynh",
      gender: "female",
    },
    {
      quote:
        "Tôi đánh giá cao tính năng theo dõi tiến độ học tập. Giúp tôi nắm rõ được sự phát triển của con mỗi ngày.",
      name: "Hoàng Nam",
      role: "Phụ huynh",
      gender: "male",
    },
    {
      quote:
        "Đội ngũ hỗ trợ rất nhiệt tình, luôn sẵn sàng giải đáp thắc mắc và tư vấn kịp thời cho phụ huynh chúng tôi.",
      name: "Thảo Nguyên",
      role: "Phụ huynh",
      gender: "female",
    },
    {
      quote:
        "Các bài học được thiết kế rất khoa học, phù hợp với từng độ tuổi và khả năng của trẻ. Con tôi tiến bộ rõ rệt sau 3 tháng.",
      name: "Văn Hùng",
      role: "Phụ huynh",
      gender: "male",
    },
    {
      quote:
        "Giao diện thân thiện, dễ sử dụng. Tôi có thể dễ dàng theo dõi và hỗ trợ con học tập tại nhà.",
      name: "Hương Giang",
      role: "Phụ huynh",
      gender: "female",
    },
    {
      quote:
        "Các hoạt động tương tác giúp con tôi tự tin hơn trong giao tiếp và hòa nhập tốt hơn với môi trường xung quanh.",
      name: "Quốc Bảo",
      role: "Phụ huynh",
      gender: "male",
    },
    {
      quote:
        "Tôi rất ấn tượng với cách VRA áp dụng công nghệ AI để cá nhân hóa bài học cho từng trẻ. Con tôi học tập hiệu quả hơn nhiều.",
      name: "Mai Linh",
      role: "Phụ huynh",
      gender: "female",
    },
    {
      quote:
        "Các báo cáo chi tiết về tiến độ học tập giúp tôi và giáo viên có thể điều chỉnh phương pháp dạy phù hợp với con.",
      name: "Đức Minh",
      role: "Phụ huynh",
      gender: "male",
    },
    {
      quote:
        "Con tôi rất thích các bài học qua hình ảnh và video. Cách tiếp cận này giúp bé dễ dàng tiếp thu và ghi nhớ kiến thức.",
      name: "Thanh Hà",
      role: "Phụ huynh",
      gender: "female",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 3) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Scroll animation with Intersection Observer
  useEffect(() => {
    const animatedElements = document.querySelectorAll("[data-aos]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-animate");
          } else {
            entry.target.classList.remove("aos-animate");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    animatedElements.forEach((element) => {
      observer.observe(element);

      // Set initial animation type from data-aos attribute
      const animationType = element.getAttribute("data-aos");
      if (animationType === "fade-up") {
        element.classList.add("animate-on-scroll-fade-up");
      } else if (animationType === "fade-right") {
        element.classList.add("animate-on-scroll-fade-right");
      } else if (animationType === "fade-left") {
        element.classList.add("animate-on-scroll-fade-left");
      }
    });

    return () => {
      animatedElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  // Add smooth scrolling to anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');

      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute("href");

        if (targetId) {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            const headerHeight =
              document.querySelector(".header")?.clientHeight || 80;
            const targetTop =
              targetElement.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
              top: targetTop - headerHeight - 20,
              behavior: "smooth",
            });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          avatar_url: data.avatar_url,
        }),
      });      const result = await res.json();
      if (res.ok) {
        setUser({
          username: data.name,
          email: data.email,
          avatar: data.avatar_url,
        });
        setIsLoggedIn(true);
        setShowRegisterForm(false);
      } else {
        // Xử lý các loại thông báo lỗi khác nhau từ server
        if (result.errors && Array.isArray(result.errors)) {
          // Hiển thị lỗi validation từ express-validator
          const errorMessages = result.errors.map((err: { msg: any; }) => err.msg).join('\n');
          alert(errorMessages);
        } else if (result.message) {
          // Hiển thị message từ server
          alert(result.message);
        } else if (result.error) {
          // Hiển thị error từ server
          alert(result.error);
        } else {
          alert("Đăng ký thất bại! Vui lòng thử lại.");
        }
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi đăng ký!");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin đăng nhập!");
      return;
    }
    setIsLoggingIn(true);
    try {
      console.log(
        "Sending login request to:",
        `${apiConfig.baseURL}/auth/login`
      );
      const res = await fetch(`${apiConfig.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      console.log("Login response status:", res.status);
      const data = await res.json();
      console.log("Login response data:", data);

      if (res.ok) {
        const userData = {
          username: data.user?.username || email,
          email: data.user?.email || email,
          avatar: data.user?.avatar_url,
        };
        
        setIsLoggedIn(true);
        setUser(userData);
        
        // Lưu thông tin vào localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("access_token", data.token);

        setEmail("");
        setPassword("");
      } else {
        alert(data.message || "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Có lỗi xảy ra khi đăng nhập!");
    }
    setIsLoggingIn(false);
  };

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
    const fetchChildStats = async () => {
      if (!supervisor?.id) return;
      
      try {
        setIsLoadingStats(true);
        const profileService = ProfileService.getInstance();
        const stats = await profileService.getChildLearningStats(supervisor.id);
        if (stats && stats.length > 0) {
          setChildStats(stats[0]);
        }
      } catch (error) {
        console.error('Error fetching child stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchChildStats();
  }, [supervisor?.id]);

  // Add mock child data
  const childData: ChildType = {
    name: "Nguyễn Văn A",
    age: 8,
    sessionsCompleted: 12,
    averageScore: 8.5,
    totalStudyTime: 24,
  };

  return (
    <div className="flex flex-col items-start bg-white relative">
      <div className="w-full main-content">
        {/* Hero Section */}
        <section className="hero-section w-full flex items-center justify-center overflow-hidden relative bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full py-8 md:py-12 z-99">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
              <div className="w-full md:w-1/2 pt-4 animate-slideUp">
                <div className="mb-8 md:mb-12">
                  <h1 className="text-white font-bold text-4xl md:text-5xl lg:text-6xl mb-3 hero-text leading-tight">
                    Nền tảng học tập
                    <span className="block mt-2">cho em trẻ mắc chứng</span>
                    {/* <span style={{ color: "#50EDD1" }}>tự kỷ</span> */}
                    <RotatingText
                      texts={['tự kỷ', 'chậm nói', 'chậm nhận thức', 'chậm phản xạ']}
                      mainClassName="px-2 sm:px-2.5 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 flex justify-center rounded-lg mt-4 leading-[65px]"
                      staggerFrom={"last"}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-120%", opacity: 0 }}
                      staggerDuration={0.020}
                      splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1 flex justify-center"
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 400,
                        duration: 0.5
                      }}
                      rotationInterval={3000}
                    />
                  </h1>

                </div>

                <div
                  className="flex flex-col space-y-3 mb-10"
                  data-aos="stagger"
                >
                  {[
                    "Tự tin giao tiếp",
                    "Khơi dậy đam mê khám phá",
                    "Quản lý dễ dàng, chăm sóc tận tâm",
                    "Ứng dụng công nghệ, nâng cao chất lượng",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center bg-blue-950 bg-opacity-70 px-5 py-3 rounded-lg transform transition-all duration-500 hover:scale-105 hover:bg-opacity-90"
                    >
                      <CheckCircle className="text-white mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-white text-base">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  {/* <button
                    onClick={scrollToLoginForm}
                    className="btn btn-primary text-white font-bold px-6 py-3 rounded-full flex items-center shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                  >
                    Bắt đầu ngay
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </button> */}
                  <AnimatedButton
                    icon={ArrowRight}
                    text="Bắt đầu ngay"
                    size="md"
                    className="bg-[linear-gradient(135deg,_var(--primary-color),_var(--primary-light))] px-8"
                    onClick={scrollToLoginForm}
                  />
                  <a
                    href="#features"
                    className="btn text-white border-2 border-white font-bold px-6 py-3 rounded-full transition-all duration-500"
                  >
                    Tìm hiểu thêm
                  </a>
                </div>
              </div>

              {/* Right side content */}
              <div className="w-full md:w-5/12 mt-8 md:mt-0">
                {isLoggedIn ? (
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0px 0px 25px rgba(100, 180, 255, 0.5)" 
                    }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="h-16 w-16 rounded-full bg-primary-color flex items-center justify-center shadow-lg"
                      >
                        <User className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <motion.h3
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                          className="text-white text-xl font-bold"
                        >
                          {user?.username}
                        </motion.h3>
                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                          className="text-blue-100"
                        >
                          Phụ huynh của {childStats?.childName}
                        </motion.p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="bg-white/5 p-4 rounded-xl mb-6 shadow-md"
                    >
                      <h4 className="text-white font-semibold mb-3">
                        Thông tin học sinh
                      </h4>
                      <div className="flex items-center gap-4">
                        {isLoadingStats ? (
                          <div className="text-white">Đang tải...</div>
                        ) : childStats ? (
                          <>
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0.5 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.4 }}
                              className="h-12 w-12 rounded-full bg-accent-color flex items-center justify-center shadow-md"
                            >
                              <User className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                              <motion.h5
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                                className="text-white font-medium"
                              >
                                {childStats.childName}
                              </motion.h5>
                              <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                                className="text-blue-100"
                              >
                                {childStats.age} tuổi
                              </motion.p>
                            </div>
                          </>
                        ) : (
                          <div className="text-white">Chưa có thông tin học sinh</div>
                        )}
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {[
                        {
                          title: "Buổi học đã tham gia",
                          value: isLoadingStats ? "..." : childStats?.totalSessions || 0,
                          delay: 0.7
                        },
                        {
                          title: "Điểm trung bình học tập",
                          value: isLoadingStats ? "..." : childStats?.averageScore.toFixed(1) || 0,
                          delay: 0.8
                        },
                        {
                          title: "Tổng thời gian học",
                          value: isLoadingStats ? "..." : `${childStats?.totalLearningTimeHours.toFixed(1) || 0}h`,
                          delay: 0.9
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: item.delay, duration: 0.4 }}
                          className="bg-white/5 p-4 rounded-xl shadow-md hover:bg-white/10 transition-colors"
                        >
                          <h4 className="text-white font-semibold mb-2">
                            {item.title}
                          </h4>
                          <p className="text-2xl text-white font-bold">
                            {item.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.4 }}
                      className="flex justify-end"
                    >
                      <AnimatedButton
                        icon={BookAIcon}
                        text="Xem chi tiết"
                        size="md"
                        className="bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.7)]"
                        onClick={() => alert("Chức năng đang được phát triển")}
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <div
                    id="login-form"
                    className="hero-login-container animate-slideInRight"
                  >
                    <div className="bg-white/10 backdrop-blur-lg p-2 md:p-3 rounded-3xl shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
                      <div className="bg-white p-6 rounded-2xl">
                        <h2 className="text-gray-900 text-xl font-bold mb-5">
                          Học giao tiếp và khám phá thế giới với VRA
                        </h2>

                        <div className="space-y-4 mb-5">
                          <div className="form-input flex items-center border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
                            <User className="h-5 w-5 text-gray-400 mr-3" />
                            <input
                              type="email"
                              placeholder="Email*"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="form-input flex items-center border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary-color transition-all duration-300">
                              <Key className="h-5 w-5 text-gray-400 mr-3" />
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu*"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 text-gray-800 bg-transparent border-0 focus:outline-none"
                              />
                              <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 hover:text-primary-color transition-colors duration-300"
                              >
                                {showPassword ? (
                                  <Eye className="h-5 w-5" />
                                ) : (
                                  <EyeOff className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            <div className="text-right">
                              <button
                                className="text-primary-color text-sm hover:underline transition-all duration-300 border-none bg-transparent cursor-pointer"
                                onClick={() =>
                                  alert("Chức năng đang được phát triển")
                                }
                              >
                                Quên mật khẩu?
                              </button>
                            </div>
                          </div>
                          <AnimatedButton
                            icon={LogIn}
                            text="Đăng nhập"
                            className="bg-[linear-gradient(135deg,_var(--primary-color),_var(--primary-light))] font-bold"
                            size="full"
                            withFullWidth={true}
                            primary
                            onClick={handleLogin}
                            isLoading={isLoggingIn}
                          />
                        </div>

                        <div className="mb-5">
                          <div className="flex items-center mb-3">
                            <span className="text-gray-500 text-sm mr-2">
                              Hoặc tiếp tục với
                            </span>
                            <div className="h-px bg-gray-300 flex-1"></div>
                          </div>

                          <button className="bg-gray-100 w-full py-3 rounded-lg flex items-center justify-center hover:bg-gray-200 transform hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md">
                            <img
                              src={googleLogo}
                              alt="Google"
                              className="h-5 w-5 mr-2"
                            />
                            <span className="text-gray-700">
                              Đăng nhập với Google
                            </span>
                          </button>
                        </div>

                        <div className="text-center mb-4">
                          <span className="text-gray-900 text-sm">
                            Nếu bạn chưa có tài khoản, vui lòng{" "}
                            <button
                              className="text-primary-color font-semibold hover:underline transition-all duration-300 border-none bg-transparent cursor-pointer p-0"
                              onClick={() => setShowRegisterForm(true)}
                            >
                              Đăng ký
                            </button>
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="h-px bg-gray-300 w-full mb-3"></div>
                          <p className="text-gray-700 text-xs">
                            Trang này được bảo vệ bởi reCAPTCHA và áp dụng Điều
                            khoản sử dụng.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose VRA Section */}
        <section
          id="features"
          className="feature-section w-full py-16 lg:py-20 px-6 md:px-8 bg-gradient-to-b from-white to-blue-50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="inline-block text-primary-color font-semibold mb-2 text-sm tracking-wider uppercase">
                Tại sao chọn VRA
              </span>
              <h2 className="text-primary-color font-bold text-3xl md:text-5xl mb-4 leading-tight">
                Lý do nên lựa chọn hệ thống VRA
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                Chúng tôi cung cấp giải pháp toàn diện, giúp trẻ phát triển kỹ
                năng và tự tin trong một môi trường học tập tương tác.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  image: anh1,
                  title: "Khám phá thế giới 3D sống động",
                  desc: "VRA giúp trẻ tương tác với môi trường ảo, học qua các vật thể và không gian thú vị. Các bài học được thiết kế dưới dạng trò chơi, giúp trẻ vừa học vừa giải trí.",
                  delay: 0,
                },
                {
                  image: anh2,
                  title: "Phát triển kỹ năng giao tiếp và xã hội",
                  desc: "VRA hỗ trợ trẻ tự tin giao tiếp thông qua bài học kỹ năng xã hội. Hệ thống AI gợi ý thông minh giúp trẻ xử lí tình huống khi gặp khó khăn mà không bị áp lực.",
                  delay: 0.2,
                },
                {
                  image: anh3,
                  title: "Đồng hành cùng gia đình và giáo viên",
                  desc: "Giáo viên và phụ huynh có thể quản lý qvà điều chỉnh lộ trình học cho trẻ qua giao diện website thân thiện, dễ dàng làm quen, sử dụng.",
                  delay: 0.4,
                },
              ].map((item, index) => (
                <div key={index} className="flex h-full w-full">
                  <CardContainer
                    className="group/card bg-gray-100 rounded-3xl shadow-md border border-gray-200 w-full h-full transition-all duration-300 hover:shadow-lg"
                    containerClassName="py-0"
                  >
                    <CardBody className="w-full h-full rounded-3xl p-10 flex flex-col">
                      <div className="mb-6">
                        <CardItem
                          translateZ="50"
                          className="text-2xl font-semibold text-gray-700 mb-2"
                        >
                          {item.title}
                        </CardItem>
                        <CardItem
                          as="p"
                          translateZ="40"
                          className="text-gray-500 text-base"
                        >
                          {item.desc}
                        </CardItem>
                      </div>

                      <CardItem translateZ="60" className="w-full mb-10">
                        <div className="rounded-xl overflow-hidden relative">
                          <img
                            src={item.image}
                            className="w-full h-60 object-cover transition-all duration-300"
                            alt={item.title}
                          />
                        </div>
                      </CardItem>

                      <div className="mt-auto flex justify-end">
                        <CardItem
                          translateZ={30}
                          as="button"
                          className="!p-0"
                        >
                          <AnimatedButton
                            icon={NotebookText}
                            text="Chi tiết"
                            size="md"
                            className="bg-black text-white hover:shadow-[0_0_20px_3px_rgba(255,255,255,0.3)]"
                          />
                        </CardItem>
                      </div>
                    </CardBody>
                  </CardContainer>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-features w-full py-16 lg:py-20 px-6 md:px-8 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto">
            <div
              className="feature-section-title text-center mb-16"
              data-aos="fade-up"
            >
              <span className="inline-block text-accent-color font-semibold mb-2 text-sm tracking-wider uppercase">
                Tính năng nổi bật
              </span>
              <h2 className="text-white font-bold text-3xl md:text-5xl mb-4 leading-tight">
                Cùng tìm hiểu khả năng của
                <span className="text-accent-color block mt-2">
                  hệ thống VRA
                </span>
                dành riêng cho phụ huynh
              </h2>
            </div>

            <div className="feature-row flex flex-col-reverse md:flex-row justify-between items-center md:items-stretch gap-12 md:gap-10">
              <div
                className="w-full md:w-1/2 flex flex-col justify-center"
                data-aos="fade-right"
              >
                <span className="inline-block font-semibold mb-2 text-sm tracking-wider uppercase">
                  Theo dõi học tập
                </span>
                <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                  Dễ dàng theo dõi và quản lí tiến độ học tập của trẻ nhỏ
                </h3>
                <p className="text-blue-100 mb-4 text-lg leading-relaxed">
                  Hệ thống cập nhật tiến độ học tập của trẻ nhỏ theo thời gian
                  thực, giúp phụ huynh và giáo viên nắm bắt được sự tiến bộ của
                  trẻ mỗi ngày.
                </p>
                <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                  Mỗi khi kết thúc buổi học hệ thống sẽ tự động ghi lại video
                  quá trình học tập để phụ huynh có thể xem lại và đánh giá hiệu
                  quả.
                </p>
                <div className="flex mt-12">
                  <AnimatedButton
                    icon={ArrowRight}
                    text="Tìm hiểu ngay"
                    size="md"
                    className="bg-[linear-gradient(135deg,_var(--primary-color),_var(--primary-light))]"
                    onClick={scrollToTop}
                  />
                </div>
              </div>              <div className="w-full md:w-1/2 h-full min-h-[500px] flex items-center justify-center" data-aos="fade-left">
                <div className="w-full h-full max-h-[600px]">
                  <LensDemo />
                </div>
              </div>
            </div>

            <div className="feature-row flex flex-col md:flex-row justify-between items-center md:items-stretch gap-12 md:gap-10">
              <div
                className="w-full md:w-1/2 order-2 md:order-1"
                data-aos="fade-right"
              >
                {/* <div className="rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-[1.03] hover:rotate-1 relative 
                group">
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-color/30 to-transparent mix-blend-overlay opacity-80 
                  group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity 
                  duration-500">
                    <div className="bg-primary-color text-white px-6 py-3 rounded-full font-bold shadow-lg transform -translate-y-4 
                    group-hover:translate-y-0 transition-transform duration-500">
                      Gặp đội ngũ chuyên gia
                    </div> 
                  </div>

                </div> */}
                <Stack
                  cardsData={[
                    { id: 1, img: doctor },
                    { id: 2, img: doctor1 },
                    { id: 3, img: doctor3 },
                    { id: 4, img: doctor4 },
                  ]}
                  // cardDimensions={{ width: 400, height: 300 }}
                  sensitivity={150}
                  randomRotation={true}
                />
              </div>
              <div
                className="w-full md:w-1/2 flex flex-col justify-center order-1 md:order-2"
                data-aos="fade-left"
              >
                <span className="inline-block text-accent-color font-semibold mb-2 text-sm tracking-wider uppercase">
                  Đội ngũ chuyên môn
                </span>
                <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                  Đội ngũ y bác sĩ chất lượng cao
                </h3>
                <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                  Đội ngũ y bác sĩ có thâm niên kinh nghiệm trong việc thăm khám
                  và điều trị cho trẻ tự kỷ, luôn đặt sự phát triển của trẻ lên
                  hàng đầu.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Cách truyền đạt kiến thức gần gũi và dễ hiểu.",
                    "Tận tâm chăm sóc và hỗ trợ trẻ trong quá trình điều trị.",
                    "Sẵn sàng giải đáp và tư vấn cho phụ huynh.",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center group"
                      data-aos="fade-up"
                      data-aos-delay={idx * 100}
                    >
                      <div className="bg-accent-color rounded-full p-1.5 mr-4 transform transition-all duration-300 group-hover:scale-110">
                        <CheckCircle className="text-primary-color h-5 w-5" />
                      </div>
                      <span className="text-blue-100 text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex mt-auto">
                  <AnimatedButton
                    icon={ArrowLeft}
                    text="Tìm hiểu ngay"
                    size="md"
                    className="bg-[linear-gradient(135deg,_var(--primary-color),_var(--primary-light))]"
                    onClick={scrollToTop}
                  />
                </div>
              </div>
            </div>

            <div className="feature-row flex flex-col-reverse md:flex-row justify-between items-center md:items-stretch gap-12 md:gap-10">
              <div
                className="w-full md:w-1/2 flex flex-col justify-center"
                data-aos="fade-right"
              >
                <span className="inline-block text-accent-color font-semibold mb-2 text-sm tracking-wider uppercase">
                  Công nghệ tiên tiến
                </span>
                <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-5 leading-tight">
                  Liên tục cập nhật và ứng dụng công nghệ cao
                </h3>
                <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                  Sản phẩm sử dụng AI để cá nhân hóa nội dung và lộ trình học
                  tập theo nhu cầu của từng người dùng. Hệ thống có khả năng
                  phân tích hành vi, ghi nhận tiến độ học và tự động gợi ý những
                  bài học hoặc bài tập phù hợp. Điều này đảm bảo rằng mỗi học
                  sinh đều được học tập theo cách hiệu quả nhất, giúp tối ưu hóa
                  khả năng tiếp thu và phát triển.
                </p>
                <div className="flex mt-auto">
                  <AnimatedButton
                    icon={ArrowRight}
                    text="Tìm hiểu ngay"
                    size="md"
                    className="bg-[linear-gradient(135deg,_var(--primary-color),_var(--primary-light))]"
                    onClick={scrollToTop}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2" data-aos="fade-left">
                <div className="rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.03] hover:rotate-1 relative group flex">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-color/30 to-transparent mix-blend-overlay opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <img
                    src={AI}
                    alt="Technology"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-primary-color text-white px-6 py-3 rounded-full font-bold shadow-lg transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Khám phá công nghệ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-16 lg:py-20 px-6 md:px-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14" data-aos="fade-up">
              <span className="inline-block text-primary-color font-semibold mb-2 text-sm tracking-wider uppercase">
                Đánh giá từ người dùng
              </span>
              <h2 className="text-primary-color font-bold text-3xl md:text-5xl mb-4 leading-tight">
                Phụ huynh nói gì về chúng tôi
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                Những phản hồi từ phụ huynh giúp chúng tôi không ngừng hoàn
                thiện dịch vụ để mang đến trải nghiệm tốt nhất cho trẻ nhỏ.
              </p>
            </div>

            <div
              className="testimonial-slider relative overflow-hidden rounded-xl px-4"
              data-aos="fade-up"
            >
              <div
                className="flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 33.33}%)`,
                }}
              >
                {testimonials.map((item, index) => (
                  <div
                    key={index}
                    className="testimonial-card min-w-[280px] md:min-w-[350px]"
                  >
                    <div className="flex space-x-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="text-yellow-400 h-5 w-5 fill-current"
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <p className="testimonial-quote">{item.quote}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <h4 className="font-bold text-primary-color text-lg">
                          {item.name}
                        </h4>
                        <p className="text-gray-500">{item.role}</p>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${item.gender === "male" ? "bg-blue-100" : "bg-pink-100"
                          }`}
                      >
                        {item.gender === "male" ? (
                          <User className={`h-7 w-7 text-blue-600`} />
                        ) : (
                          <User2 className={`h-7 w-7 text-pink-600`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-3">
              {[0, 3, 6, 9].map((index) => (
                <button
                  key={index}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${currentTestimonial === index
                    ? "bg-primary-color w-10"
                    : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <AnimatedButton
                icon={Rotate3dIcon}
                text="Xem tất cả đánh giá"
                size="md"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={scrollToTop}
              />
            </div>
          </div>
        </section>

        <RegisterForm
          isOpen={showRegisterForm}
          onClose={() => setShowRegisterForm(false)}
          onSubmit={handleRegisterSubmit}
        />
      </div>
    </div>
  );
};

export default HomePage;
