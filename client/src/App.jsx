import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import OAuthCallback from './components/OAuthCallback';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GeneratorFlow from './pages/GeneratorFlow';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ComparePage from './pages/ComparePage';
import TemplatesPage from './pages/TemplatesPage';
import ImportPage from './pages/ImportPage';
import AISchemaPage from './pages/AISchemaPage';
import PlaygroundPage from './pages/PlaygroundPage';
import DocsPage from './pages/DocsPage';
import { useAuth } from './contexts/AuthContext';

// Inner component so useNavigate works inside BrowserRouter
function AppRoutes() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Redirect from login page if user is already authenticated
        if (user && window.location.pathname === '/login') {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    return (
        <Routes>
            {/* Standalone pages — no sidebar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Sidebar layout */}
            <Route element={<Layout />}>
                {/* Public routes */}
                <Route path="/" element={<GeneratorFlow />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/ai" element={<AISchemaPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/playground" element={<PlaygroundPage />} />
                <Route path="/docs" element={<DocsPage />} />

                {/* Protected routes — require login */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute><HistoryPage /></ProtectedRoute>
                } />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}