// === 사용자 ===
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  classId: string;
  studentNumber?: number;
}

// === 학급 ===
export interface ClassInfo {
  id: string;
  name: string;
  schoolName: string;
  teacherId: string;
  inviteCode: string;
  students: Student[];
}

export interface Student {
  id: string;
  number: number;
  name: string;
  gender?: '남' | '여';
}

// === 목표 ===
export type GoalType = 'reading' | 'attendance' | 'kindness' | 'custom';

export interface GoalCategory {
  id: string;
  classId: string;
  name: string;
  type: GoalType;
  unit: string;
  icon: string;
  pointsPerUnit: number;
  weeklyTarget: number;
  requiresApproval: boolean;
}

export type LogStatus = 'pending' | 'approved' | 'rejected';

export interface GoalLog {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  categoryId: string;
  categoryName: string;
  value: number;
  points: number;
  note: string;
  status: LogStatus;
  createdAt: string; // ISO date
}

// === 퀴즈 ===
export type QuizType = 'ox' | 'multiple';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizType;
  options: string[];
  correctIndex: number;
  timeLimit: number; // seconds
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  classIds: string[];
  createdBy: string;
  status: 'draft' | 'active' | 'finished';
}

export interface QuizAnswer {
  questionId: string;
  studentId: string;
  classId: string;
  selectedIndex: number;
  correct: boolean;
  answeredAt: string;
}

export interface QuizClassResult {
  classId: string;
  className: string;
  correctRate: number;
  totalAnswers: number;
  points: number;
}

// === 미션 ===
export interface Mission {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  points: number;
}

export interface MissionProgress {
  missionId: string;
  classId: string;
  className: string;
  currentValue: number;
  targetValue: number;
  contributions: { studentId: string; studentName: string; value: number }[];
}

// === 리그 ===
export interface LeagueEntry {
  classId: string;
  className: string;
  totalPoints: number;
  readingPoints: number;
  attendancePoints: number;
  kindnessPoints: number;
  quizPoints: number;
  missionPoints: number;
  rank: number;
  previousRank: number;
}
