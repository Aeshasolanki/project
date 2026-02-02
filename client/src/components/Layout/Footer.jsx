import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, Phone, Email, LocationOn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1B4B5A 0%, #2D6A7A 100%)',
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '3px solid',
        borderColor: 'rgba(184, 149, 106, 0.3)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Noto Naskh Arabic", serif',
                fontWeight: 700,
                color: '#B8956A',
                mb: 2,
              }}
            >
              المخور
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              منصة الخياطة والتطريز الرقمية الأولى في الإمارات
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#B8956A' }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: '#B8956A' }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: '#B8956A' }}>
                <Twitter />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              روابط سريعة
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                الرئيسية
              </Link>
              <Link href="/designs" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                التصاميم
              </Link>
              <Link href="/about" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                من نحن
              </Link>
              <Link href="/contact" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                اتصل بنا
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              خدمة العملاء
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                مركز المساعدة
              </Link>
              <Link href="/terms" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                الشروط والأحكام
              </Link>
              <Link href="/privacy" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                سياسة الخصوصية
              </Link>
              <Link href="/returns" color="inherit" sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}>
                سياسة الإرجاع
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              تواصل معنا
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20, color: '#B8956A' }} />
                <Typography variant="body2">+971 50 123 4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, color: '#B8956A' }} />
                <Typography variant="body2">info@mukhawar.ae</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: '#B8956A' }} />
                <Typography variant="body2">دبي، الإمارات العربية المتحدة</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(184, 149, 106, 0.3)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} المخور. جميع الحقوق محفوظة.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
