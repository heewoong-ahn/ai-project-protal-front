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

export default function ProjectSearch() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check role authorization - only ADMIN and MASTER can access search
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      if (userData.role === 'DEVELOPER') {
        router.push('/');
        return;
      }
    }
    
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchProjects = async (query?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const searchParams = new URLSearchParams();
      
      if (query && query.trim()) {
        searchParams.append('q', query.trim());
      }
      
      const response = await fetch(`http://localhost:4000/projects/search?${searchParams.toString()}`, {
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
      console.error('Failed to fetch projects:', error);
      setError(error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchProjects(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Remove client-side filtering since backend handles search
  const filteredProjects = projects;

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
    return null; // Or loading spinner
  }

  return (
    <Navigation>
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="과제명으로 검색"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Project List */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">검색 중...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500">{error}</div>
              <button 
                onClick={() => fetchProjects(searchTerm)}
                className="mt-4 text-[#E31C79] hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? '검색된 과제가 없습니다.' : '등록된 과제가 없습니다.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium mb-2">{project.title}</h2>
                      <div className="text-sm text-gray-500">
                        <p>신청자: {project.registrant}</p>
                        <p>신청일: {new Date(project.submittedAt).toLocaleDateString('ko-KR')}</p>
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