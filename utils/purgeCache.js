const https = require('https');

require('colors');
require('dotenv').config();

const error = false;

const domains = [
  {
    url: 'landongavin.com',
    id: 'a09f56318f68a8d11cd6513a7e567911'
  },
  {
    url: 'landongavin.dev',
    id: '2c2c13a73ff03a85162139e94e2872b5'
  }
];

const apiKey = process.env.CLOUDFLARE_API_KEY;
const apiEmail = process.env.CLOUDFLARE_API_EMAIL;

console.log('Clearing Cloudflare cache...'.yellow)

if (!domains.length) {
  console.log('No domains were supplied'.red);
  error = true;
}

if (!apiKey || apiKey === 'undefined') {
  console.log('No api key was supplied'.red)
  error = true;
}

if (!apiEmail || apiEmail === 'undefined') {
  console.log('No api email was supplied'.red)
  error = true;
}

if (error) {
  return;
}

domains.forEach((domain) => {
  const { url, id} = domain;

  const data = JSON.stringify({
    "purge_everything": true
  });

  const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/zones/${id}/purge_cache`,
    method: 'POST',
    headers: {
      'X-Auth-Email': `${apiEmail}`,
      'X-Auth-Key': `${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    res.on('data', (d) => {
      const statusCode = res.statusCode;
      console.log(`statusCode: ${statusCode}`)
      if (statusCode >= 200 && statusCode < 300) {
        console.log(`Purged cloudflare cache for ${url}!`.green);
      } else {
        const response = JSON.parse(String.fromCharCode.apply(null, d));
        console.log(`Failed to purge cloudflare cache for ${url}!`.red, response.errors);
      }
    });
  });

  req.on('error', (e) => {
    console.log('Failed to purge cloudflare cache!'.red, e);
  })

  req.write(data);
  req.end();
});
