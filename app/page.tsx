'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Users, BarChart3, Settings } from 'lucide-react';

type Student = {
  id: string;
  name: string;
  career1: string;
  career2: string;
  discType: 'D' | 'I' | 'S' | 'C' | null;
  discScores: { D: number; I: number; S: number; C: number };
};

type Group = {
  id: string;
  name: string;
  students: Student[];
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'input' | 'disc' | 'sorting' | 'result' | 'admin'>('welcome');
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [sortingStudent, setSortingStudent] = useState<Student | null>(null);

  const careerOptions = [
    '의료/보건', 'IT/컴퓨터', '경영/경제', '법률/정치', '교육/연구', '예술/디자인', '공학/기술', '언론/미디어', '서비스/판매', '기타'
  ];

  const discQuestions: { id: number; question: string; category: 'D' | 'I' | 'S' | 'C' }[] = [
    { id: 1, question: '새로운 도전을 즐기는 편인가요?', category: 'D' },
    { id: 2, question: '사람들과 어울리는 것을 좋아하나요?', category: 'I' },
    { id: 3, question: '조용히 혼자 있는 시간이 필요한가요?', category: 'S' },
    { id: 4, question: '정확하고 체계적인 것을 선호하나요?', category: 'C' },
    { id: 5, question: '빠르게 결정을 내리는 편인가요?', category: 'D' },
    { id: 6, question: '다른 사람의 감정을 잘 이해하나요?', category: 'I' },
    { id: 7, question: '안정적인 환경을 선호하나요?', category: 'S' },
    { id: 8, question: '세부사항에 주의를 기울이나요?', category: 'C' },
    { id: 9, question: '경쟁적인 상황을 즐기나요?', category: 'D' },
    { id: 10, question: '새로운 사람을 만나는 것을 좋아하나요?', category: 'I' },
    { id: 11, question: '변화보다는 익숙한 것을 선호하나요?', category: 'S' },
    { id: 12, question: '규칙과 절차를 중요하게 생각하나요?', category: 'C' },
    { id: 13, question: '직접적으로 의견을 표현하나요?', category: 'D' },
    { id: 14, question: '긍정적인 분위기를 만드는 편인가요?', category: 'I' },
    { id: 15, question: '갈등을 피하려고 하나요?', category: 'S' },
    { id: 16, question: '완벽함을 추구하나요?', category: 'C' },
    { id: 17, question: '결과보다는 과정을 중요하게 생각하나요?', category: 'S' },
    { id: 18, question: '즉흥적인 계획을 선호하나요?', category: 'I' },
    { id: 19, question: '논리적이고 분석적인가요?', category: 'C' },
    { id: 20, question: '도전적인 목표를 설정하나요?', category: 'D' },
  ];

  const calculateDiscType = (scores: { D: number; I: number; S: number; C: number }) => {
    const maxScore = Math.max(scores.D, scores.I, scores.S, scores.C);
    if (scores.D === maxScore) return 'D';
    if (scores.I === maxScore) return 'I';
    if (scores.S === maxScore) return 'S';
    return 'C';
  };

  const createBalancedGroups = (students: Student[], groupCount: number = 4) => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groups: Group[] = [];
    
    for (let i = 0; i < groupCount; i++) {
      groups.push({
        id: `group-${i + 1}`,
        name: `${i + 1}조`,
        students: []
      });
    }

    // DISC 유형과 진로를 고려한 균형잡힌 배정
    shuffled.forEach((student, index) => {
      const targetGroup = groups[index % groupCount];
      targetGroup.students.push(student);
    });

    return groups;
  };

  const handleStudentSubmit = () => {
    if (!currentStudent.name || !currentStudent.career1 || !currentStudent.career2) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    setCurrentStep('disc');
  };

  const handleDiscComplete = (scores: { D: number; I: number; S: number; C: number }) => {
    const discType = calculateDiscType(scores);
    const newStudent: Student = {
      id: Date.now().toString(),
      name: currentStudent.name!,
      career1: currentStudent.career1!,
      career2: currentStudent.career2!,
      discType,
      discScores: scores
    };

    setSortingStudent(newStudent);
    setCurrentStep('sorting');
    
    // 9초 후 조배정 완료 (소팅햇 애니메이션 완료 후)
    setTimeout(() => {
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      
      // 임시 조편성
      const tempGroups = createBalancedGroups(updatedStudents);
      setGroups(tempGroups);
      
      setCurrentStudent({});
      setSortingStudent(null);
      setCurrentStep('result');
    }, 9000);
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    // 로컬 스토리지에 저장
    localStorage.setItem('finalizedGroups', JSON.stringify(groups));
    localStorage.setItem('finalizedStudents', JSON.stringify(students));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Wand2 className="text-yellow-300" />
            마법의 조배정 시스템
            <Wand2 className="text-yellow-300" />
          </h1>
          <p className="text-blue-200">DISC 성격 유형과 진로를 고려한 지능형 조편성</p>
        </motion.div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'welcome' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold mb-4">환영합니다!</h2>
                <p className="text-lg mb-6">소팅햇처럼 마법적인 조배정을 경험해보세요.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                    <h3 className="font-semibold">학생용</h3>
                                         <p className="text-sm text-blue-200">정보 입력 및 DISC 검사</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-300" />
                    <h3 className="font-semibold">관리자용</h3>
                                         <p className="text-sm text-green-200">조편성 관리 및 통계</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setCurrentStep('input')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    학생 정보 입력하기
                  </button>
                  <button
                    onClick={() => setCurrentStep('admin')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    관리자 대시보드
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'input' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">학생 정보 입력</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">이름</label>
                  <input
                    type="text"
                    value={currentStudent.name || ''}
                    onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">진로 1순위</label>
                  <select
                    value={currentStudent.career1 || ''}
                    onChange={(e) => setCurrentStudent({...currentStudent, career1: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">선택하세요</option>
                    {careerOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">진로 2순위</label>
                  <select
                    value={currentStudent.career2 || ''}
                    onChange={(e) => setCurrentStudent({...currentStudent, career2: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">선택하세요</option>
                    {careerOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
                    뒤로가기
                  </button>
                  <button
                    onClick={handleStudentSubmit}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    DISC 검사 시작
                  </button>
                </div>
              </div>
            </motion.div>
          )}

                     {currentStep === 'disc' && (
             <DiscTest onComplete={handleDiscComplete} questions={discQuestions} />
           )}

           {currentStep === 'sorting' && (
             <SortingHat sortingStudent={sortingStudent} />
           )}

                      {currentStep === 'result' && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-6"
             >
               <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                 <div className="text-center mb-6">
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                     className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brown-600 to-brown-800 rounded-full flex items-center justify-center"
                   >
                     <span className="text-2xl">🎩</span>
                   </motion.div>
                   <h2 className="text-2xl font-bold mb-2 text-yellow-300">소팅햇의 결정!</h2>
                   <p className="text-blue-200 mb-2">당신의 조가 배정되었습니다</p>
                   <p className="text-yellow-300 font-medium text-sm">⚠️ 임시 배정 - 추가 학생 입력 시 변경될 수 있음</p>
                 </div>
                
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {groups.map((group) => (
                     <div key={group.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 border border-white/10">
                       <h3 className="text-lg font-semibold mb-3 text-center text-blue-200">{group.name}</h3>
                       <div className="space-y-2">
                         {group.students.map((student) => (
                           <div key={student.id} className="flex justify-between items-center bg-white/10 rounded p-3 hover:bg-white/15 transition-colors">
                             <span className="font-medium">{student.name}</span>
                             <div className="flex gap-2">
                               <span className="px-2 py-1 rounded text-xs bg-gradient-to-r from-purple-600 to-purple-700 font-medium">{student.discType}</span>
                               <span className="px-2 py-1 rounded text-xs bg-gradient-to-r from-blue-600 to-blue-700 font-medium">{student.career1}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>

                <div className="flex gap-4 justify-center mt-6">
                  <button
                    onClick={() => setCurrentStep('input')}
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    추가 학생 입력
                  </button>
                  <button
                    onClick={() => setCurrentStep('admin')}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
          >
                    관리자 대시보드
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'admin' && (
            <AdminDashboard 
              students={students}
              groups={groups}
              isFinalized={isFinalized}
              onFinalize={handleFinalize}
              onBack={() => setCurrentStep('welcome')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// DISC 검사 컴포넌트
function DiscTest({ onComplete, questions }: { 
  onComplete: (scores: { D: number; I: number; S: number; C: number }) => void;
  questions: { id: number; question: string; category: 'D' | 'I' | 'S' | 'C' }[];
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (value: number) => {
    setSelectedAnswer(value);
    
    setTimeout(() => {
      const category = questions[currentQuestion].category;
      setScores(prev => ({
        ...prev,
        [category]: prev[category as keyof typeof prev] + value
      }));

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        onComplete(scores);
      }
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">DISC 성격 유형 검사</h2>
                 <p className="text-blue-200">진솔하게 답변해주세요</p>
        <div className="w-full bg-white/10 rounded-full h-2 mt-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-sm mt-2">{currentQuestion + 1} / {questions.length}</p>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-6">{questions[currentQuestion].question}</h3>
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              disabled={selectedAnswer !== null}
              className={`px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                selectedAnswer === value 
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg scale-105' 
                  : selectedAnswer !== null 
                    ? 'bg-white/5 text-gray-400 cursor-not-allowed' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <div className="font-medium">
                {value === 1 ? '전혀 그렇지 않다' : 
                 value === 2 ? '그렇지 않다' : 
                 value === 3 ? '보통이다' : 
                 value === 4 ? '그렇다' : '매우 그렇다'}
              </div>
            </button>
          ))}
        </div>
        {selectedAnswer !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-white/10 rounded-lg"
          >
            <p className="text-sm text-blue-200">
              다음 질문으로 넘어갑니다...
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// 소팅햇 컴포넌트
function SortingHat({ sortingStudent }: { sortingStudent: Student | null }) {
  const [currentPhase, setCurrentPhase] = useState<'thinking' | 'speaking' | 'deciding'>('thinking');
  const [hatText, setHatText] = useState('');
  
  const hatPhrases = [
    "흠... 흥미로운 학생이군요.",
    `${sortingStudent?.name}... DISC 유형은 ${sortingStudent?.discType}형...`,
    "진로는 ${sortingStudent?.career1}... 흠...",
    "어떤 조가 가장 적합할까요?",
    "균형잡힌 조편성을 위해...",
    "아하! 결정했습니다!"
  ];

  useEffect(() => {
    if (!sortingStudent) return;

    // 1단계: 생각하는 단계
    setTimeout(() => {
      setCurrentPhase('speaking');
      setHatText(hatPhrases[0]);
    }, 1000);

    // 2단계: 말하는 단계
    setTimeout(() => {
      setHatText(hatPhrases[1].replace('${sortingStudent?.name}', sortingStudent.name).replace('${sortingStudent?.discType}', sortingStudent.discType || ''));
    }, 2500);

    setTimeout(() => {
      setHatText(hatPhrases[2].replace('${sortingStudent?.career1}', sortingStudent.career1));
    }, 4000);

    setTimeout(() => {
      setHatText(hatPhrases[3]);
    }, 5500);

    setTimeout(() => {
      setHatText(hatPhrases[4]);
    }, 7000);

    // 3단계: 결정하는 단계
    setTimeout(() => {
      setCurrentPhase('deciding');
      setHatText(hatPhrases[5]);
    }, 8500);
  }, [sortingStudent]);

  if (!sortingStudent) return null;

  return (
         <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 flex items-center justify-center"
        >
      <div className="text-center space-y-8">
        {/* 마법 모자 */}
        <motion.div
          animate={{ 
            rotate: currentPhase === 'thinking' ? [0, 5, -5, 0] : 0,
            scale: currentPhase === 'deciding' ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 2, repeat: currentPhase === 'thinking' ? Infinity : 0 },
            scale: { duration: 0.5, repeat: currentPhase === 'deciding' ? 3 : 0 }
          }}
          className="relative"
        >
          <div className="w-32 h-32 mx-auto mb-4">
            <div className="w-full h-full bg-gradient-to-br from-brown-600 to-brown-800 rounded-full relative overflow-hidden">
              {/* 모자 장식 */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-br from-gold-400 to-yellow-600 rounded-t-full"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gradient-to-br from-red-600 to-red-800 rounded-t-full"></div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gradient-to-br from-green-600 to-green-800 rounded-t-full"></div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-t-full"></div>
              
              {/* 마법 효과 */}
              {currentPhase === 'thinking' && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full"
                />
              )}
              
              {currentPhase === 'deciding' && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* 학생 정보 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">소팅햇이 생각중입니다...</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                             <span className="text-blue-200">이름:</span>
              <span className="font-semibold text-white">{sortingStudent.name}</span>
            </div>
            <div className="flex justify-between items-center">
                             <span className="text-blue-200">DISC 유형:</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium">
                {sortingStudent.discType}형
              </span>
            </div>
            <div className="flex justify-between items-center">
                             <span className="text-blue-200">진로:</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium">
                {sortingStudent.career1}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 소팅햇 대사 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brown-600 to-brown-800 rounded-full"></div>
            <span className="text-lg font-semibold text-yellow-300">소팅햇</span>
          </div>
          <motion.p
            key={hatText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg text-white leading-relaxed"
        >
            {hatText}
          </motion.p>
        </motion.div>

        {/* 로딩 애니메이션 */}
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
                     className="text-blue-200"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 관리자 대시보드 컴포넌트
function AdminDashboard({ 
  students, 
  groups, 
  isFinalized, 
  onFinalize, 
  onBack 
}: {
  students: Student[];
  groups: Group[];
  isFinalized: boolean;
  onFinalize: () => void;
  onBack: () => void;
}) {
  const discStats = {
    D: students.filter(s => s.discType === 'D').length,
    I: students.filter(s => s.discType === 'I').length,
    S: students.filter(s => s.discType === 'S').length,
    C: students.filter(s => s.discType === 'C').length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">관리자 대시보드</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            뒤로가기
          </button>
        </div>

                 {/* 통계 */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 text-center border border-blue-400/30">
             <div className="text-2xl font-bold text-blue-300">{students.length}</div>
             <div className="text-sm text-blue-200">전체 학생</div>
           </div>
           <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 text-center border border-green-400/30">
             <div className="text-2xl font-bold text-green-300">{groups.length}</div>
             <div className="text-sm text-green-200">조 수</div>
           </div>
           <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 text-center border border-yellow-400/30">
             <div className="text-2xl font-bold text-yellow-300">{groups.length > 0 ? Math.ceil(students.length / groups.length) : '-'}</div>
             <div className="text-sm text-yellow-200">조당 인원</div>
           </div>
           <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 text-center border border-purple-400/30">
             <div className="text-2xl font-bold text-purple-300">{isFinalized ? '확정' : '임시'}</div>
             <div className="text-sm text-blue-200">상태</div>
           </div>
         </div>

                 {/* DISC 분포 */}
         <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 mb-6 border border-white/10">
           <h3 className="text-lg font-semibold mb-4 text-blue-200">DISC 유형 분포</h3>
           <div className="grid grid-cols-4 gap-4">
             {Object.entries(discStats).map(([type, count]) => (
               <div key={type} className="text-center bg-white/5 rounded-lg p-3">
                 <div className="text-2xl font-bold text-blue-300">{count}</div>
                 <div className="text-sm text-blue-200 font-medium">{type}형</div>
               </div>
             ))}
           </div>
         </div>

                 {/* 조별 현황 */}
         <div className="space-y-4">
           <h3 className="text-lg font-semibold text-blue-200">조별 현황</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {groups.map((group) => (
               <div key={group.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 border border-white/10">
                 <h4 className="font-semibold mb-3 text-blue-200">{group.name}</h4>
                 <div className="space-y-2">
                   {group.students.map((student) => (
                     <div key={student.id} className="flex justify-between items-center text-sm bg-white/5 rounded p-2 hover:bg-white/10 transition-colors">
                       <span className="font-medium">{student.name}</span>
                       <div className="flex gap-1">
                         <span className="px-2 py-1 rounded text-xs bg-gradient-to-r from-purple-600 to-purple-700 font-medium">{student.discType}</span>
                         <span className="px-2 py-1 rounded text-xs bg-gradient-to-r from-blue-600 to-blue-700 font-medium">{student.career1}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         </div>

        {/* 최종 확정 버튼 */}
        {!isFinalized && students.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={onFinalize}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              최종 확정하기
            </button>
          </div>
        )}
    </div>
    </motion.div>
  );
}
