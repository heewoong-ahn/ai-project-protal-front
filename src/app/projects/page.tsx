'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  title: string;
  model: string;
  registrant: string;
  department: string;
  projectManager: string;
  developers: string;
  description: string;
  usagePlan: string;
  expectedEffects: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  statusMessage?: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 로컬 스토리지에서 프로젝트 목록 불러오기
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return '검토중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '반려됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Side Menu */}
      <div className="w-64 bg-white border-r flex flex-col">
        <button
          onClick={() => router.push('/')}
          className="p-4 text-xl font-semibold text-[#E31C79] hover:bg-gray-50 text-left"
        >
          GenAI Portal
        </button>
        <nav className="flex-1 pt-4">
          <div className="px-4 py-2 text-sm font-medium text-gray-500">메뉴</div>
          <button
            onClick={() => router.push('/project/register')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <span>✏️</span>
            <span>과제(검증)환경 신청</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <span>🔍</span>
            <span>과제(검증)환경 검색</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <span>✅</span>
            <span>과제(검증)환경 승인</span>
          </button>
          <button
            onClick={() => router.push('/playground')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <span>🎮</span>
            <span>Play Ground</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b">
          <h1 className="text-lg font-medium">나의 과제 신청 내역</h1>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
            >
              <span className="text-sm">나의 과제 신청 건 수</span>
              <span className="bg-[#E31C79] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {projects.length}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#E31C79] text-white text-sm px-6 py-1.5 rounded"
            >
              Log Out
            </button>
            <button className="border border-[#666666] text-[#666666] text-sm px-6 py-1.5 rounded">
              시스템 개선 요청
            </button>
          </div>
        </header>

        {/* Project List */}
        <main className="p-8">
          <div className="max-w-5xl mx-auto">
            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                신청한 과제가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-medium mb-2">{project.title}</h2>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>신청일: {project.submittedAt}</p>
                          <p>LLM 모델: {project.model}</p>
                          <p>등록자: {project.registrant} | 부서: {project.department}</p>
                          <p>PM: {project.projectManager}</p>
                          <p>개발 참여자: {project.developers}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">과제 설명 및 정보</h3>
                        <p className="whitespace-pre-line">{project.description}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">과제 활용 계획</h3>
                        <p className="whitespace-pre-line">{project.usagePlan}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">기대 효과</h3>
                        <p className="whitespace-pre-line">{project.expectedEffects}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">예상 기간</h3>
                        <p>{project.duration}</p>
                      </div>
                      {project.status !== 'pending' && project.statusMessage && (
                        <div className={`p-4 rounded-lg ${
                          project.status === 'approved' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <h3 className={`font-medium mb-2 ${
                            project.status === 'approved' 
                              ? 'text-green-800' 
                              : 'text-red-800'
                          }`}>
                            {project.status === 'approved' ? '승인 메시지' : '반려 메시지'}
                          </h3>
                          <p className={`${
                            project.status === 'approved' 
                              ? 'text-green-700' 
                              : 'text-red-700'
                          }`}>
                            {project.statusMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 