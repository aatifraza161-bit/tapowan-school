async function run() {
  try {
    const loginRes = await fetch('https://tapowan-school.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'im_aatif', password: 'Aatif@123' })
    });
    console.log("Login status:", loginRes.status);
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.log("Login failed data:", loginData);
      return;
    }

    console.log("Login success. Fetching store...");
    const storeRes = await fetch('https://tapowan-school.vercel.app/api/store', {
      headers: { 'Authorization': 'Bearer ' + loginData.token }
    });
    console.log("Store status:", storeRes.status);
    const storeData = await storeRes.text();
    console.log("Store response prefix:", storeData.substring(0, 300));
  } catch (err) {
    console.error("Test error:", err);
  }
}
run();
