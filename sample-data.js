// Sample data script to populate localStorage with test projects
// Run this in browser console to add sample data

const sampleProjects = [
  {
    title: "고객 서비스 챗봇 개발",
    model: "GPT-4",
    registrant: "김개발",
    department: "IT개발팀",
    projectManager: "이PM",
    developers: "김개발, 박프론트, 최백엔드",
    description: "고객 문의 처리를 위한 AI 챗봇 시스템 개발\n24시간 자동 응답 서비스 구축을 통한 고객 만족도 향상",
    usagePlan: "1단계: 기본 FAQ 응답 시스템 구축\n2단계: 복잡한 문의 처리 기능 추가\n3단계: 다국어 지원 및 감정 분석 기능 도입",
    expectedEffects: "- 고객 응답 시간 80% 단축\n- 고객 서비스 운영비용 30% 절감\n- 24시간 무중단 서비스 제공",
    duration: "2024.01 ~ 2024.04 (4개월)",
    status: "pending",
    submittedAt: "2024-01-15"
  },
  {
    title: "문서 자동 요약 시스템",
    model: "Claude-3",
    registrant: "김개발",
    department: "IT개발팀",
    projectManager: "정PM",
    developers: "김개발, 이NLP",
    description: "대용량 문서의 핵심 내용을 자동으로 요약하는 AI 시스템\n업무 효율성 향상을 위한 문서 처리 자동화",
    usagePlan: "내부 보고서, 계약서, 기술 문서 등의 자동 요약\n핵심 키워드 추출 및 중요도 분석 기능 제공",
    expectedEffects: "- 문서 검토 시간 60% 단축\n- 핵심 정보 파악 정확도 향상\n- 업무 생산성 40% 증대",
    duration: "2024.02 ~ 2024.05 (3개월)",
    status: "approved",
    submittedAt: "2024-02-01",
    statusMessage: "프로젝트 승인되었습니다. 개발 환경 설정을 진행해주세요."
  },
  {
    title: "코드 리뷰 자동화 도구",
    model: "GPT-3.5-turbo",
    registrant: "김개발",
    department: "IT개발팀",
    projectManager: "김PM",
    developers: "김개발, 박시니어, 최주니어",
    description: "소스 코드의 품질을 자동으로 검토하고 개선사항을 제안하는 AI 도구\n코드 리뷰 프로세스 자동화를 통한 개발 품질 향상",
    usagePlan: "Git 연동을 통한 자동 코드 분석\n보안 취약점, 성능 이슈, 코딩 컨벤션 검토\n개선 제안 및 리팩토링 가이드 제공",
    expectedEffects: "- 코드 리뷰 시간 50% 단축\n- 버그 발생률 30% 감소\n- 코드 품질 표준화",
    duration: "2024.03 ~ 2024.06 (3개월)",
    status: "rejected",
    submittedAt: "2024-03-01",
    statusMessage: "현재 다른 우선순위 프로젝트로 인해 리소스 부족으로 반려됩니다. 다음 분기에 재신청 바랍니다."
  }
];

// Add sample projects to localStorage
const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
const updatedProjects = [...existingProjects, ...sampleProjects];
localStorage.setItem('projects', JSON.stringify(updatedProjects));

console.log('Sample projects added to localStorage!');
console.log(`Total projects: ${updatedProjects.length}`);

// Also add some sample users if needed
const sampleUsers = [
  { name: "김개발", role: "DEVELOPER" },
  { name: "이관리", role: "ADMIN" },
  { name: "박마스터", role: "MASTER" }
];

console.log('Sample data setup complete!');
console.log('Available users:', sampleUsers); 