import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, ClassInfo, GoalLog, GoalCategory, Quiz, QuizAnswer, Mission, MissionProgress } from '../types';
import { dummyClasses, dummyGoalLogs, defaultGoalCategories, dummyQuizzes, dummyMissions, dummyMissionProgress } from '../data/dummy';

interface AppState {
  currentUser: User | null;
  classes: ClassInfo[];
  goalCategories: GoalCategory[];
  goalLogs: GoalLog[];
  quizzes: Quiz[];
  quizAnswers: QuizAnswer[];
  missions: Mission[];
  missionProgress: MissionProgress[];
  login: (user: User) => void;
  logout: () => void;
  addClass: (cls: ClassInfo) => void;
  addStudentsToClass: (classId: string, students: ClassInfo['students']) => void;
  addGoalLog: (log: GoalLog) => void;
  updateLogStatus: (logId: string, status: GoalLog['status']) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quiz: Quiz) => void;
  addQuizAnswer: (answer: QuizAnswer) => void;
  addMission: (mission: Mission) => void;
  updateMissionProgress: (missionId: string, classId: string, addValue: number, studentId: string, studentName: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>(dummyClasses);
  const [goalCategories] = useState<GoalCategory[]>(defaultGoalCategories);
  const [goalLogs, setGoalLogs] = useState<GoalLog[]>(dummyGoalLogs);
  const [quizzes, setQuizzes] = useState<Quiz[]>(dummyQuizzes);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [missions] = useState<Mission[]>(dummyMissions);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>(dummyMissionProgress);

  const login = useCallback((user: User) => setCurrentUser(user), []);
  const logout = useCallback(() => setCurrentUser(null), []);

  const addClass = useCallback((cls: ClassInfo) => {
    setClasses((prev) => [...prev, cls]);
  }, []);

  const addStudentsToClass = useCallback((classId: string, students: ClassInfo['students']) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, students: [...c.students, ...students] } : c))
    );
  }, []);

  const addGoalLog = useCallback((log: GoalLog) => {
    setGoalLogs((prev) => [log, ...prev]);
  }, []);

  const updateLogStatus = useCallback((logId: string, status: GoalLog['status']) => {
    setGoalLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, status } : l)));
  }, []);

  const addQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => [...prev, quiz]);
  }, []);

  const updateQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
  }, []);

  const addQuizAnswer = useCallback((answer: QuizAnswer) => {
    setQuizAnswers((prev) => [...prev, answer]);
  }, []);

  const addMission = useCallback((_mission: Mission) => {
    // unused for now but available
  }, []);

  const updateMissionProgress = useCallback(
    (missionId: string, classId: string, addValue: number, studentId: string, studentName: string) => {
      setMissionProgress((prev) =>
        prev.map((mp) => {
          if (mp.missionId === missionId && mp.classId === classId) {
            return {
              ...mp,
              currentValue: mp.currentValue + addValue,
              contributions: [...mp.contributions, { studentId, studentName, value: addValue }],
            };
          }
          return mp;
        })
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        currentUser, classes, goalCategories, goalLogs, quizzes, quizAnswers, missions, missionProgress,
        login, logout, addClass, addStudentsToClass, addGoalLog, updateLogStatus,
        addQuiz, updateQuiz, addQuizAnswer, addMission, updateMissionProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
