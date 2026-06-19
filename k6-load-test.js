import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 },  // Stay at 50 users for 1 min
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    sessionId: 'load-test-' + __VU,
    message: 'Hello AI, give me a product recommendation'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:8080/api/public/ai-chat/anonymous', payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has output': (r) => r.json('output') !== undefined,
  });

  sleep(1);
}
