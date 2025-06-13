'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

const AI_MODELS = [
  'Gemini-1.5-Pro',
  'Claude 3.5 Sonnet',
  'GPT-4',
  'Jamba'
] as const;

type AIModel = typeof AI_MODELS[number];

export default function Playground() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('Claude 3.5 Sonnet');
  const [prompt, setPrompt] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 스크롤 자동 이동을 위한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
  }, [router]);

  // 스크롤 자동 이동 함수
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // 대화 기록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // 사용자 메시지를 대화 기록에 추가
    const userMessage = { role: 'user', content: prompt };
    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);
    setPrompt(''); // 입력창 비우기
    
    try {
      // Claude 3.5 Sonnet이 선택된 경우만 실제 API 호출
      if (selectedModel === 'Claude 3.5 Sonnet') {
        const response = await fetch('http://localhost:4000/ai/playground-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: prompt,
            conversationHistory: conversationHistory,
            maxTokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          // 서버에서 반환된 전체 대화 기록으로 업데이트
          setConversationHistory(data.conversationHistory);
        } else {
          // 오류 메시지를 대화 기록에 추가
          const errorMessage = { role: 'assistant', content: `❌ 오류가 발생했습니다: ${data.error}` };
          setConversationHistory([...updatedHistory, errorMessage]);
        }
      } else {
        // 다른 모델들은 시뮬레이션 유지
        setTimeout(() => {
          const simulationResponse = {
            role: 'assistant',
            content: `[${selectedModel}] 응답: ${userMessage.content}에 대한 AI 생성 응답입니다. 이것은 시뮬레이션된 응답입니다.

이 응답은 선택하신 ${selectedModel} 모델을 사용하여 생성되었습니다. 실제 환경에서는 해당 모델의 API를 통해 실시간으로 응답이 생성됩니다.

🚨 현재 ${selectedModel}는 시뮬레이션 모드입니다. Claude 3.5 Sonnet을 선택하시면 실제 AWS Bedrock API를 사용할 수 있습니다.`
          };
          setConversationHistory([...updatedHistory, simulationResponse]);
          setIsLoading(false);
          return;
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      const errorMessage = {
        role: 'assistant',
        content: `❌ 연결 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}

💡 해결 방법:
1. 백엔드 서버가 실행 중인지 확인해주세요 (localhost:4000)
2. AWS 인증 정보가 올바르게 설정되었는지 확인해주세요
3. 네트워크 연결을 확인해주세요`
      };
      setConversationHistory([...updatedHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setConversationHistory([]);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Navigation>
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-base font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">GenAI Playground</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border h-[calc(80vh-140px)]">
            {/* Model Selection Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-gray-700">▼ Select AI Model</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-base font-medium"
                    >
                      <span>{selectedModel}</span>
                      <span className="text-sm">▼</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[220px]">
                        {AI_MODELS.map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model);
                              setIsDropdownOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-base"
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-base font-medium"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <span>Run</span>
                        <span>▶</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex flex-col p-6 h-[calc(100%-120px)]">
              {/* Chat Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-0"
              >
                {conversationHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-base">
                    대화를 시작해보세요!
                  </div>
                ) : (
                  conversationHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        <div className="text-xs opacity-70 mb-1">
                          {message.role === 'user' ? 'You' : selectedModel}
                        </div>
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</pre>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 max-w-xs px-4 py-2 rounded-lg">
                      <div className="text-xs opacity-70 mb-1">{selectedModel}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">응답을 생성하고 있습니다...</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* 스크롤 자동 이동을 위한 마커 */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t pt-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    전송
                  </button>
                </form>
              </div>
            </div>


          </div>
        </div>
      </main>
    </Navigation>
  );
} 