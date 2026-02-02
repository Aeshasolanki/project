import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { designsAPI } from '../../services/api';
import DesignCard from '../../components/Design/DesignCard';

const categories = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'embroidery', labelAr: 'تطريز يدوي', labelEn: 'Hand Embroidery' },
  { id: 'abaya', labelAr: 'عبايات', labelEn: 'Abayas' },
  { id: 'dresses', labelAr: 'فساتين', labelEn: 'Dresses' },
  { id: 'kaftan', labelAr: 'قفطان', labelEn: 'Kaftan' },
  { id: 'jalabiya', labelAr: 'جلابية', labelEn: 'Jalabiya' },
];

const Home = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDesigns();
  }, [selectedCategory, searchQuery]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await designsAPI.getAll(params);
      setDesigns(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError('حدث خطأ في تحميل التصاميم');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        className="islamic-pattern"
        sx={{
          background: 'linear-gradient(135deg, rgba(27, 75, 90, 0.05) 0%, rgba(184, 149, 106, 0.05) 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            color: 'primary.main',
            mb: 2,
          }}
        >
          مرحباً بك في المخور
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            mb: 3,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          اكتشفي فن التطريز والخياطة على قياسك
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="ابحثي عن تصميم..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            maxWidth: 500,
            mx: 'auto',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'accent.main' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 2,
          mb: 3,
          '&::-webkit-scrollbar': {
            height: 6,
          },
        }}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.labelAr}
            onClick={() => setSelectedCategory(category.id)}
            sx={{
              px: 2,
              py: 2.5,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              ...(selectedCategory === category.id && {
                backgroundColor: 'accent.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'accent.dark',
                },
              }),
            }}
          />
        ))}
      </Box>

      {/* Designs Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'accent.main' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : designs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد تصاميم متاحة حالياً
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {designs.map((design) => (
            <Grid item xs={12} sm={6} md={4} key={design._id}>
              <DesignCard design={design} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Why Mukhawar Section */}
      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            textAlign: 'center',
            mb: 4,
            color: 'primary.main',
          }}
        >
          لماذا المخور؟
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              title: 'جودة عالية',
              description: 'تطريز وخياطة احترافية من محلات معتمدة',
              icon: '✨',
            },
            {
              title: 'تسليم سريع',
              description: 'توصيل موثوق في دبي والشارقة',
              icon: '🚚',
            },
            {
              title: 'أمان مضمون',
              description: 'نظام دفع آمن بضمان الاسترداد',
              icon: '🔒',
            },
            {
              title: 'قياس دقيق',
              description: 'أدخلي قياساتك واحصلي على تفصيل مثالي',
              icon: '📏',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'accent.main',
                  backgroundColor: 'background.paper',
                  height: '100%',
                }}
              >
                <Typography variant="h2" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: 'primary.main',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
