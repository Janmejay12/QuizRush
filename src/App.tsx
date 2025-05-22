
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import JoinQuiz from "./pages/JoinQuiz";
import Admin from "./pages/Admin";
import QuizRoom from "./pages/QuizRoom";
import QuizCreate from "./pages/QuizCreate";
import QuestionPage from "./pages/QuestionPage";
import QuizEdit from "./pages/QuizEdit";
import QuizView from "./pages/QuizView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join-quiz" element={<JoinQuiz />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/quiz-room" element={<QuizRoom />} />
          <Route path="/create-quiz" element={<QuizCreate />} />
          <Route path="/admin/quiz/:quizId/question/:questionId" element={<QuestionPage />} />
          <Route path="/admin/quiz/:quizId/edit" element={<QuizEdit />} />
          <Route path="/admin/quiz/:quizId" element={<QuizView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
