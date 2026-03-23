import type {
  ClassInfo,
  Student,
  GoalCategory,
  GoalLog,
  Quiz,
  Mission,
  MissionProgress,
  LeagueEntry,
} from '../types';

// === 학생 생성 헬퍼 ===
const names4_2 = ['김민준','이서연','박지호','최수아','정도윤','강하은','조시우','윤지아','임예준','한소율','송유준','오채원','신하준','문서윤','황지훈','안지유','배승우','유하린','전준서','곽서현','남도현','구예은','양시윤','권민서','홍건우'];
const names4_3 = ['이도윤','김하은','박시우','정지아','최예준','강소율','조유준','윤채원','임하준','한서윤','송지훈','오지유','신승우','문하린','황준서','안서현','배도현','유예은','전시윤','곽민서','남건우','구민준','양서연','권지호','홍수아'];
const names4_5 = ['정시우','김지아','이예준','박소율','최유준','강채원','조하준','윤서윤','임지훈','한지유','송승우','오하린','신준서','문서현','황도현','안예은','배시윤','유민서','전건우','곽민준','남서연','구지호','양수아','권도윤','홍하은'];

function makeStudents(names: string[]): Student[] {
  return names.map((name, i) => ({
    id: `s${i + 1}`,
    number: i + 1,
    name,
    gender: (i % 2 === 0 ? '남' : '여') as '남' | '여',
  }));
}

// === 학급 ===
export const dummyClasses: ClassInfo[] = [
  {
    id: 'class-4-2',
    name: '4학년 2반',
    schoolName: '해오름초등학교',
    teacherId: 'teacher-1',
    inviteCode: 'AB3K7Z',
    students: makeStudents(names4_2),
  },
  {
    id: 'class-4-3',
    name: '4학년 3반',
    schoolName: '해오름초등학교',
    teacherId: 'teacher-2',
    inviteCode: 'CD5M9X',
    students: makeStudents(names4_3),
  },
  {
    id: 'class-4-5',
    name: '4학년 5반',
    schoolName: '해오름초등학교',
    teacherId: 'teacher-3',
    inviteCode: 'EF8P2W',
    students: makeStudents(names4_5),
  },
];

// === 목표 카테고리 (프리셋) ===
export const defaultGoalCategories: GoalCategory[] = [
  {
    id: 'goal-reading',
    classId: '',
    name: '독서',
    type: 'reading',
    unit: '권',
    icon: 'book-open',
    pointsPerUnit: 10,
    weeklyTarget: 3,
    requiresApproval: true,
  },
  {
    id: 'goal-attendance',
    classId: '',
    name: '출석',
    type: 'attendance',
    unit: '일',
    icon: 'calendar-check',
    pointsPerUnit: 5,
    weeklyTarget: 5,
    requiresApproval: false,
  },
  {
    id: 'goal-kindness',
    classId: '',
    name: '친절 미션',
    type: 'kindness',
    unit: '회',
    icon: 'heart',
    pointsPerUnit: 8,
    weeklyTarget: 5,
    requiresApproval: true,
  },
];

// === 더미 활동 기록 생성 ===
function generateGoalLogs(classes: ClassInfo[]): GoalLog[] {
  const logs: GoalLog[] = [];
  const today = new Date();

  classes.forEach((cls) => {
    cls.students.forEach((student) => {
      // 각 학생마다 지난 2주간 랜덤 활동
      for (let day = 0; day < 14; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString();

        // 출석 (80% 확률)
        if (Math.random() < 0.8) {
          logs.push({
            id: `log-${cls.id}-${student.id}-att-${day}`,
            classId: cls.id,
            studentId: student.id,
            studentName: student.name,
            categoryId: 'goal-attendance',
            categoryName: '출석',
            value: 1,
            points: 5,
            note: '',
            status: 'approved',
            createdAt: dateStr,
          });
        }

        // 독서 (20% 확률)
        if (Math.random() < 0.2) {
          logs.push({
            id: `log-${cls.id}-${student.id}-read-${day}`,
            classId: cls.id,
            studentId: student.id,
            studentName: student.name,
            categoryId: 'goal-reading',
            categoryName: '독서',
            value: 1,
            points: 10,
            note: '책 1권 완독',
            status: Math.random() < 0.7 ? 'approved' : 'pending',
            createdAt: dateStr,
          });
        }

        // 친절 미션 (30% 확률)
        if (Math.random() < 0.3) {
          const kindnessNotes = ['친구 도와주기', '교실 청소', '인사 잘하기', '양보하기', '쓰레기 줍기'];
          logs.push({
            id: `log-${cls.id}-${student.id}-kind-${day}`,
            classId: cls.id,
            studentId: student.id,
            studentName: student.name,
            categoryId: 'goal-kindness',
            categoryName: '친절 미션',
            value: 1,
            points: 8,
            note: kindnessNotes[Math.floor(Math.random() * kindnessNotes.length)],
            status: Math.random() < 0.6 ? 'approved' : 'pending',
            createdAt: dateStr,
          });
        }
      }
    });
  });

  return logs;
}

export const dummyGoalLogs: GoalLog[] = generateGoalLogs(dummyClasses);

// === 더미 퀴즈 ===
export const dummyQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: '3월 수학 퀴즈 배틀',
    classIds: ['class-4-2', 'class-4-3', 'class-4-5'],
    createdBy: 'teacher-1',
    status: 'draft',
    questions: [
      { id: 'q1', question: '24 x 5 = ?', type: 'multiple', options: ['100', '120', '125', '110'], correctIndex: 1, timeLimit: 15 },
      { id: 'q2', question: '삼각형의 내각의 합은 180도이다.', type: 'ox', options: ['O', 'X'], correctIndex: 0, timeLimit: 10 },
      { id: 'q3', question: '1km는 몇 m인가?', type: 'multiple', options: ['100m', '500m', '1000m', '10000m'], correctIndex: 2, timeLimit: 15 },
      { id: 'q4', question: '짝수와 홀수를 더하면 항상 홀수이다.', type: 'ox', options: ['O', 'X'], correctIndex: 0, timeLimit: 10 },
      { id: 'q5', question: '36 ÷ 4 = ?', type: 'multiple', options: ['6', '7', '8', '9'], correctIndex: 3, timeLimit: 15 },
    ],
  },
];

// === 더미 미션 ===
export const dummyMissions: Mission[] = [
  {
    id: 'mission-1',
    title: '수학 문제 200개 풀기',
    description: '반 전체가 힘을 합쳐 수학 문제 200개를 풀어보세요!',
    targetValue: 200,
    unit: '문제',
    startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    points: 30,
  },
  {
    id: 'mission-2',
    title: '영어 단어 500개 외우기',
    description: '반 친구들과 함께 영어 단어 500개에 도전!',
    targetValue: 500,
    unit: '단어',
    startDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 6 * 86400000).toISOString(),
    points: 30,
  },
];

export const dummyMissionProgress: MissionProgress[] = [
  { missionId: 'mission-1', classId: 'class-4-2', className: '4학년 2반', currentValue: 145, targetValue: 200, contributions: [] },
  { missionId: 'mission-1', classId: 'class-4-3', className: '4학년 3반', currentValue: 128, targetValue: 200, contributions: [] },
  { missionId: 'mission-1', classId: 'class-4-5', className: '4학년 5반', currentValue: 167, targetValue: 200, contributions: [] },
  { missionId: 'mission-2', classId: 'class-4-2', className: '4학년 2반', currentValue: 210, targetValue: 500, contributions: [] },
  { missionId: 'mission-2', classId: 'class-4-3', className: '4학년 3반', currentValue: 185, targetValue: 500, contributions: [] },
  { missionId: 'mission-2', classId: 'class-4-5', className: '4학년 5반', currentValue: 240, targetValue: 500, contributions: [] },
];

// === 리그 순위 계산 ===
export function calculateLeague(classes: ClassInfo[], logs: GoalLog[]): LeagueEntry[] {
  const entries: LeagueEntry[] = classes.map((cls) => {
    const classLogs = logs.filter((l) => l.classId === cls.id && l.status === 'approved');
    const reading = classLogs.filter((l) => l.categoryId === 'goal-reading').reduce((s, l) => s + l.points, 0);
    const attendance = classLogs.filter((l) => l.categoryId === 'goal-attendance').reduce((s, l) => s + l.points, 0);
    const kindness = classLogs.filter((l) => l.categoryId === 'goal-kindness').reduce((s, l) => s + l.points, 0);
    return {
      classId: cls.id,
      className: cls.name,
      totalPoints: reading + attendance + kindness,
      readingPoints: reading,
      attendancePoints: attendance,
      kindnessPoints: kindness,
      quizPoints: 0,
      missionPoints: 0,
      rank: 0,
      previousRank: 0,
    };
  });

  entries.sort((a, b) => b.totalPoints - a.totalPoints);
  entries.forEach((e, i) => {
    e.rank = i + 1;
    e.previousRank = Math.min(classes.length, Math.max(1, i + 1 + (Math.random() > 0.5 ? 1 : -1)));
  });

  return entries;
}
