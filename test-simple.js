const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';

// 테스트 결과를 저장할 객체
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 테스트 헬퍼 함수
function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}${message ? ' - ' + message : ''}`);
  
  testResults.tests.push({
    name: testName,
    passed,
    message
  });
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function runSimpleTests() {
  console.log('🚀 Starting Simple Integration Tests...\n');

  try {
    // 1. 서버 상태 확인
    console.log('📋 Testing Server Status...');
    await testServerStatus();

    // 2. 인증 플로우 테스트
    console.log('\n📋 Testing Authentication Flow...');
    await testAuthenticationFlow();

    // 3. 프로젝트 생성 및 승인 플로우 테스트
    console.log('\n📋 Testing Project Workflow...');
    await testProjectWorkflow();

    // 4. 권한 테스트
    console.log('\n📋 Testing Authorization...');
    await testAuthorization();

    // 5. 검색 기능 테스트
    console.log('\n📋 Testing Search Features...');
    await testSearchFeatures();

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }

  // 테스트 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`  - ${test.name}: ${test.message}`));
  }
}

async function testServerStatus() {
  try {
    // 프론트엔드 서버 확인
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
    logTest('Frontend Server Running', frontendResponse.status === 200);

    // 백엔드 서버 확인
    try {
      await axios.get(`${BACKEND_URL}/auth/verify`);
      logTest('Backend Server Running', false, 'Should return 401 without token');
    } catch (error) {
      logTest('Backend Server Running', error.response?.status === 401);
    }

  } catch (error) {
    logTest('Server Status Check', false, error.message);
  }
}

async function testAuthenticationFlow() {
  try {
    // 모든 사용자 로그인 테스트
    const users = [
      { email: 'admin@example.com', password: 'admin123', role: 'ADMIN' },
      { email: 'developer@example.com', password: 'dev123', role: 'DEVELOPER' },
      { email: 'heewoong@example.com', password: '0708', role: 'DEVELOPER' },
      { email: 'master@example.com', password: 'master123', role: 'MASTER' }
    ];

    for (const user of users) {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      const token = response.data.access_token;
      logTest(`${user.role} Login`, !!token);

      // 토큰으로 사용자 정보 확인
      const verifyResponse = await axios.get(`${BACKEND_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logTest(`${user.role} Token Verification`, verifyResponse.data.role === user.role);
    }

    // 잘못된 로그인 시도
    try {
      await axios.post(`${BACKEND_URL}/auth/login`, {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
      logTest('Invalid Login Rejection', false, 'Should have failed');
    } catch (error) {
      logTest('Invalid Login Rejection', error.response?.status === 401);
    }

  } catch (error) {
    logTest('Authentication Flow', false, error.message);
  }
}

async function testProjectWorkflow() {
  try {
    // Developer 토큰 획득
    const developerLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'developer@example.com',
      password: 'dev123'
    });
    const developerToken = developerLogin.data.access_token;

    // Admin 토큰 획득
    const adminLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.access_token;

    // 1. 프로젝트 생성 (Developer)
    const projectData = {
      title: '통합 테스트 프로젝트',
      model: 'GPT-4',
      registrant: 'Developer User',
      department: '개발팀',
      projectManager: '김매니저',
      developers: 'Developer User, 김개발',
      description: '통합 테스트를 위한 프로젝트입니다.',
      usagePlan: '테스트 목적으로 사용',
      expectedEffects: '통합 테스트 검증',
      duration: '2025.01 - 2025.02'
    };

    const createResponse = await axios.post(`${BACKEND_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const projectId = createResponse.data.id;
    logTest('Project Creation by Developer', !!projectId);

    // 2. 프로젝트 상태 확인
    logTest('Project Initial Status', createResponse.data.status === 'PENDING');

    // 3. Developer의 프로젝트 목록 확인
    const myProjectsResponse = await axios.get(`${BACKEND_URL}/projects/my`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const hasCreatedProject = myProjectsResponse.data.some(p => p.id === projectId);
    logTest('Project in My Projects List', hasCreatedProject);

    // 4. Admin의 Pending 프로젝트 목록 확인
    const pendingResponse = await axios.get(`${BACKEND_URL}/projects/status/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const isPending = pendingResponse.data.some(p => p.id === projectId);
    logTest('Project in Pending List', isPending);

    // 5. 프로젝트 승인 (Admin)
    const approvalResponse = await axios.put(
      `${BACKEND_URL}/projects/${projectId}/status`,
      {
        status: 'approved',
        statusMessage: '통합 테스트 승인 완료'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    logTest('Project Approval by Admin', approvalResponse.data.status === 'APPROVED');

    // 6. 승인 후 상태 확인
    const updatedMyProjects = await axios.get(`${BACKEND_URL}/projects/my`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const approvedProject = updatedMyProjects.data.find(p => p.id === projectId);
    logTest('Project Status Updated to Approved', approvedProject?.status === 'APPROVED');

    // 7. 임시 저장 기능 테스트
    const tempData = {
      title: '임시 저장 테스트',
      model: 'Claude-3',
      description: '임시 저장 기능 테스트'
    };

    const tempSaveResponse = await axios.post(`${BACKEND_URL}/projects/temp`, tempData, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    logTest('Temporary Save Functionality', !!tempSaveResponse.data.id);

    // 8. 임시 저장 목록 확인
    const tempListResponse = await axios.get(`${BACKEND_URL}/projects/temp`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    logTest('Temporary Projects List', Array.isArray(tempListResponse.data));

  } catch (error) {
    logTest('Project Workflow', false, error.message);
  }
}

async function testAuthorization() {
  try {
    // Developer 토큰 획득
    const developerLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'developer@example.com',
      password: 'dev123'
    });
    const developerToken = developerLogin.data.access_token;

    // Developer가 승인 기능에 접근 시도 (실패해야 함)
    try {
      await axios.put(
        `${BACKEND_URL}/projects/test-id/status`,
        { status: 'approved', statusMessage: 'test' },
        { headers: { Authorization: `Bearer ${developerToken}` } }
      );
      logTest('Developer Approval Access Denied', false, 'Should have been forbidden');
    } catch (error) {
      logTest('Developer Approval Access Denied', error.response?.status === 403);
    }

    // Developer가 모든 프로젝트 조회 시도 (실패해야 함)
    try {
      await axios.get(`${BACKEND_URL}/projects/all`, {
        headers: { Authorization: `Bearer ${developerToken}` }
      });
      logTest('Developer All Projects Access Denied', false, 'Should have been forbidden');
    } catch (error) {
      logTest('Developer All Projects Access Denied', error.response?.status === 403);
    }

    // Developer가 검색 기능 접근 시도 (실패해야 함)
    try {
      await axios.get(`${BACKEND_URL}/projects/search`, {
        headers: { Authorization: `Bearer ${developerToken}` }
      });
      logTest('Developer Search Access Denied', false, 'Should have been forbidden');
    } catch (error) {
      logTest('Developer Search Access Denied', error.response?.status === 403);
    }

  } catch (error) {
    logTest('Authorization Tests', false, error.message);
  }
}

async function testSearchFeatures() {
  try {
    // Admin 토큰 획득
    const adminLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.access_token;

    // 전체 검색
    const allSearchResponse = await axios.get(`${BACKEND_URL}/projects/search`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Search All Projects (Admin)', Array.isArray(allSearchResponse.data));

    // 키워드 검색
    const keywordSearchResponse = await axios.get(`${BACKEND_URL}/projects/search?q=통합`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Keyword Search (Admin)', Array.isArray(keywordSearchResponse.data));

    // 상태별 검색
    const statusSearchResponse = await axios.get(`${BACKEND_URL}/projects/search?status=approved`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Status Search (Admin)', Array.isArray(statusSearchResponse.data));

    // Master도 검색 가능한지 확인
    const masterLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'master@example.com',
      password: 'master123'
    });
    const masterToken = masterLogin.data.access_token;

    const masterSearchResponse = await axios.get(`${BACKEND_URL}/projects/search`, {
      headers: { Authorization: `Bearer ${masterToken}` }
    });
    logTest('Search Access for Master', Array.isArray(masterSearchResponse.data));

  } catch (error) {
    logTest('Search Features', false, error.message);
  }
}

// 테스트 실행
runSimpleTests().catch(console.error); 