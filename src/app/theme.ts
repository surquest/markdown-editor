'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#CA3027',
      dark: '#98140C',
    },
    secondary: {
      main: '#C2DBFE',
    },
    background: {
      default: '#F1F2F2',
      paper: '#ffffff',
    },
    text: {
      primary: '#222222',
      secondary: '#333333',
    },
  },
  typography: {
    fontFamily: 'var(--font-montserrat), sans-serif',
    h1: {
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '45px',
      lineHeight: '52px',
      letterSpacing: '0px',
      textAlign: 'center',
    },
    h2: {
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '32px',
      lineHeight: '40px',
      letterSpacing: '0px',
    },
    h4: {
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '22px',
      lineHeight: '28px',
      letterSpacing: '0px',
    },
    body1: {
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0px',
    },
  },
});

export default theme;
