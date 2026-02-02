import { createTheme } from '@mui/material/styles';

// Moroccan Elegance Design System
const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#1B4B5A', // Deep Teal
      light: '#2D6A7A',
      dark: '#0F3440',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E8C4A8', // Warm Sand
      light: '#F0D5BE',
      dark: '#D4A88A',
      contrastText: '#2A1A14',
    },
    accent: {
      main: '#B8956A', // Bronze-Gold
      light: '#C9A57B',
      dark: '#A17E54',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FAF7F5',
      dark: '#F5F0EB',
    },
    text: {
      primary: '#2A1A14',
      secondary: '#6B5D52',
      disabled: '#A89F97',
    },
    success: {
      main: '#4A8E4E',
      light: '#66A569',
      dark: '#357238',
    },
    error: {
      main: '#C24B4B',
      light: '#D16666',
      dark: '#A33535',
    },
    warning: {
      main: '#D4A574',
      light: '#E0B98A',
      dark: '#B88F5E',
    },
    info: {
      main: '#2D6A7A',
      light: '#4A8495',
      dark: '#1B4B5A',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Naskh Arabic"',
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"Noto Naskh Arabic", serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: '"Noto Naskh Arabic", serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Noto Naskh Arabic", serif',
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Noto Naskh Arabic", serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Noto Naskh Arabic", serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: '"Noto Naskh Arabic", serif',
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12, // Moroccan arch-inspired rounded corners
  },
  shadows: [
    'none',
    '0 2px 4px rgba(27, 75, 90, 0.08)',
    '0 4px 8px rgba(27, 75, 90, 0.12)',
    '0 6px 12px rgba(27, 75, 90, 0.16)',
    '0 8px 16px rgba(27, 75, 90, 0.20)',
    '0 12px 24px rgba(27, 75, 90, 0.24)',
    '0 16px 32px rgba(27, 75, 90, 0.28)',
    '0 20px 40px rgba(27, 75, 90, 0.32)',
    // ... rest of default shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(27, 75, 90, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #1B4B5A 0%, #2D6A7A 100%)',
          color: '#FFFFFF',
          border: '2px solid rgba(184, 149, 106, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0F3440 0%, #1B4B5A 100%)',
            border: '2px solid rgba(184, 149, 106, 0.5)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#B8956A',
          color: '#1B4B5A',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(184, 149, 106, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(27, 75, 90, 0.12)',
          border: '1px solid rgba(184, 149, 106, 0.2)',
          background: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(27, 75, 90, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(27, 75, 90, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1B4B5A 0%, #2D6A7A 100%)',
          boxShadow: '0 2px 8px rgba(27, 75, 90, 0.16)',
          borderBottom: '2px solid rgba(184, 149, 106, 0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        filled: {
          backgroundColor: '#E8C4A8',
          color: '#2A1A14',
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#B8956A',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderWidth: 2,
              borderColor: 'rgba(184, 149, 106, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(184, 149, 106, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#B8956A',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
        },
      },
    },
  },
});

// Custom Islamic geometric pattern (for decorative elements)
export const islamicPattern = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L45 15 L30 30 L15 15 Z M0 30 L15 45 L30 30 L15 15 Z M30 30 L45 45 L60 30 L45 15 Z M30 30 L45 45 L30 60 L15 45 Z' fill='%23B8956A' opacity='0.05'/%3E%3C/svg%3E")`,
};

export default theme;
