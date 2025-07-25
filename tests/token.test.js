const { generateAccessToken, generateRefreshToken } = require('../src/utils/token');
const jwt = require('jsonwebtoken');

describe('Token Utilities', () => {
  const userId = 'testuserid123';
  const accessSecret = 'testaccesssecret';
  const refreshSecret = 'testrefreshsecret';
  
  beforeAll(() => {
    process.env.ACCESS_SECRET = accessSecret;
    process.env.REFRESH_SECRET = refreshSecret;
  });

  test('generateAccessToken returns a valid JWT with correct payload', () => {
    const token = generateAccessToken(userId);
    const decoded = jwt.verify(token, accessSecret);
    expect(decoded.id).toBe(userId);
  });

  test('generateRefreshToken returns a valid JWT with correct payload', () => {
    const token = generateRefreshToken(userId);
    const decoded = jwt.verify(token, refreshSecret);
    expect(decoded.id).toBe(userId);
  });
}); 