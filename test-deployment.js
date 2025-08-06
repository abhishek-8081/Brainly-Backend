// Test script for Brainly Backend API
// Replace YOUR_RAILWAY_URL with your actual Railway deployment URL

const API_BASE_URL = 'YOUR_RAILWAY_URL'; // e.g., 'https://brainly-backend-production-xxxx.up.railway.app'

async function testAPI() {
  console.log('🧪 Testing Brainly Backend API...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: User Signup
  console.log('\n2. Testing User Signup...');
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpass123'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    console.log('✅ Signup:', data);

    // Test 3: User Signin
    console.log('\n3. Testing User Signin...');
    const signinResponse = await fetch(`${API_BASE_URL}/api/v1/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    const signinData = await signinResponse.json();
    console.log('✅ Signin:', signinData);

    if (signinData.token) {
      // Test 4: Create Content (with authentication)
      console.log('\n4. Testing Create Content...');
      const contentResponse = await fetch(`${API_BASE_URL}/api/v1/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': signinData.token
        },
        body: JSON.stringify({
          title: 'Test Content',
          link: 'https://example.com',
          type: 'article'
        })
      });
      const contentData = await contentResponse.json();
      console.log('✅ Create Content:', contentData);

      // Test 5: Get Content
      console.log('\n5. Testing Get Content...');
      const getContentResponse = await fetch(`${API_BASE_URL}/api/v1/content`, {
        headers: {
          'Authorization': signinData.token
        }
      });
      const getContentData = await getContentResponse.json();
      console.log('✅ Get Content:', getContentData);

      // Test 6: Share Brain
      console.log('\n6. Testing Brain Share...');
      const shareResponse = await fetch(`${API_BASE_URL}/api/v1/brain/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': signinData.token
        },
        body: JSON.stringify({ share: true })
      });
      const shareData = await shareResponse.json();
      console.log('✅ Brain Share:', shareData);

      if (shareData.hash) {
        // Test 7: Access Shared Brain
        console.log('\n7. Testing Shared Brain Access...');
        const sharedResponse = await fetch(`${API_BASE_URL}/api/v1/brain/${shareData.hash}`);
        const sharedData = await sharedResponse.json();
        console.log('✅ Shared Brain Access:', sharedData);
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Uncomment the line below and replace YOUR_RAILWAY_URL to run the test
// testAPI();
