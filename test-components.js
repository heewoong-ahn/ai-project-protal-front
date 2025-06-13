const axios = require('axios');

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

async function runComponentTests() {
  console.log('🚀 Starting Component Functionality Tests...\n');

  try {
    // 1. 사용자 역할별 기능 테스트
    console.log('📋 Testing Role-based Features...');
    await testRoleBasedFeatures();

    // 2. 프로젝트 상태 변화 테스트
    console.log('\n📋 Testing Project Status Changes...');
    await testProjectStatusChanges();

    // 3. 데이터 동기화 테스트
    console.log('\n📋 Testing Data Synchronization...');
    await testDataSynchronization();

    // 4. 에러 처리 테스트
    console.log('\n📋 Testing Error Handling...');
    await testErrorHandling();

    // 5. 검색 및 필터링 테스트
    console.log('\n📋 Testing Search and Filtering...');
    await testSearchAndFiltering();

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }

  // 테스트 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 COMPONENT TEST SUMMARY');
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

async function testRoleBasedFeatures() {
  try {
    // 각 역할별 사용자 토큰 획득
    const adminToken = await getToken('admin@example.com', 'admin123');
    const developerToken = await getToken('developer@example.com', 'dev123');
    const heewoongToken = await getToken('heewoong@example.com', '0708');
    const masterToken = await getToken('master@example.com', 'master123');

    // Admin 권한 테스트 - 실제 프로젝트 생성 후 테스트
    const testProject = await axios.post(`${BACKEND_URL}/projects`, {
      title: '권한 테스트 프로젝트',
      model: 'GPT-4',
      registrant: 'Developer User',
      department: '개발팀',
      projectManager: '김매니저',
      developers: 'Developer User',
      description: '권한 테스트',
      usagePlan: '테스트',
      expectedEffects: '권한 확인',
      duration: '2025.01 - 2025.02'
    }, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });

    const adminCanApprove = await canAccessEndpoint(adminToken, 'PUT', `/projects/${testProject.data.id}/status`, { status: 'approved' });
    logTest('Admin Can Approve Projects', adminCanApprove === 200);

    const adminCanSearch = await canAccessEndpoint(adminToken, 'GET', '/projects/search');
    logTest('Admin Can Search Projects', adminCanSearch === 200);

    const adminCanViewAll = await canAccessEndpoint(adminToken, 'GET', '/projects/all');
    logTest('Admin Can View All Projects', adminCanViewAll === 200);

    // Master 권한 테스트 - 새 프로젝트 생성
    const testProject2 = await axios.post(`${BACKEND_URL}/projects`, {
      title: 'Master 권한 테스트 프로젝트',
      model: 'Claude-3',
      registrant: 'Developer User',
      department: '개발팀',
      projectManager: '김매니저',
      developers: 'Developer User',
      description: 'Master 권한 테스트',
      usagePlan: '테스트',
      expectedEffects: '권한 확인',
      duration: '2025.01 - 2025.02'
    }, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });

    const masterCanApprove = await canAccessEndpoint(masterToken, 'PUT', `/projects/${testProject2.data.id}/status`, { status: 'approved' });
    logTest('Master Can Approve Projects', masterCanApprove === 200);

    const masterCanSearch = await canAccessEndpoint(masterToken, 'GET', '/projects/search');
    logTest('Master Can Search Projects', masterCanSearch === 200);

    // Developer 권한 제한 테스트
    const developerCannotApprove = await canAccessEndpoint(developerToken, 'PUT', '/projects/test/status', { status: 'approved' });
    logTest('Developer Cannot Approve Projects', developerCannotApprove === 403);

    const developerCannotSearch = await canAccessEndpoint(developerToken, 'GET', '/projects/search');
    logTest('Developer Cannot Search Projects', developerCannotSearch === 403);

    const developerCannotViewAll = await canAccessEndpoint(developerToken, 'GET', '/projects/all');
    logTest('Developer Cannot View All Projects', developerCannotViewAll === 403);

    // Heewoong (Developer) 권한 테스트
    const heewoongCanCreate = await canAccessEndpoint(heewoongToken, 'POST', '/projects', {
      title: 'Heewoong 테스트',
      model: 'GPT-4',
      registrant: '희웅',
      department: '개발팀',
      projectManager: '김매니저',
      developers: '희웅',
      description: '테스트',
      usagePlan: '테스트',
      expectedEffects: '테스트',
      duration: '2025.01 - 2025.02'
    });
    logTest('Heewoong Can Create Projects', heewoongCanCreate === 201);

    const heewoongCanViewOwn = await canAccessEndpoint(heewoongToken, 'GET', '/projects/my');
    logTest('Heewoong Can View Own Projects', heewoongCanViewOwn === 200);

  } catch (error) {
    logTest('Role-based Features', false, error.message);
  }
}

async function testProjectStatusChanges() {
  try {
    const developerToken = await getToken('developer@example.com', 'dev123');
    const adminToken = await getToken('admin@example.com', 'admin123');

    // 프로젝트 생성
    const projectData = {
      title: '상태 변화 테스트 프로젝트',
      model: 'Claude-3',
      registrant: 'Developer User',
      department: '개발팀',
      projectManager: '김매니저',
      developers: 'Developer User',
      description: '상태 변화 테스트',
      usagePlan: '테스트',
      expectedEffects: '상태 변화 확인',
      duration: '2025.01 - 2025.02'
    };

    const createResponse = await axios.post(`${BACKEND_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const projectId = createResponse.data.id;

    // 초기 상태 확인 (PENDING)
    logTest('Project Created with PENDING Status', createResponse.data.status === 'PENDING');

    // 승인으로 상태 변경
    const approveResponse = await axios.put(
      `${BACKEND_URL}/projects/${projectId}/status`,
      { status: 'approved', statusMessage: '상태 변화 테스트 승인' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    logTest('Project Status Changed to APPROVED', approveResponse.data.status === 'APPROVED');

    // 새 프로젝트 생성 후 반려 테스트
    const rejectProjectResponse = await axios.post(`${BACKEND_URL}/projects`, {
      ...projectData,
      title: '반려 테스트 프로젝트'
    }, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });

    const rejectResponse = await axios.put(
      `${BACKEND_URL}/projects/${rejectProjectResponse.data.id}/status`,
      { status: 'rejected', statusMessage: '상태 변화 테스트 반려' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    logTest('Project Status Changed to REJECTED', rejectResponse.data.status === 'REJECTED');

    // 상태 메시지 확인
    logTest('Status Message Saved', !!rejectResponse.data.statusMessage);

  } catch (error) {
    logTest('Project Status Changes', false, error.message);
  }
}

async function testDataSynchronization() {
  try {
    const developerToken = await getToken('developer@example.com', 'dev123');
    const adminToken = await getToken('admin@example.com', 'admin123');

    // 프로젝트 생성
    const projectData = {
      title: '동기화 테스트 프로젝트',
      model: 'GPT-4',
      registrant: 'Developer User',
      department: '개발팀',
      projectManager: '김매니저',
      developers: 'Developer User',
      description: '동기화 테스트',
      usagePlan: '테스트',
      expectedEffects: '동기화 확인',
      duration: '2025.01 - 2025.02'
    };

    const createResponse = await axios.post(`${BACKEND_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const projectId = createResponse.data.id;

    // Developer의 프로젝트 목록에서 확인
    const myProjectsResponse = await axios.get(`${BACKEND_URL}/projects/my`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const foundInMyProjects = myProjectsResponse.data.some(p => p.id === projectId);
    logTest('Project Appears in My Projects', foundInMyProjects);

    // Admin의 Pending 목록에서 확인
    const pendingResponse = await axios.get(`${BACKEND_URL}/projects/status/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundInPending = pendingResponse.data.some(p => p.id === projectId);
    logTest('Project Appears in Pending List', foundInPending);

    // 프로젝트 승인
    await axios.put(
      `${BACKEND_URL}/projects/${projectId}/status`,
      { status: 'approved', statusMessage: '동기화 테스트 승인' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    // 승인 후 Pending 목록에서 제거되었는지 확인
    const updatedPendingResponse = await axios.get(`${BACKEND_URL}/projects/status/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stillInPending = updatedPendingResponse.data.some(p => p.id === projectId);
    logTest('Project Removed from Pending After Approval', !stillInPending);

    // Developer의 프로젝트 목록에서 상태 업데이트 확인
    const updatedMyProjectsResponse = await axios.get(`${BACKEND_URL}/projects/my`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    const updatedProject = updatedMyProjectsResponse.data.find(p => p.id === projectId);
    logTest('Project Status Updated in My Projects', updatedProject?.status === 'APPROVED');

  } catch (error) {
    logTest('Data Synchronization', false, error.message);
  }
}

async function testErrorHandling() {
  try {
    const developerToken = await getToken('developer@example.com', 'dev123');

    // 잘못된 프로젝트 데이터로 생성 시도
    try {
      await axios.post(`${BACKEND_URL}/projects`, {
        title: '', // 빈 제목
        model: 'GPT-4'
        // 필수 필드 누락
      }, {
        headers: { Authorization: `Bearer ${developerToken}` }
      });
      logTest('Invalid Project Data Rejection', false, 'Should have failed');
    } catch (error) {
      logTest('Invalid Project Data Rejection', error.response?.status === 400);
    }

    // 존재하지 않는 프로젝트 조회
    try {
      await axios.get(`${BACKEND_URL}/projects/nonexistent-id`, {
        headers: { Authorization: `Bearer ${developerToken}` }
      });
      logTest('Nonexistent Project Handling', false, 'Should have failed');
    } catch (error) {
      logTest('Nonexistent Project Handling', error.response?.status === 404 || error.response?.status === 400);
    }

    // 잘못된 토큰으로 접근
    try {
      await axios.get(`${BACKEND_URL}/projects/my`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      logTest('Invalid Token Handling', false, 'Should have failed');
    } catch (error) {
      logTest('Invalid Token Handling', error.response?.status === 401);
    }

  } catch (error) {
    logTest('Error Handling', false, error.message);
  }
}

async function testSearchAndFiltering() {
  try {
    const adminToken = await getToken('admin@example.com', 'admin123');

    // 검색 기능 테스트
    const searchResponse = await axios.get(`${BACKEND_URL}/projects/search?q=테스트`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Search by Keyword', Array.isArray(searchResponse.data));

    // 상태별 필터링 테스트
    const approvedResponse = await axios.get(`${BACKEND_URL}/projects/search?status=approved`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Filter by Status (Approved)', Array.isArray(approvedResponse.data));

    const pendingResponse = await axios.get(`${BACKEND_URL}/projects/search?status=pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Filter by Status (Pending)', Array.isArray(pendingResponse.data));

    const rejectedResponse = await axios.get(`${BACKEND_URL}/projects/search?status=rejected`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Filter by Status (Rejected)', Array.isArray(rejectedResponse.data));

    // 복합 검색 테스트
    const complexSearchResponse = await axios.get(`${BACKEND_URL}/projects/search?q=프로젝트&status=approved`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Complex Search (Keyword + Status)', Array.isArray(complexSearchResponse.data));

    // 빈 검색 결과 처리
    const emptySearchResponse = await axios.get(`${BACKEND_URL}/projects/search?q=존재하지않는검색어`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Empty Search Results Handling', Array.isArray(emptySearchResponse.data));

  } catch (error) {
    logTest('Search and Filtering', false, error.message);
  }
}

// 헬퍼 함수들
async function getToken(email, password) {
  const response = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
  return response.data.access_token;
}

async function canAccessEndpoint(token, method, endpoint, data = null) {
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${BACKEND_URL}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` }
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.status;
  } catch (error) {
    return error.response?.status || 500;
  }
}

// 테스트 실행
runComponentTests().catch(console.error); 