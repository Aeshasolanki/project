import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
} from '@mui/icons-material';
import { authAPI } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authAPI.register(registrationData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Noto Naskh Arabic", serif',
          fontWeight: 700,
          textAlign: 'center',
          color: 'primary.main',
          mb: 1,
        }}
      >
        إنشاء حساب جديد
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          mb: 3,
        }}
      >
        انضمي إلى منصة المخور
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="الاسم بالعربي"
          name="nameAr"
          value={formData.nameAr}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Name in English"
          name="nameEn"
          value={formData.nameEn}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="رقم الهاتف"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+971501234567"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="نوع الحساب"
          name="role"
          select
          value={formData.role}
          onChange={handleChange}
          sx={{ mb: 2 }}
        >
          <MenuItem value="customer">عميل</MenuItem>
          <MenuItem value="shop">محل</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="كلمة المرور"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            لديك حساب بالفعل؟{' '}
            <Link
              to="/login"
              style={{
                color: '#B8956A',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              تسجيل الدخول
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Register;
