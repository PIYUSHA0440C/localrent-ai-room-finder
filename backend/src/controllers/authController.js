import authService from '../services/authService.js';

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    user: result.user,
    accessToken: result.accessToken,
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    message: 'Login successful',
    user: result.user,
    accessToken: result.accessToken,
  });
};

// POST /api/auth/refresh-token
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refreshAccessToken(token);

  res.json({
    accessToken: result.accessToken,
    user: result.user,
  });
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  await authService.logout(token);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);

  res.json({
    message: 'Email verified successfully',
    user,
  });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
