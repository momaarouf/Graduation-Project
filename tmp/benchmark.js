const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const TOUR_ID = 124;

async function runBenchmark() {
  console.log(`🚀 Benchmarking endpoints for Tour ${TOUR_ID}...`);

  const startTime = Date.now();

  try {
    const tourStart = Date.now();
    await axios.get(`${BASE_URL}/reviews/tour/${TOUR_ID}?page=0&size=10`);
    console.log(`✅ /reviews/tour/${TOUR_ID}: ${Date.now() - tourStart}ms`);
    
    // Test with filter
    const filterStart = Date.now();
    await axios.get(`${BASE_URL}/reviews/tour/${TOUR_ID}?page=0&size=10&rating=5`);
    console.log(`✅ /reviews/tour/${TOUR_ID}?rating=5: ${Date.now() - filterStart}ms`);

  } catch (err) {
    if (err.response) {
      console.log(`❌ Backend Error: ${err.response.status} - ${err.response.statusText}`);
    } else {
      console.error('❌ Benchmark failed:', err.message);
    }
  }

  console.log(`🏁 Total time: ${Date.now() - startTime}ms`);
}

runBenchmark();
