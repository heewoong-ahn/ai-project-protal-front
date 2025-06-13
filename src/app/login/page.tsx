'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Save the token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to home page with force refresh
      window.location.href = '/';
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-semibold mb-10">로그인</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="w-[405px] space-y-4">
        {/* Email Input */}
        <div className="relative">
          <div className="w-full h-[60px] bg-[#FBFBFB] rounded-[10px] shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]">
            <div className="absolute left-3 top-[18px]">
              <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 10.5C16.4853 10.5 18.5 8.48528 18.5 6C18.5 3.51472 16.4853 1.5 14 1.5C11.5147 1.5 9.5 3.51472 9.5 6C9.5 8.48528 11.5147 10.5 14 10.5Z" stroke="#AEAEAE" strokeWidth="2"/>
                <path d="M21 22.5C21 18.3579 17.8421 15 14 15C10.1579 15 7 18.3579 7 22.5" stroke="#AEAEAE" strokeWidth="2"/>
              </svg>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-full px-16 text-xl font-light bg-transparent outline-none"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="w-full h-[60px] bg-[#FBFBFB] rounded-[10px] shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]">
            <div className="absolute left-3 top-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 11C5 8.17157 5 6.75736 5.87868 5.87868C6.75736 5 8.17157 5 11 5H13C15.8284 5 17.2426 5 18.1213 5.87868C19 6.75736 19 8.17157 19 11V13C19 15.8284 19 17.2426 18.1213 18.1213C17.2426 19 15.8284 19 13 19H11C8.17157 19 6.75736 19 5.87868 18.1213C5 17.2426 5 15.8284 5 13V11Z" stroke="#AEAEAE" strokeWidth="2"/>
                <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12Z" stroke="#AEAEAE" strokeWidth="2"/>
              </svg>
            </div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-full px-16 text-xl font-light bg-transparent outline-none"
              required
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full h-[52px] bg-[#ED9393] hover:bg-[#EF1F1F] active:bg-[#C4A5A5] rounded-[20px] text-white text-3xl font-extrabold transition-colors mt-8"
        >
          Log In
        </button>
      </form>
    </div>
  );
} 