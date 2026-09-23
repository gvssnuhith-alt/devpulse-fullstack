import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
process.env.STANDALONE_IMPORT = 'true';
process.env.DATA_FILE = './data/test-devpulse.json';

const { app } = await import('./src/index.js');

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();
const BASE_URL = `http://localhost:${port}`;

console.log(`Test server running on ${BASE_URL}`);

let token = '';
let createdTaskId = '';

async function runTests() {
  try {
    // 1. Health check
    console.log('1. Health check endpoint');
    const resHealth = await fetch(`${BASE_URL}/health`);
    assert.equal(resHealth.status, 200);
    const dataHealth = await resHealth.json();
    assert.equal(dataHealth.status, 'ok');

    // 2. Auth: Register
    console.log('2. Auth: Register new user');
    const resReg = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester User',
        email: `tester-${Date.now()}@devpulse.io`,
        password: 'securepassword123'
      })
    });
    assert.equal(resReg.status, 201);
    const dataReg = await resReg.json();
    assert.ok(dataReg.token, 'Token must be returned on register');
    assert.ok(dataReg.user.id);
    token = dataReg.token;

    // 3. Auth: Login with seeded admin
    console.log('3. Auth: Login with seeded admin');
    const resLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@devpulse.io',
        password: 'admin123456'
      })
    });
    assert.equal(resLogin.status, 200);
    const dataLogin = await resLogin.json();
    assert.ok(dataLogin.token);
    assert.equal(dataLogin.user.email, 'admin@devpulse.io');

    // 4. Auth: Me endpoint
    console.log('4. Auth: /me with token');
    const resMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(resMe.status, 200);
    const dataMe = await resMe.json();
    assert.ok(dataMe.user.email);

    // 5. Tasks: List seeded 8 tasks
    console.log('5. Tasks: List seeded engineering tasks');
    const resTasks = await fetch(`${BASE_URL}/api/v1/tasks`);
    assert.equal(resTasks.status, 200);
    const dataTasks = await resTasks.json();
    assert.ok(dataTasks.tasks.length >= 8, `Expected at least 8 tasks, got ${dataTasks.tasks.length}`);

    // 6. Tasks: Filtering by status & priority
    console.log('6. Tasks: Filter by status & priority');
    const resFilter = await fetch(`${BASE_URL}/api/v1/tasks?status=completed&priority=high`);
    assert.equal(resFilter.status, 200);
    const dataFilter = await resFilter.json();
    assert.ok(dataFilter.tasks.every(t => t.status === 'completed' && t.priority === 'high'));

    // 7. Tasks: Search query
    console.log('7. Tasks: Search query');
    const resSearch = await fetch(`${BASE_URL}/api/v1/tasks?search=Redis`);
    assert.equal(resSearch.status, 200);
    const dataSearch = await resSearch.json();
    assert.ok(dataSearch.tasks.some(t => t.title.includes('Redis')));

    // 8. Tasks: Create new task (auth)
    console.log('8. Tasks: Create new task');
    const resCreate = await fetch(`${BASE_URL}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Automated test task creation',
        description: 'Verifying REST API task pipeline',
        status: 'in_progress',
        priority: 'high'
      })
    });
    assert.equal(resCreate.status, 201);
    const dataCreate = await resCreate.json();
    assert.ok(dataCreate.task.id);
    createdTaskId = dataCreate.task.id;

    // 9. Tasks: Update task
    console.log('9. Tasks: Update task');
    const resUpdate = await fetch(`${BASE_URL}/api/v1/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'completed',
        title: 'Automated test task creation - Verified'
      })
    });
    assert.equal(resUpdate.status, 200);
    const dataUpdate = await resUpdate.json();
    assert.equal(dataUpdate.task.status, 'completed');
    assert.equal(dataUpdate.task.title, 'Automated test task creation - Verified');

    // 10. Analytics: summary stats
    console.log('10. Analytics: summary stats check');
    const resAnalytics = await fetch(`${BASE_URL}/api/v1/analytics/summary`);
    assert.equal(resAnalytics.status, 200);
    const dataAnalytics = await resAnalytics.json();
    assert.ok('total' in dataAnalytics.analytics);
    assert.ok('completed' in dataAnalytics.analytics);
    assert.ok('in_progress' in dataAnalytics.analytics);
    assert.ok('high_priority' in dataAnalytics.analytics);
    assert.ok('completion_rate' in dataAnalytics.analytics);

    // 11. Activity log check
    console.log('11. Activity: check audit trail');
    const resActivity = await fetch(`${BASE_URL}/api/v1/activity`);
    assert.equal(resActivity.status, 200);
    const dataActivity = await resActivity.json();
    assert.ok(dataActivity.activity.length > 0);
    assert.ok(dataActivity.activity.some(a => a.action === 'CREATE' && a.entityId === createdTaskId));

    // 12. Tasks: Delete task
    console.log('12. Tasks: Delete task');
    const resDelete = await fetch(`${BASE_URL}/api/v1/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(resDelete.status, 200);
    const dataDelete = await resDelete.json();
    assert.equal(dataDelete.success, true);

    // 13. Verify task deletion
    console.log('13. Verify deletion 404');
    const resGetDeleted = await fetch(`${BASE_URL}/api/v1/tasks/${createdTaskId}`);
    assert.equal(resGetDeleted.status, 404);

    console.log('\nAll 13 test suites passed cleanly!');
    process.exitCode = 0;
  } catch (err) {
    console.error('Test suite failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
