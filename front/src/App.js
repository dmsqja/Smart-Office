import { Suspense } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AppRoutes from './Routes';
import './styles/global.css';
import './styles/pages.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={
                <div className="loading">
                    <div className="loading-spinner"></div>
                </div>
            }>
                <AppRoutes />
            </Suspense>
        </ThemeProvider>
    );
}

export default App;