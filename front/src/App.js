import { BrowserRouter as Router } from 'react-router-dom';
import { Suspense } from 'react';
import Layout from './components/layout/Layout';
import AppRoutes from './Routes';
import './styles/global.css';
import './styles/pages.css';

function App() {
  return (
    <Router
     future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
     }}
    >
    <Suspense fallback={
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    }>
      <Layout>
        <AppRoutes />
      </Layout>
    </Suspense>
  </Router>
  );
}

export default App;
