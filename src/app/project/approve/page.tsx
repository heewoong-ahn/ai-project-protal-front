'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

type UserRole = 'ADMIN' | 'DEVELOPER' | 'MASTER';

interface Project {
  id: string;
  title: string;
  registrant: string;
  department: string;
  projectManager: string;
  developers: string;
  submittedAt: string;
  model: string;
  description: string;
  usagePlan: string;
  expectedEffects: string;
  duration: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusMessage?: string;
}

export default function ProjectApprove() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and authorization
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check user role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      const role = userData.role as UserRole;
      
      if (role !== 'ADMIN' && role !== 'MASTER') {
        // Redirect to home if not authorized
        router.push('/');
        return;
      }
      
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchPendingProjects();
    }
  }, [isAuthorized]);

  const fetchPendingProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/projects/status/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('프로젝트를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch pending projects:', error);
      setError(error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!selectedProject || !approvalMessage.trim()) return;

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/projects/${selectedProject.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          statusMessage: approvalMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('상태 업데이트에 실패했습니다.');
      }

      // Remove the updated project from the pending list
      setProjects(projects.filter(project => project.id !== selectedProject.id));
      setSelectedProject(null);
      setApprovalMessage('');
      
      const message = status === 'approved' ? '과제가 승인되었습니다.' : '과제가 반려되었습니다.';
      setModalMessage(message);
      setIsModalOpen(true);
      
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update project status:', error);
      setError(error instanceof Error ? error.message : '상태 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return null; // Or loading spinner
  }

  return (
    <Navigation>
      {/* Project List */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">과제(검증)환경 승인</h1>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500">{error}</div>
              <button 
                onClick={fetchPendingProjects}
                className="mt-4 text-[#E31C79] hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              검토할 과제가 없습니다.
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
                    <div>
                      <h2 className="text-lg font-medium mb-2">{project.title}</h2>
                      <div className="text-sm text-gray-500">
                        <p>신청자: {project.registrant}</p>
                        <p>신청일: {new Date(project.submittedAt).toLocaleDateString('ko-KR')}</p>
                        <p>LLM 모델: {project.model}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      검토중
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal with Approval/Reject Options */}
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
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      검토중
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

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-500 mb-2">승인/반려 메시지</h3>
                  <textarea
                    value={approvalMessage}
                    onChange={(e) => setApprovalMessage(e.target.value)}
                    placeholder="승인 또는 반려 사유를 입력해주세요."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31C79] mb-4"
                    rows={3}
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      className="px-6 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!approvalMessage.trim() || loading}
                    >
                      {loading ? '처리 중...' : '반려하기'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      className="px-6 py-2 bg-[#E31C79] text-white rounded hover:bg-[#d31970] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!approvalMessage.trim() || loading}
                    >
                      {loading ? '처리 중...' : '승인하기'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <p className="text-lg pr-6">{modalMessage}</p>
          </div>
        </div>
      )}
    </Navigation>
  );
} 