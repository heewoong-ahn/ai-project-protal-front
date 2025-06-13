'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface Project {
  id: string;
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  statusMessage?: string;
}

export default function MyProjects() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get current user info
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      
      // ADMIN users cannot access this page (they don't submit projects)
      if (userData.role === 'ADMIN') {
        router.push('/');
        return;
      }
      
      setCurrentUser(userData.name);
    }
    
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    // Load user's projects from backend
    if (currentUser) {
      loadUserProjects();
    }
  }, [currentUser]);

  const loadUserProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/projects/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userProjects = await response.json();
        setProjects(userProjects);
      } else {
        throw new Error('프로젝트를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to load user projects:', error);
      setError(error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '반려됨';
      default:
        return '검토중';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Navigation>
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">나의 과제 신청 현황</h1>
              <p className="text-gray-600">총 {projects.length}건의 과제를 신청하셨습니다.</p>
            </div>
            <button
              onClick={loadUserProjects}
              disabled={loading}
              className="px-4 py-2 bg-[#E31C79] text-white rounded hover:bg-[#d31970] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500">{error}</div>
              <button 
                onClick={loadUserProjects}
                className="mt-4 text-[#E31C79] hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">📋</div>
              <p className="mb-2">신청한 과제가 없습니다.</p>
              <button
                onClick={() => router.push('/project/register')}
                className="text-[#E31C79] hover:underline"
              >
                과제 신청하러 가기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-lg font-medium mb-2">{project.title}</h2>
                      <div className="text-sm text-gray-500 grid grid-cols-2 gap-4">
                        <div>
                          <p>LLM 모델: {project.model}</p>
                          <p>신청일: {new Date(project.submittedAt).toLocaleDateString('ko-KR')}</p>
                        </div>
                        <div>
                          <p>부서: {project.department}</p>
                          <p>PM: {project.projectManager}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-medium">{selectedProject.title}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">LLM 모델</p>
                    <p className="font-medium">{selectedProject.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">상태</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedProject.status)}`}>
                      {getStatusText(selectedProject.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">신청자</p>
                    <p className="font-medium">{selectedProject.registrant}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">부서</p>
                    <p className="font-medium">{selectedProject.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">PM</p>
                    <p className="font-medium">{selectedProject.projectManager}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">개발 참여자</p>
                    <p className="font-medium">{selectedProject.developers}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">신청일</p>
                    <p className="font-medium">{new Date(selectedProject.submittedAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">예상 기간</p>
                    <p className="font-medium">{selectedProject.duration}</p>
                  </div>
                </div>

                {selectedProject.status !== 'PENDING' && selectedProject.statusMessage && (
                  <div className={`p-4 rounded-lg ${
                    selectedProject.status === 'APPROVED' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <h3 className={`font-medium mb-2 ${
                      selectedProject.status === 'APPROVED' 
                        ? 'text-green-800' 
                        : 'text-red-800'
                    }`}>
                      {selectedProject.status === 'APPROVED' ? '승인 메시지' : '반려 메시지'}
                    </h3>
                    <p className={`${
                      selectedProject.status === 'APPROVED' 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {selectedProject.statusMessage}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">과제 설명 및 정보</h3>
                  <p className="whitespace-pre-line">{selectedProject.description}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">과제 활용 계획</h3>
                  <p className="whitespace-pre-line">{selectedProject.usagePlan}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">기대 효과</h3>
                  <p className="whitespace-pre-line">{selectedProject.expectedEffects}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Navigation>
  );
} 