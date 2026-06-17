const { simulateErrorCrash } = require('./.next/server/app/actions/self-healing.js');
async function test() {
  console.log("Simulating...");
  const res = await simulateErrorCrash('db_timeout');
  console.log("Result:", res);
}
test();
