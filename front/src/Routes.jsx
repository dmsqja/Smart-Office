// Routes.jsx
import {Routes, Route, Navigate} from 'react-router-dom';
import {lazy} from 'react';
import Layout from './components/layout/Layout';
import { CalendarProvider } from './context/CalendarContext';

// Lazy load pages
const Login = lazy(() => import('./components/login/LoginForm'));
const PasswordChange = lazy(() => import('./components/login/PasswordChangeForm'));
const Home = lazy(() => import('./pages/Home'));
const Resume = lazy(() => import('./pages/Resume'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
const Calendar = lazy(() => import ('./pages/Calendar'));
const Messenger = lazy(() => import ('./pages/Messenger'));
const Ai = lazy(() => import ('./pages/Ai'));
const Hub = lazy(() => import ('./pages/Hub'));
const Meeting = lazy(() => import ('./pages/Meeting'));
const Employee = lazy(() => import ('./pages/Employee'));
const Document = lazy(() => import ('./pages/Document'));
const MeetingRoom = lazy(() => import('./pages/MeetingRoom'));
const KakaoMap = lazy(() => import('./pages/KakaoMap'));

const AppRoutes = () => {
    return (
        <CalendarProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/password-change" element={<PasswordChange />} />

            {/* Protected routes with Layout */}
            <Route element={<Layout/>}>
                <Route path="/home" element={<Home/>}/>
                <Route path="/resume" element={<Resume/>}/>
                <Route path="/projects" element={<Projects/>}/>
                <Route path="/contact" element={<Contact/>}/>
                <Route path="/calendar" element={<Calendar/>}/>
                <Route path="/messenger" element={<Messenger/>}/>
                <Route path="/ai" element={<Ai/>}/>
                <Route path="/hub" element={<Hub/>}/>
                <Route path="/meeting" element={<Meeting/>}/>
                <Route path="/employee" element={<Employee/>}/>
                <Route path="/document" element={<Document/>}/>
                <Route path="/meetingRoom" element={<MeetingRoom/>}/>
                <Route path="/map" element={<KakaoMap/>}/>
            </Route>

                {/* Error routes */}
                <Route path="/404" element={
                    <div className="error-page">
                        <h1>404 - Page Not Found</h1>
                        <p>The page you are looking for doesn't exist.</p>
                    </div>
                }/>

                <Route path="*" element={<Navigate to="/404" replace/>}/>
            </Routes>
        </CalendarProvider>
    );
};

export default AppRoutes;