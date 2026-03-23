import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import GoalsPage from '../pages/GoalsPage';
import LeaguePage from '../pages/LeaguePage';
import QuizPage from '../pages/QuizPage';
import MissionPage from '../pages/MissionPage';
import TeacherSetupPage from '../pages/TeacherSetupPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'league', element: <LeaguePage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'mission', element: <MissionPage /> },
      { path: 'manage', element: <TeacherSetupPage /> },
    ],
  },
]);
