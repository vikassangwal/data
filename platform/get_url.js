const https = require('https');

https.get({
  hostname: 'api.github.com',
  path: '/repos/vikassangwal/data/deployments',
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const deps = JSON.parse(data);
      if (deps && deps.length > 0) {
        console.log(deps.map(d => ({ env: d.environment, url: d.payload?.web_url || 'No URL payload' })));
      } else {
        console.log('No deployments found or API limit reached.');
      }
    } catch(e) { console.log(e); }
  });
});
