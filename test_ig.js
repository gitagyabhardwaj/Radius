const https = require('https');

https.get('https://i.instagram.com/api/v1/users/web_profile_info/?username=cristiano', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'x-ig-app-id': '936619743392459'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(json.data.user.edge_followed_by.count);
    } catch(e) {
      console.log('Error parsing:', e.message);
      console.log(data.substring(0, 200));
    }
  });
}).on('error', console.error);
