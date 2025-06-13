'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'ADMIN' | 'DEVELOPER' | 'MASTER';

interface User {
  name: string;
  role: UserRole;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myProjectCount, setMyProjectCount] = useState<number>(0);

  const fetchUserProjectCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/projects/my/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyProjectCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch project count:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser({
      name: userData.name,
      role: userData.role as UserRole
    });
    
    // Count user's projects from backend
    if (userData.role !== 'ADMIN') {
      fetchUserProjectCount();
    }

    // Optional: Verify token with backend
    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:4000/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    };

    verifyToken();
  }, [router]);

  // 프로젝트 카운트 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleProjectCountUpdate = () => {
      if (user?.role !== 'ADMIN') {
        fetchUserProjectCount();
      }
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener('projectCountUpdate', handleProjectCountUpdate);
    
    // 페이지 포커스 시에도 업데이트 (다른 탭에서 돌아왔을 때)
    window.addEventListener('focus', handleProjectCountUpdate);

    return () => {
      window.removeEventListener('projectCountUpdate', handleProjectCountUpdate);
      window.removeEventListener('focus', handleProjectCountUpdate);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Function to check if a feature should be visible based on user role
  const isFeatureVisible = (feature: 'register' | 'search' | 'approve') => {
    if (!user) return false;
    
    switch (feature) {
      case 'register':
        return user.role === 'DEVELOPER' || user.role === 'MASTER';
      case 'approve':
        return user.role === 'ADMIN' || user.role === 'MASTER';
      case 'search':
        return user.role === 'ADMIN' || user.role === 'MASTER'; // Only ADMIN and MASTER can search
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-16">
        <h1 className="text-[#E31C79] text-2xl font-bold">GenAI Portal</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            {/* User Name and Role Display */}
            <div className="flex flex-col items-end">
              <span className="text-gray-700 font-medium">{user?.name}</span>
              <span className="text-sm text-gray-500">{user?.role}</span>
            </div>
            {/* Show project count only for DEVELOPER and MASTER */}
            {user?.role !== 'ADMIN' && (
              <button 
                onClick={() => router.push('/my-projects')}
                className="flex items-center hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                title="나의 과제 신청 현황 보기"
              >
                <span className="text-sm">나의 과제 신청 건 수</span>
                <span className="ml-2 bg-[#E31C79] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {myProjectCount}
                </span>
              </button>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-[#E31C79] text-white text-sm px-6 py-1.5 rounded"
          >
            Log Out
          </button>
          <button className="border border-[#666666] text-[#666666] text-sm px-6 py-1.5 rounded">시스템 개선 요청</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-medium mb-16">
          GenAI Portal에서는 과제를 신청하고<br />
          관리할 수 있습니다.
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Project Registration - Only for DEVELOPER and MASTER */}
          {isFeatureVisible('register') && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-[#E31C79]">✏️</div>
                <h3 className="font-medium">과제(검증)환경 신청</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt</p>
              <button 
                onClick={() => router.push('/project/register')}
                className="text-[#E31C79] border border-[#E31C79] text-sm px-4 py-1 rounded-full hover:bg-[#fdf2f7] transition-colors"
              >
                신청하기
              </button>
            </div>
          )}

          {/* Project Search - Available for all roles */}
          {isFeatureVisible('search') && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-[#E31C79]">🔍</div>
                <h3 className="font-medium">과제(검증)환경 검색</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt</p>
              <button 
                onClick={() => router.push('/project/search')}
                className="text-[#E31C79] border border-[#E31C79] text-sm px-4 py-1 rounded-full hover:bg-[#fdf2f7] transition-colors"
              >
                검색하기
              </button>
            </div>
          )}

          {/* Project Approval - Only for ADMIN and MASTER */}
          {isFeatureVisible('approve') && (
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-[#E31C79]">✅</div>
                <h3 className="font-medium">과제(검증)환경 승인</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt</p>
              <button 
                onClick={() => router.push('/project/approve')}
                className="text-[#E31C79] border border-[#E31C79] text-sm px-4 py-1 rounded-full hover:bg-[#fdf2f7] transition-colors"
              >
                승인하기
              </button>
            </div>
          )}

          {/* Play Ground */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[#E31C79]">🎮</div>
              <h3 className="font-medium">Play Ground</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt</p>
            <button 
              onClick={() => router.push('/playground')}
              className="text-[#E31C79] border border-[#E31C79] text-sm px-4 py-1 rounded-full hover:bg-[#fdf2f7] transition-colors"
            >
              이동하기
            </button>
          </div>

          {/* Manual Download */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[#E31C79]">⬇️</div>
              <h3 className="font-medium">매뉴얼 다운로드</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt</p>
            <a 
              href="/manual.txt" 
              download="GenAI_Portal_Manual.txt"
              className="text-[#E31C79] border border-[#E31C79] text-sm px-4 py-1 rounded-full hover:bg-[#fdf2f7] transition-colors inline-block"
            >
              다운로드
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
