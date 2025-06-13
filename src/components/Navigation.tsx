'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'ADMIN' | 'DEVELOPER' | 'MASTER';

interface User {
  name: string;
  role: UserRole;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  allowedRoles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    id: 'register',
    label: '과제(검증)환경 신청',
    path: '/project/register',
    icon: '✏️',
    allowedRoles: ['DEVELOPER', 'MASTER']
  },
  {
    id: 'search',
    label: '과제(검증)환경 검색',
    path: '/project/search',
    icon: '🔍',
    allowedRoles: ['ADMIN', 'MASTER']
  },
  {
    id: 'approve',
    label: '과제(검증)환경 승인',
    path: '/project/approve',
    icon: '✅',
    allowedRoles: ['ADMIN', 'MASTER']
  },
  {
    id: 'playground',
    label: 'Play Ground',
    path: '/playground',
    icon: '🎮',
    allowedRoles: ['ADMIN', 'DEVELOPER', 'MASTER']
  }
];

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser({
        name: userData.name,
        role: userData.role as UserRole
      });
      
      // Count user's projects from backend
      if (userData.role !== 'ADMIN') {
        fetchUserProjectCount();
      }
    }
  }, []);

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

  const isMenuItemVisible = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const visibleMenuItems = menuItems.filter(item => isMenuItemVisible(item.allowedRoles));

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
          {visibleMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full px-4 py-3 text-left flex items-center gap-2 ${
                pathname === item.path
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b">
          <h1 className="text-lg font-medium">
            {pathname === '/' ? 'GenAI Portal' : 
             pathname === '/project/register' ? '과제(검증)환경 신청' :
             pathname === '/project/search' ? '과제(검증)환경 검색' :
             pathname === '/project/approve' ? '과제(검증)환경 승인' :
             pathname === '/playground' ? 'Play Ground' : 'GenAI Portal'}
          </h1>
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
            <button className="border border-[#666666] text-[#666666] text-sm px-6 py-1.5 rounded">
              시스템 개선 요청
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
} 