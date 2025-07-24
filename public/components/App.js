const { useState, useEffect, Fragment } = React;
const { useAppContext } = AppContext;

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(true);
    const [currentView, setCurrentView] = useState('Tasks');
    const [theme, toggleTheme] = useTheme(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { fetchTasks } = useAppContext();

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                    fetchTasks();
                    // Set theme from user data
                    const root = document.documentElement;
                    root.classList.remove('light', 'dark');
                    root.classList.add(response.data.theme || 'light');
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const handleLogin = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        fetchTasks();
        // Set theme from user data on login
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(userData.theme || 'light');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setCurrentView('Tasks');
    };

    if (loading) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center">
                <p className="dark:text-white">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="auth-container min-h-screen flex items-center justify-center">
                {showLogin ? (
                    <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
                ) : (
                    <Signup onSwitch={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    return (
        <div className={`bg-slate-50 dark:bg-slate-900 dark:text-slate-200 text-slate-800 flex min-h-screen`}>
            <Sidebar 
                user={user} 
                onLogout={handleLogout} 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                toggleTheme={toggleTheme}
                isOpen={isSidebarOpen}
                setOpen={setSidebarOpen}
            />
            <main className="flex-1 p-4 sm:p-8">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 mb-4 rounded-md bg-slate-200 dark:bg-slate-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                {currentView === 'Tasks' && <TaskManager setCurrentView={setCurrentView} />}
                {currentView === 'Category' && <CategoryManager setCurrentView={setCurrentView} />}
                {currentView === 'Stats' && <Stats />}
                {currentView === 'About' && <About />}
            </main>
        </div>
    );
};