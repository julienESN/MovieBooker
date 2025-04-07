generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // https://developer.mozilla.org/fr/docs/Web/API/Window/btoa

  return (encodedData = btoa(JSON.stringify(payload)));
};
const user = {
  id: 1,
  email: 'gsqdgfqs@gmail.com',
  role: 'admin',
};

generateToken(user);

console.log(encodedData);
//eyJpZCI6MSwiZW1haWwiOiJnc3FkZ2Zxc0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4ifQ==

verifierToken = (token) => {
  // https://developer.mozilla.org/fr/docs/Web/API/Window/atob
  const decodedData = atob(token);
  const payload = JSON.parse(decodedData);

  if (payload.role === 'admin') {
    return console.log('Access granted');
  } else {
    return console.log('Access denied');
  }
};

verifierToken(encodedData);
// Access granted
