const base = process.env.API_URL || "http://localhost:5000";

async function check(url, expectedStatus = 200) {
  const response = await fetch(url);
  const body = await response.json();

  if (response.status !== expectedStatus) {
    throw new Error(`${url}: expected ${expectedStatus}, got ${response.status}`);
  }

  return body;
}

const health = await check(`${base}/api/health`);
console.log("✓ health", health.status);

const pin = await check(`${base}/api/pincodes?pincode=560001`);
console.log("✓ PIN search", pin.total, "record(s)");

const area = await check(`${base}/api/pincodes?area=Whitefield`);
console.log("✓ area search", area.total, "record(s)");

await check(`${base}/api/pincodes?pincode=123`, 400);
console.log("✓ validation");

console.log("\nSmoke tests passed.");
