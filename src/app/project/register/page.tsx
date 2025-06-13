'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

const AI_MODELS = [
  'GPT-4',
  'GPT-3.5-turbo',
  'Claude-3',
  'Gemini-1.5-Pro',
  'LLaMA-2'
] as const;

type UserRole = 'ADMIN' | 'DEVELOPER' | 'MASTER';

interface ProjectForm {
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
}

interface TempProject extends ProjectForm {
  id: string;
  createdAt: string;
}

type Tab = '신청' | '임시저장';

export default function ProjectRegister() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('신청');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [tempProjects, setTempProjects] = useState<TempProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ProjectForm>({
    title: '',
    model: 'GPT-4',
    registrant: '',
    department: '',
    projectManager: '',
    developers: '',
    description: '',
    usagePlan: '',
    expectedEffects: '',
    duration: ''
  });

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
      
      if (role !== 'DEVELOPER' && role !== 'MASTER') {
        // Redirect to home if not authorized
        router.push('/');
        return;
      }
      
      // Auto-fill registrant field with current user's name
      setForm(prevForm => ({
        ...prevForm,
        registrant: userData.name
      }));
      
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    // Load temporarily saved projects from backend
    if (isAuthorized) {
      loadTempProjects();
    }
  }, [isAuthorized]);

  const loadTempProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/projects/temp', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const tempProjects = await response.json();
        setTempProjects(tempProjects);
      }
    } catch (error) {
      console.error('Failed to load temp projects:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleModelSelect = (model: string) => {
    setForm(prev => ({ ...prev, model }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setModalMessage('과제 신청이 완료되었습니다.');
        setIsModalOpen(true);
        
        // 프로젝트 카운트 업데이트 이벤트 발생
        window.dispatchEvent(new CustomEvent('projectCountUpdate'));
        
        // Reset form
        setForm({
          title: '',
          model: 'GPT-4',
          registrant: form.registrant, // Keep registrant name
          department: '',
          projectManager: '',
          developers: '',
          description: '',
          usagePlan: '',
          expectedEffects: '',
          duration: ''
        });

        setTimeout(() => {
          setIsModalOpen(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setModalMessage(`오류가 발생했습니다: ${errorData.message}`);
        setIsModalOpen(true);
        setTimeout(() => {
          setIsModalOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit project:', error);
      setModalMessage('네트워크 오류가 발생했습니다.');
      setIsModalOpen(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemporarySave = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/projects/temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setModalMessage('임시 저장되었습니다.');
        setIsModalOpen(true);
        
        // Reload temp projects
        await loadTempProjects();

        setTimeout(() => {
          setIsModalOpen(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setModalMessage(`오류가 발생했습니다: ${errorData.message}`);
        setIsModalOpen(true);
        setTimeout(() => {
          setIsModalOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to save temp project:', error);
      setModalMessage('네트워크 오류가 발생했습니다.');
      setIsModalOpen(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTempProject = (project: TempProject) => {
    const { id, createdAt, ...projectData } = project;
    setForm({
      title: projectData.title || '',
      model: projectData.model || 'GPT-4',
      registrant: projectData.registrant || '',
      department: projectData.department || '',
      projectManager: projectData.projectManager || '',
      developers: projectData.developers || '',
      description: projectData.description || '',
      usagePlan: projectData.usagePlan || '',
      expectedEffects: projectData.expectedEffects || '',
      duration: projectData.duration || ''
    });
    setActiveTab('신청');
  };

  const handleDeleteTempProject = async (tempProjectId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/projects/temp/${tempProjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Reload temp projects
        await loadTempProjects();
      } else {
        console.error('Failed to delete temp project');
      }
    } catch (error) {
      console.error('Failed to delete temp project:', error);
    }
  };

  if (!isAuthorized) {
    return null; // Or loading spinner
  }

  return (
    <Navigation>
      {/* Tab Navigation */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('신청')}
              className={`py-4 px-6 font-medium text-sm relative ${
                activeTab === '신청'
                  ? 'text-[#E31C79]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              과제 신청
              {activeTab === '신청' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31C79]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('임시저장')}
              className={`py-4 px-6 font-medium text-sm relative ${
                activeTab === '임시저장'
                  ? 'text-[#E31C79]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              임시 저장된 과제
              {activeTab === '임시저장' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31C79]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === '신청' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title and Model Selection */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    과제명 *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LLM 모델 *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-2 border rounded flex justify-between items-center hover:bg-gray-50"
                    >
                      <span>{form.model}</span>
                      <span>▼</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-10">
                        {AI_MODELS.map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => handleModelSelect(model)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    과제 발의 등록자 *
                  </label>
                  <input
                    type="text"
                    name="registrant"
                    value={form.registrant}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    과제 등록 부서 *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    과제 PM *
                  </label>
                  <input
                    type="text"
                    name="projectManager"
                    value={form.projectManager}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    과제 개발 참여자 *
                  </label>
                  <input
                    type="text"
                    name="developers"
                    value={form.developers}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                    placeholder="참여자 이름을 쉼표로 구분하여 입력"
                  />
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제 설명 및 정보 *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제 활용 계획 *
                </label>
                <textarea
                  name="usagePlan"
                  value={form.usagePlan}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제의 기대 효과 *
                </label>
                <textarea
                  name="expectedEffects"
                  value={form.expectedEffects}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제 예상 기간 *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E31C79]"
                  placeholder="예: 2024.03 ~ 2024.06 (3개월)"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleTemporarySave}
                  disabled={isLoading}
                  className="px-6 py-2 border border-[#E31C79] text-[#E31C79] rounded hover:bg-[#fdf2f7] transition-colors disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '임시 저장'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#E31C79] text-white rounded hover:bg-[#d31970] transition-colors disabled:opacity-50"
                >
                  {isLoading ? '신청 중...' : '신청하기'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {tempProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  임시 저장된 과제가 없습니다.
                </div>
              ) : (
                tempProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-2">
                          {project.title || '제목 없음'}
                        </h3>
                        <div className="text-sm text-gray-500 grid grid-cols-2 gap-4">
                          <div>
                            <p>LLM 모델: {project.model || '-'}</p>
                            <p>등록자: {project.registrant || '-'}</p>
                          </div>
                          <div>
                            <p>부서: {project.department || '-'}</p>
                            <p>저장일: {new Date(project.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadTempProject(project)}
                          className="px-3 py-1 text-sm bg-[#E31C79] text-white rounded hover:bg-[#d31970] transition-colors"
                        >
                          불러오기
                        </button>
                        <button
                          onClick={() => handleDeleteTempProject(project.id)}
                          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <p className="text-center text-gray-700 pr-6">{modalMessage}</p>
          </div>
        </div>
      )}
    </Navigation>
  );
} 