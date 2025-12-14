import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getTheme = (language: string) => {
  const isRTL = language === 'ar';

  const themeOptions: ThemeOptions = {
    direction: isRTL ? 'rtl' : 'ltr',
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: isRTL
        ? '"Cairo", "Roboto", "Helvetica", "Arial", sans-serif'
        : '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
        },
      },
      MuiButton: {
        defaultProps: {
          variant: 'contained',
        },
      },
    },
  };

  return createTheme(themeOptions);
};
