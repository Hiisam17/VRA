import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Clock,
  FileText,
  ListChecks,
  MessageCircle,
  AlertTriangle,
  Timer,
  Loader2,
  Info,
  Bot,
  AlertCircle
} from "lucide-react";
import { memo } from "react";
import type { Task } from "./index";
import Magnet from '../../../components/lib-animated/Magnet' 

export const tasks = [
  { stt: 1, name: "Bật vòi nước", remind: 4, response: 3.5, note: "Bật vòi hơi lâu" },
  { stt: 2, name: "Làm ướt tay", remind: 2, response: 2.7, note: "Phản ứng chậm" },
  { stt: 3, name: "Xịt xà phòng", remind: 4, response: 8.2, note: "Chưa nắm được cách xịt xà phòng" },
  { stt: 4, name: "Rửa tay", remind: 2, response: 5.3, note: "Rửa tay không kỹ" },
  { stt: 5, name: "Tắt vòi nước", remind: 4, response: 1.2, note: "Tắt sai cách" },
];

interface TaskListProps {
  onOpenFeedbackDetail?: (task: Task) => void;
  taskFeedbacks?: {[key: number]: {summary: string, full: string}};
  onGenerateFeedback?: () => void;
  isGeneratingFeedback?: boolean;
  feedbackError?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ 
  onOpenFeedbackDetail, 
  taskFeedbacks = {},
  onGenerateFeedback,
  isGeneratingFeedback,
  feedbackError = false
}) => {
  // Determine if we have feedback data
  const hasFeedback = Object.keys(taskFeedbacks).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 mb-8">
      {/* Header controls */}
      <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <ListChecks className="mr-2 text-primary-color" size={20} />
            Danh Sách Nhiệm Vụ
            <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Hiển thị {tasks.length} nhiệm vụ
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Chi tiết các nhiệm vụ trong buổi học rửa tay</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '38%' }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-2 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center bg-blue-100 rounded-full px-2 py-1.5">
                  <ListChecks className="h-3 w-3 text-blue-600 mr-1" />
                  STT
                </div>
              </th>
              <th className="px-3 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                  <FileText className="h-3 w-3 text-blue-600 mr-2" />
                  Tên nhiệm vụ
                </div>
              </th>
              <th className="px-2 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center bg-blue-100 rounded-full px-2 py-1.5">
                  <Bell className="h-3 w-3 text-blue-600 mr-1" />
                  Nhắc nhở
                </div>
              </th>
              <th className="px-2 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center bg-blue-100 rounded-full px-2 py-1.5">
                  <Clock className="h-3 w-3 text-blue-600 mr-1" />
                  Phản hồi
                </div>
              </th>
              <Magnet padding={100} disabled={false} magnetStrength={10}>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-center">
                {hasFeedback ? (
                  <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                    <MessageCircle className="h-3 w-3 text-[#19395E] mr-2" />
                    Nhận xét
                  </div>
                ) : isGeneratingFeedback ? (
                  <div className="flex items-center justify-center bg-blue-100 rounded-full px-3 py-1.5">
                    <Loader2 className="h-3 w-3 text-[#19395E] mr-2 animate-spin" />
                    <span>Đang phân tích...</span>
                  </div>
                ) : feedbackError ? (
                  <div className="flex items-center justify-center bg-red-100 rounded-full px-3 py-1.5">
                    <AlertCircle className="h-3 w-3 text-red-600 mr-2" />
                    <span>Lỗi kết nối</span>
                  </div>
                ) : (
                  <button
                    onClick={onGenerateFeedback}
                    className="w-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full px-16  py-1.5 transition-colors duration-200"
                  >
                    <Bot className="h-3 w-3 text-[#19395E] mr-2" />
                    <span>THÊM NHẬN XÉT TỪ VRA AI</span>
                  </button>
                )}
              </th>
              </Magnet>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <tr 
                key={task.stt} 
                className="hover:bg-blue-50 transition-all duration-300"
                style={{
                  transitionDelay: isGeneratingFeedback ? `${index * 50}ms` : '0ms',
                  opacity: isGeneratingFeedback ? 0.7 : 1
                }}
              >
                <td className="px-2 py-4 text-base text-gray-700 font-medium text-center">{task.stt}</td>
                <td className="px-3 py-4 text-base text-center">
                  <span className="font-medium text-blue-600">{task.name}</span>
                </td>
                <td className="px-2 py-4 text-base text-center">
                  {task.remind >= 3 ? (
                    <div className="flex items-center justify-center group relative">
                      <span className={`font-medium ${task.remind >= 3 ? 'text-amber-600' : 'text-gray-700'}`}>{task.remind}</span>
                      <AlertTriangle className="h-4 w-4 text-amber-500 absolute left-[60%]" />

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-amber-600 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        Nhiều lần nhắc nhở
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-amber-600"></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-700">{task.remind}</span>
                  )}
                </td>
                <td className="px-2 py-4 text-base text-center">
                  {task.response > 8 ? (
                    <div className="flex items-center justify-center group relative">
                      <span className="font-medium text-red-600">{task.response}s</span>
                      <Timer className="h-4 w-4 text-red-500 ml-2 absolute left-[60%]" />

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-red-600 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        Thời gian phản hồi lâu
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-700">{task.response}s</span>
                  )}
                </td>
                <td className="px-6 py-4 text-base text-center">
                  {taskFeedbacks[task.stt] ? (
                    <div className="group relative overflow-visible cursor-pointer min-h-8 py-1 flex items-center justify-center">
                      <div className="text-gray-700 transition-all duration-300 ease-in-out w-full flex items-center justify-center px-3 py-1 opacity-100 group-hover:opacity-0 whitespace-normal text-center break-words leading-snug">
                        {taskFeedbacks[task.stt].summary}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenFeedbackDetail) {
                            onOpenFeedbackDetail(task);
                          }
                        }}
                        className="text-primary-color text-xs bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 px-3 py-1 rounded-full transition-all duration-300 ease-in-out absolute opacity-0 group-hover:opacity-100 shadow-sm z-10"
                      >
                        <span className="flex items-center gap-1 transform transition-all group-hover:scale-[1.03]">
                          <Info size={10} className="transition-all duration-500 group-hover:rotate-12" />
                          Chi tiết
                        </span>
                      </button>
                    </div>
                  ) : isGeneratingFeedback ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-50 border-t-[#19395E] animate-spin"></div>
                      </div>
                    </div>
                  ) : feedbackError ? (
                    <div className="flex items-center justify-center text-red-500 text-sm animate-pulse">
                      Đã xảy ra lỗi. Vui lòng thử lại sau.
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa có nhận xét</span>
                  )}
                </td>
              </tr>
            ))}
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
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">5</span> trong số <span className="font-medium">5</span> kết quả
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

            {[1].map(page => (
              <button
                key={page}
                className="z-10 bg-primary-color border-primary-color text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium"
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
  );
};

export default memo(TaskList);