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
import QuizCreate from "./pages/QuizCreate";
import QuestionPage from "./pages/QuestionPage";
import QuizEdit from "./pages/QuizEdit";
import QuizView from "./pages/QuizView";
import HostWaitingRoom from "./pages/HostWaitingRoom";
import ParticipantWaitingRoom from "./pages/ParticipantWaitingRoom";
import HostQuizView from "./pages/HostQuizView";
import ParticipantQuestionView from "./pages/ParticipantQuestionView";
import LeaderboardView from "./pages/LeaderboardView";
import ParticipantQuizSummary from "./pages/ParticipantQuizSummary";
import HostQuizSummary from "./pages/HostQuizSummary";

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
          <Route path="/create-quiz" element={<QuizCreate />} />
          <Route path="/admin/quiz/:quizId/question/:questionId" element={<QuestionPage />} />
          <Route path="/admin/quiz/:quizId/edit" element={<QuizEdit />} />
          <Route path="/admin/quiz/:quizId" element={<QuizView />} />
          
          {/* Quiz game routes */}
          <Route path="/host-waiting/:quizId" element={<HostWaitingRoom />} />
          <Route path="/participant-waiting/:quizId" element={<ParticipantWaitingRoom />} />
          <Route path="/host-quiz/:quizId/:roomCode" element={<HostQuizView />} />
          <Route path="/participant-quiz/:quizId/:participantId" element={<ParticipantQuestionView />} />
          <Route path="/leaderboard/:quizId/:roomCode" element={<LeaderboardView />} />
          
          {/* Quiz summary routes */}
          <Route path="/participant-summary/:quizId/:participantId" element={<ParticipantQuizSummary />} />
          <Route path="/host-summary/:quizId" element={<HostQuizSummary />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;