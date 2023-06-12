const crypto = require('crypto');

function generate128BitValue() {
//   const bytes = crypto.randomBytes(16); // 128 bits = 16 bytes
//   const value = bytes.toString('hex');
  return "MyRqN4WpVkhVNuF8Ea2WSQ==";
}
function generateSignedCookie(pathPrefix, expiration) {
    const randomValue = generate128BitValue();
    const expires = Math.floor(Date.now() / 1000) + expiration;
  
    const policy = `URL=${pathPrefix}; Expires=${expires}`;
    const signature = crypto.createHmac('sha1', randomValue).update(policy).digest('base64');
  
    const cookieValue = `${policy}; Signature=${signature}`;
    return cookieValue;
  }
  
  // Usage example
  const pathPrefix = 'https://canada.cdn.edge.timestack.world/';
  const expiration = 3600; // 1 hour
  
  const signedCookie = generateSignedCookie(pathPrefix, expiration);
  console.log(signedCookie);