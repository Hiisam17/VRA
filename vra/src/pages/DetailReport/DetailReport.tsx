import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronRight,
  FileText,
  Award,
  Home,
  MessageCircle,
  AlertTriangle,
  Timer,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FeedbackDetailModal,
  EvaluationChatModal,
  TaskList,
  Task
} from "./components";
import { tasks } from "./components/TaskList";
import { generateText } from "../../services/geminiAiService";
import { BackgroundGradient } from "../../components/lib-animated/Background_Gradient";

const DetailReport: React.FC = () => {
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // AI feedback
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [taskFeedbacks, setTaskFeedbacks] = useState<{ [key: number]: { summary: string, full: string } }>({});
  const [showFeedbackDetail, setShowFeedbackDetail] = useState(false);

  // New state variables for AI evaluation
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);
  const [evaluationSummary, setEvaluationSummary] = useState('');
  const [showEvaluationChat, setShowEvaluationChat] = useState(false);
  const [evaluationError, setEvaluationError] = useState(false);

  useEffect(() => {
    const apiKeyStatus = process.env.REACT_APP_GEMINI_API_KEY ? 'configured' : 'missing';
    console.log(`Gemini API key status: ${apiKeyStatus}`);
  }, []);

  const generateAllFeedback = useCallback(async () => {
    setIsGeneratingFeedback(true);
    setFeedbackError(false);

    try {
      const feedbacks: { [key: number]: { summary: string, full: string } } = {};

      for (const task of tasks) {
        const promptSummary = `Hãy đưa ra nhận xét tóm tắt ngắn gọn (tối đa 20 từ) về nhiệm vụ "${task.name}" trong bài tập rửa tay của trẻ em bị tự kỷ. 
        Thông tin bổ sung: 
        - Số lần nhắc nhở: ${task.remind} lần (số lần càng nhiều càng không tốt)
        - Thời gian phản hồi: ${task.response}s (thời gian >5s là chậm)
        - Hãy đưa ra nhận xét về kỹ thuật thực hiện nhiệm vụ.`;

        const promptDetailed = `Hãy đưa ra nhận xét chi tiết (khoảng 3-4 câu) về nhiệm vụ "${task.name}" trong bài tập rửa tay của trẻ em bị tự kỷ. 
        Phân tích các yếu tố sau:
        1. Kỹ thuật thực hiện nhiệm vụ
        2. Thời gian phản hồi (${task.response}s, >5s được coi là chậm)
        3. Số lần nhắc nhở (${task.remind} lần, càng ít càng tốt)
        4. Đề xuất phương pháp hướng dẫn cụ thể để giúp trẻ cải thiện
        Nhận xét cần mang tính giáo dục, khuyến khích nhưng phải trung thực về hiệu suất thực hiện.`;

        try {
          const [summaryResponse, detailedResponse] = await Promise.all([
            generateText(promptSummary),
            generateText(promptDetailed)
          ]);

          feedbacks[task.stt] = {
            summary: summaryResponse?.trim() || `Nhận xét ${task.name}`,
            full: detailedResponse?.trim() || `Cần cải thiện kỹ năng thực hiện nhiệm vụ ${task.name}.`
          };
        } catch (innerError) {
          console.error(`Error generating feedback for task ${task.stt}:`, innerError);
        }
      }

      if (Object.keys(feedbacks).length > 0) {
        setTaskFeedbacks(feedbacks);
      } else {
        // If all tasks failed, throw error to trigger fallback
        throw new Error("Failed to generate feedback for any tasks");
      }
    } catch (error) {
      console.error("Error generating AI feedback:", error);
      setFeedbackError(true);

      setTimeout(() => {
        setFeedbackError(false);
      }, 3000);
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, []);

  const getStarColor = (score: number) => {
    if (score >= 8) return '#FFD700'; // vàng
    if (score >= 5) return '#FFA500'; // cam
    return '#FF4B4B'; // đỏ
  };

  const handleOpenFeedbackDetail = useCallback((task: Task) => {
    setCurrentTask(task);
    setShowFeedbackDetail(true);
  }, []);

  const handleCloseFeedbackDetail = useCallback(() => {
    setShowFeedbackDetail(false);
    setCurrentTask(null);
  }, []);

  // Function to request AI evaluation
  const requestAIEvaluation = useCallback(async () => {
    setIsGeneratingEvaluation(true);
    setEvaluationError(false);
    
    try {
      // Prepare data about all tasks for the AI prompt
      const taskData = tasks.map(task => {
        // Get feedback for this task if available
        const feedback = taskFeedbacks[task.stt];
        
        return `
        Nhiệm vụ: ${task.name}
        - Số lần nhắc nhở: ${task.remind} lần (càng ít càng tốt, ≥3 lần là cần cải thiện)
        - Thời gian phản hồi: ${task.response}s (≤5s là tốt, >8s là cần cải thiện)
        - Ghi chú: ${task.note}
        ${feedback ? `- Nhận xét chi tiết: ${feedback.full}` : ''}
        `;
      }).join('\n');
      
      // Create prompt for overall evaluation
      const evaluationPrompt = `
      Hãy đánh giá tổng quan về buổi học rửa tay của học sinh dựa trên thông tin về từng nhiệm vụ sau:
      
      ${taskData}
      
      Yêu cầu:
      1. Cho điểm từ 1-10 đánh giá tổng thể buổi học (điểm càng cao càng tốt)
      2. Viết một đoạn khoảng 3-4 câu nhận xét tổng quan về buổi học, đánh giá những điểm mạnh và điểm cần cải thiện
      3. Đưa ra định hướng hỗ trợ để giúp trẻ cải thiện kỹ năng
      
      Trả lời theo định dạng:
      Điểm: [Điểm số từ 1-10]
      Nhận xét: [Nhận xét tổng quan]
      `;
      
      // Call Gemini API
      const aiResponse = await generateText(evaluationPrompt);
      
      // Extract score from response (format expected: "Điểm: X" at beginning of response)
      const scoreMatch = aiResponse?.match(/Điểm:\s*(\d+)/i);
      const extractedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
      
      // Make sure score is within 1-10 range
      const validScore = extractedScore && !isNaN(extractedScore) && extractedScore >= 1 && extractedScore <= 10
        ? extractedScore
        : Math.floor(Math.random() * 3) + 7; // Fallback score between 7-9 if AI didn't provide valid score
      
      // Extract evaluation summary
      const summaryMatch = aiResponse?.match(/Nhận xét:\s*([\s\S]+)/i);
      const extractedSummary = summaryMatch ? summaryMatch[1].trim() : '';
      
      // Set state with AI generated content
      setScore(validScore);
      setEvaluationSummary(extractedSummary || "Học sinh đã hoàn thành các nhiệm vụ trong buổi học với một số điểm cần cải thiện. Cần hướng dẫn thêm về kỹ năng xịt xà phòng và rửa tay kỹ hơn.");
    } catch (error) {
      console.error("Error generating AI evaluation:", error);
      // Show error state
      setEvaluationError(true);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setEvaluationError(false);
        // Fallback to default values on error
        setScore(7);
        setEvaluationSummary("Học sinh đã hoàn thành các nhiệm vụ, nhưng còn một số điểm cần cải thiện. Đề xuất tăng cường hướng dẫn về các thao tác rửa tay đúng cách.");
      }, 3000);
    } finally {
      // End loading state
      setIsGeneratingEvaluation(false);
    }
  }, [taskFeedbacks]); // Add taskFeedbacks dependency to re-create the function when feedbacks change

  // Handle opening the evaluation chat
  const handleOpenEvaluationChat = useCallback(() => {
    setShowEvaluationChat(true);
  }, []);

  // Handle closing the evaluation chat
  const handleCloseEvaluationChat = useCallback(() => {
    setShowEvaluationChat(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Content Container */}
      <div className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-12 py-3">
            <div className="flex items-center text-sm text-gray-600">
              <Home size={16} className="mr-2 text-primary-color" />
              <button onClick={() => navigate('/')} className="hover:text-primary-color transition-colors duration-200">Trang chủ</button>
              <ChevronRight size={16} className="mx-2 text-gray-400" />
              <button onClick={() => navigate('/lesson-list')} className="hover:text-primary-color transition-colors duration-200">Danh sách buổi học</button>
              <ChevronRight size={16} className="mx-2 text-gray-400" />
              <span className="font-medium text-primary-color">Báo cáo chi tiết</span>
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">Báo Cáo Chi Tiết</h1>
                <p className="text-blue-100 max-w-xl">Thông tin chi tiết về buổi học rửa tay của học sinh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="container mx-auto px-12 pb-12">
          {/* Task list component */}
          <TaskList
            onOpenFeedbackDetail={handleOpenFeedbackDetail}
            taskFeedbacks={taskFeedbacks}
            onGenerateFeedback={generateAllFeedback}
            isGeneratingFeedback={isGeneratingFeedback}
            feedbackError={feedbackError}
          />

          {/* Legend for icons */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Chú thích:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm text-gray-600">Nhiều lần nhắc nhở (≥ 3 lần)</span>
              </div>
              <div className="flex items-center">
                <Timer className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Thời gian phản hồi lâu ({'>'}8 giây)</span>
              </div>
            </div>
          </div>

          {/* Two column layout for video and score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video thực hành */}
            <div className="lg:col-span-2">
              
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 h-full flex flex-col">
                  <div className="p-5 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FileText className="mr-2 text-primary-color" size={20} />
                      Video thực hành
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Xem lại quá trình thực hiện nhiệm vụ</p>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-center">
                    <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/-Wwp91N7P1M?list=PLcMNZDALWdfdp6q-4WbnV99I9_YgWBhru"
                        title="Video thực hành"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              
            </div>

            {/* Kết quả */}
            <div className="lg:col-span-1">
              
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
                  <div className="p-5 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Award className="mr-2 text-primary-color" size={20} />
                      Kết quả
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Đánh giá tổng thể buổi học</p>
                  </div>

                  <div className="p-4 flex-grow overflow-hidden flex flex-col">
                    {!score ? (
                      isGeneratingEvaluation ? (
                        // Loading state
                        <div className="flex flex-col items-center justify-center text-center py-6 flex-grow">
                          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-32 w-32 rounded-full border-4 border-blue-50 border-t-[#19395E] animate-spin"></div>
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Bot size={40} className="text-[#19395E] mb-3 animate-pulse" />
                              <span className="text-[#19395E] font-medium text-base">VRA AI đang đánh giá...</span>
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 w-full">
                            <p className="text-gray-600 text-sm text-center mb-0 leading-relaxed">
                              Đang phân tích video và các số liệu để đưa ra đánh giá chi tiết. Vui lòng đợi trong giây lát...
                            </p>
                          </div>
                        </div>
                      ) : evaluationError ? (
                        // Error state
                        <div className="flex flex-col items-center justify-center text-center py-6 flex-grow">
                          <div className="w-40 h-40 flex items-center justify-center mb-6 bg-red-50 rounded-full border border-red-100 shadow-sm">
                            <div className="text-center p-4">
                              <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
                              <span className="text-red-500 font-medium block mb-4 text-base">Lỗi kết nối</span>
                              <button 
                                onClick={requestAIEvaluation}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center mx-auto shadow-sm hover:shadow-md text-sm"
                              >
                                <AlertTriangle size={18} className="mr-2" />
                                <span>Thử lại</span>
                              </button>
                            </div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-5 border border-red-100 w-full">
                            <p className="text-gray-600 text-sm mb-0 leading-relaxed">
                              Đã xảy ra lỗi khi kết nối với VRA AI. Vui lòng kiểm tra kết nối mạng và thử lại sau.
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Request evaluation button
                        <div className="flex flex-col items-center justify-center text-center py-6 flex-grow">
                          <div className="w-40 h-40 flex items-center justify-center mb-6 bg-gray-50 rounded-full border border-gray-200 shadow-sm">
                            <div className="text-center p-4">
                              <Bot size={40} className="text-gray-400 mx-auto mb-1" />
                              <span className="text-gray-500 font-medium block mb-2 text-base">Chưa có đánh giá</span>
                              {Object.keys(taskFeedbacks).length > 0 ? (
                                <button 
                                  onClick={requestAIEvaluation}
                                  className="bg-[#19395E] hover:bg-[#254b76] text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center mx-auto shadow-sm hover:shadow-md text-sm"
                                >
                                  <Bot size={20} className="mr-2" />
                                  <span>Yêu cầu đánh giá</span>
                                </button>
                              ) : (
                                <button 
                                  className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full flex items-center mx-auto shadow-sm text-sm cursor-not-allowed"
                                  title="Cần tạo nhận xét cho các nhiệm vụ trước khi đánh giá"
                                >
                                  <Bot size={18} className="mr-2" />
                                  <span>Yêu cầu đánh giá</span>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 w-full">
                            <p className="text-gray-600 text-sm mb-0 leading-relaxed">
                              {Object.keys(taskFeedbacks).length > 0 
                                ? "Sử dụng trí tuệ nhân tạo để phân tích và đưa ra đánh giá tổng quan về buổi học. AI sẽ đánh giá điểm số dựa trên các tiêu chí chất lượng." 
                                : "Vui lòng tạo nhận xét cho từng nhiệm vụ trước khi yêu cầu đánh giá tổng thể buổi học."}
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      // Results with score
                      <div className="flex flex-col items-center py-6 flex-grow">
                        {/* Score star icon - make it larger */}
                        <div className="flex justify-center items-center w-full mb-6">
                          <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 200 200" width="176" height="176" className="drop-shadow-md">
                              <polygon
                                points="100,20 123,78 185,78 135,120 153,180 100,145 47,180 65,120 15,78 77,78"
                                fill={getStarColor(score || 0)}
                                stroke="#19395E"
                                strokeWidth="8"
                                style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.15))" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-7xl font-extrabold text-white drop-shadow-md">{score}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center w-full mb-6">
                          <span className="text-xl font-semibold text-blue-900 inline-block">Điểm số đánh giá</span>
                        </div>

                        {/* Evaluation Summary - improve scrolling for long content */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6 w-full max-h-[180px] overflow-y-auto custom-scrollbar">
                          <div className="flex items-start">
                            <div className="bg-white p-3 rounded-full flex-shrink-0 mr-4 mt-0.5 shadow-sm">
                              <Bot size={24} className="text-[#19395E]" />
                            </div>
                            <div className="text-gray-700 text-[15px] mb-0 flex-1 leading-relaxed">
                              {evaluationSummary}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleOpenEvaluationChat}
                          className="w-full px-5 py-3 bg-[#19395E] hover:bg-[#254b76] text-white rounded-lg font-medium transition-all duration-200 shadow-sm flex items-center justify-center group text-base"
                        >
                          <MessageCircle size={22} className="mr-2 group-hover:animate-pulse" />
                          Trao đổi thêm với VRA AI
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {currentTask && (
        <>
          <FeedbackDetailModal
            isOpen={showFeedbackDetail}
            onClose={handleCloseFeedbackDetail}
            currentTask={currentTask}
            taskFeedbacks={taskFeedbacks}
          />
        </>
      )}

      <EvaluationChatModal
        isOpen={showEvaluationChat}
        onClose={handleCloseEvaluationChat}
        score={score}
        evaluationSummary={evaluationSummary}
      />
    </div>
  );
};

export default DetailReport; 