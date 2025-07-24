const { useState, useEffect, Fragment, useRef } = React;

// --- Custom Hooks ---
const useTheme = (initialTheme) => {
    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        if (theme) {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
        }
    }, [theme]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/user/theme', { theme: newTheme }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    };

    return [theme, toggleTheme];
};


// --- Main App Component ---
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(true);
    const [currentView, setCurrentView] = useState('Tasks');
    const [theme, toggleTheme] = useTheme(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                    const userTheme = response.data.theme || 'light';
                    setTheme(userTheme);
                    const root = document.documentElement;
                    root.classList.remove('light', 'dark');
                    root.classList.add(userTheme);
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
        const userTheme = userData.theme || 'light';
        setTheme(userTheme);
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(userTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setCurrentView('Tasks');
    };

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-950 min-h-screen flex items-center justify-center">
                <p className="dark:text-white">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="auth-container min-h-screen flex items-center justify-center p-4">
                {showLogin ? (
                    <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
                ) : (
                    <Signup onSwitch={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex min-h-screen`}>
            <Sidebar 
                user={user} 
                onLogout={handleLogout} 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                toggleTheme={toggleTheme}
                isOpen={isSidebarOpen}
                setOpen={setSidebarOpen}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 mb-4 rounded-md bg-gray-200 dark:bg-gray-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                {currentView === 'Tasks' && <TaskManager setCurrentView={setCurrentView} />}
                {currentView === 'Category' && <CategoryManager />}
                {currentView === 'Stats' && <Stats />}
                {currentView === 'About' && <About />}
            </main>
        </div>
    );
};

// --- Authentication Components ---
const Login = ({ onLogin, onSwitch }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const passwordInputRef = useRef(null);
    const submitButtonRef = useRef(null);

    const handleUsernameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInputRef.current.focus();
        }
    };

    const handlePasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitButtonRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const { token } = response.data;
            const userResponse = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            onLogin(token, userResponse.data);
        } catch (error) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Welcome Back</h2>
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="appearance-none bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500"
                        id="username" type="text" placeholder="Enter your username"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleUsernameKeyDown}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        ref={passwordInputRef}
                        className="appearance-none bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500"
                        id="password" type="password" placeholder="••••••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handlePasswordKeyDown}
                    />
                </div>
                <button
                    ref={submitButtonRef}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500 transition-colors"
                    type="submit">
                    Sign In
                </button>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Don't have an account?{' '}
                    <a href="#" onClick={onSwitch} className="font-bold text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400">
                        Sign Up
                    </a>
                </p>
            </form>
        </div>
    );
};

const Signup = ({ onSwitch }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const passwordInputRef = useRef(null);
    const submitButtonRef = useRef(null);

    const handleUsernameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInputRef.current.focus();
        }
    };

    const handlePasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitButtonRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await axios.post('/api/auth/signup', { username, password });
            setMessage('Account created! Please login.');
            setTimeout(() => onSwitch(), 2000);
        } catch (error) {
            setError('Username already exists. Please try another.');
        }
    };

    return (
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Create an Account</h2>
            {message && <p className="text-green-500 text-center mb-4 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="signup-username">
                        Username
                    </label>
                    <input
                        className="appearance-none bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500"
                        id="signup-username" type="text" placeholder="Choose a username"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleUsernameKeyDown}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="signup-password">
                        Password
                    </label>
                    <input
                        ref={passwordInputRef}
                        className="appearance-none bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500"
                        id="signup-password" type="password" placeholder="••••••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handlePasswordKeyDown}
                    />
                </div>
                <button
                    ref={submitButtonRef}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500 transition-colors"
                    type="submit">
                    Sign Up
                </button>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Already have an account?{' '}
                    <a href="#" onClick={onSwitch} className="font-bold text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400">
                        Sign In
                    </a>
                </p>
            </form>
        </div>
    );
};


// --- UI Components ---
const Sidebar = ({ user, onLogout, currentView, setCurrentView, toggleTheme, isOpen, setOpen }) => {
    const menuItems = ['Tasks', 'Stats', 'Category', 'About'];
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    return (
        <aside className={`fixed inset-y-0 left-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
                <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div className="flex items-center mb-10 p-2 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <p className="ml-3 font-bold text-gray-800 dark:text-gray-200">{user.username}</p>
            </div>
            <nav className="flex-grow">
                <ul>
                    {menuItems.map(item => (
                        <li key={item} className="mb-2">
                            <a href="#" onClick={() => { setCurrentView(item); setOpen(false); }} className={`flex items-center p-3 rounded-lg font-semibold text-base ${item === currentView ? 'bg-indigo-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex flex-col space-y-2">
                <button onClick={toggleTheme} className="w-full flex items-center justify-center p-3 rounded-lg font-semibold text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100">
                    {theme === 'light' ? 
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> :
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    }
                    Toggle Theme
                </button>
                <button onClick={onLogout} className="w-full flex items-center justify-center p-3 rounded-lg font-semibold text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H3"></path></svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

const ConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ tasksPerPage, totalTasks, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalTasks / tasksPerPage); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null;

    return (
        <nav className="mt-6 flex justify-center">
            <ul className="inline-flex items-center -space-x-px shadow-sm rounded-md">
                {pageNumbers.map((number, index) => (
                    <li key={number}>
                        <a
                            onClick={() => paginate(number)}
                            href="#"
                            className={`py-2 px-4 leading-tight ${currentPage === number ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} border border-gray-300 dark:border-gray-700 ${index === 0 ? 'rounded-l-md' : ''} ${index === pageNumbers.length - 1 ? 'rounded-r-md' : ''}`}
                        >
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const TaskManager = ({ setCurrentView }) => {
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(9);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleTaskAdded = (task) => {
        setTasks([task, ...tasks]);
        setShowModal(false);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
        setShowModal(false);
        setSelectedTask(null);
    };

    const handleDeleteRequest = (taskId) => {
        setTaskToDelete(taskId);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/tasks/${taskToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasks.filter(task => task._id !== taskToDelete));
            setShowConfirmModal(false);
            setTaskToDelete(null);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const token = localStorage.getItem('token');
            const updatedTaskData = { ...task, completed: !task.completed };
            const response = await axios.put(`/api/tasks/${task._id}`, updatedTaskData, { headers: { Authorization: `Bearer ${token}` } });
            handleTaskUpdated(response.data);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        switch (sortOrder) {
            case 'a-z':
                return a.title.localeCompare(b.title);
            case 'z-a':
                return b.title.localeCompare(a.title);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'newest':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    // Pagination logic
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);
    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <Fragment>
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
                <div className="mb-4 sm:mb-0">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Today's Tasks</h2>
                    <p className="text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500">
                        <option value="newest">Sort by Newest</option>
                        <option value="oldest">Sort by Oldest</option>
                        <option value="a-z">Sort by A-Z</option>
                        <option value="z-a">Sort by Z-A</option>
                    </select>
                    <button onClick={() => { setSelectedTask(null); setShowModal(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-indigo-500">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add New Task
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTasks.length > 0 ? currentTasks.map(task => (
                    <TaskItem
                        key={task._id}
                        task={task}
                        onToggleComplete={() => handleToggleComplete(task)}
                        onEdit={() => { setSelectedTask(task); setShowModal(true); }}
                        onDelete={() => handleDeleteRequest(task._id)}
                    />
                )) : (
                    <div className="col-span-full p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                        No tasks yet. Add one to get started!
                    </div>
                )}
            </div>

            <Pagination tasksPerPage={tasksPerPage} totalTasks={tasks.length} paginate={paginate} currentPage={currentPage} />

            {showModal && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => { setShowModal(false); setSelectedTask(null); }}
                    onTaskAdded={handleTaskAdded}
                    onTaskUpdated={handleTaskUpdated}
                    setCurrentView={setCurrentView}
                />
            )}
            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />
        </Fragment>
    );
};

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col justify-between p-5 ${task.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={onToggleComplete}
                        className="h-6 w-6 rounded-md border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-800 mt-1 cursor-pointer"
                    />
                    <div className="ml-4">
                        <p className={`font-semibold text-lg text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>{task.title}</p>
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{task.category}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
            <div className="text-right mt-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">Created: {new Date(task.createdAt).toLocaleDateString('en-CA')}</p>
            </div>
        </div>
    );
};

const TaskModal = ({ task, onClose, onTaskAdded, onTaskUpdated, setCurrentView }) => {
    const [title, setTitle] = useState(task ? task.title : '');
    const [category, setCategory] = useState(task ? task.category : '');
    const [categories, setCategories] = useState([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const newCategoryInputRef = useRef(null);

    useEffect(() => {
        if (showNewCategoryInput) {
            newCategoryInputRef.current?.focus();
        }
    }, [showNewCategoryInput]);

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
            setCategories(response.data);
            if (!task && response.data.length > 0) {
                setCategory(response.data[0].name);
            } else if (!task) {
                setCategory('General');
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (e) => {
        const { value } = e.target;
        if (value === 'add-new') {
            if (categories.length >= 10) {
                alert('You have reached the maximum of 10 categories. Please delete an existing one to add a new one.');
                if (confirm('Would you like to go to the Category page to manage your categories?')) {
                    onClose();
                    setCurrentView('Category');
                }
            } else {
                setShowNewCategoryInput(true);
            }
        } else {
            setCategory(value);
            setShowNewCategoryInput(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        let finalCategory = category;

        if (showNewCategoryInput && newCategoryName) {
            try {
                const response = await axios.post('/api/categories', { name: newCategoryName }, { headers: { Authorization: `Bearer ${token}` } });
                finalCategory = response.data.name;
            } catch (error) {
                console.error('Error creating new category:', error);
                alert('Could not create new category.');
                return;
            }
        }

        const taskData = { title, category: finalCategory };

        try {
            if (task) {
                const response = await axios.put(`/api/tasks/${task._id}`, taskData, { headers: { Authorization: `Bearer ${token}` } });
                onTaskUpdated(response.data);
            } else {
                const response = await axios.post('/api/tasks', taskData, { headers: { Authorization: `Bearer ${token}` } });
                onTaskAdded(response.data);
            }
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{task ? 'Edit Task' : 'Add New Task'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                            Task Title
                        </label>
                        <input
                            className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                            id="title" type="text" placeholder="e.g., Finish project report"
                            value={title} onChange={(e) => setTitle(e.target.value)} required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="category">
                            Category
                        </label>
                        {showNewCategoryInput ? (
                            <input
                                ref={newCategoryInputRef}
                                className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                                type="text"
                                placeholder="Enter new category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                required
                            />
                        ) : (
                            <select
                                id="category"
                                value={category}
                                onChange={handleCategoryChange}
                                className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                            >
                                <option value="add-new" className="font-bold text-indigo-600">+ Add a new category</option>
                                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {task ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
        setCategories(response.data);
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('/api/categories', { name: newCategoryName }, { headers: { Authorization: `Bearer ${token}` } });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
        } catch (error) {
            alert(error.response.data.error);
        }
    };

    const handleUpdateCategory = async (category) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/api/categories/${category._id}`, { name: category.name }, { headers: { Authorization: `Bearer ${token}` } });
            setCategories(categories.map(c => c._id === category._id ? response.data : c));
            setEditingCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleEditKeyDown = (e, category) => {
        if (e.key === 'Enter') {
            handleUpdateCategory(category);
        }
    };

    const handleDeleteRequest = (categoryId) => {
        setCategoryToDelete(categoryId);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/categories/${categoryToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            setCategories(categories.filter(c => c._id !== categoryToDelete));
            setShowConfirmModal(false);
            setCategoryToDelete(null);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <Fragment>
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Manage Categories</h2>
            </header>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <form onSubmit={handleAddCategory} className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Add new category..."
                        className="flex-grow appearance-none border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                        disabled={categories.length >= 10}
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400" disabled={categories.length >= 10}>
                        Add
                    </button>
                </form>
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {categories.map(cat => (
                        <li key={cat._id} className="p-4 flex items-center justify-between">
                            {editingCategory?._id === cat._id ? (
                                <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    onKeyDown={(e) => handleEditKeyDown(e, editingCategory)}
                                    className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg py-1 px-2 bg-white dark:bg-gray-800"
                                    autoFocus
                                />
                            ) : (
                                <span className="font-semibold">{cat.name}</span>
                            )}
                            <div className="flex items-center space-x-2">
                                {editingCategory?._id === cat._id ? (
                                    <button onClick={() => handleUpdateCategory(editingCategory)} className="text-green-500 hover:text-green-700 p-2 rounded-lg">Save</button>
                                ) : (
                                    <button onClick={() => setEditingCategory(cat)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg">Edit</button>
                                )}
                                <button onClick={() => handleDeleteRequest(cat._id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-lg">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? This will also remove the category from all associated tasks."
            />
        </Fragment>
    );
};

const Stats = () => {
    const [tasks, setTasks] = useState([]);
    const statusChartRef = useRef(null);
    const categoryChartRef = useRef(null);
    const trendChartRef = useRef(null);
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
            setTasks(response.data);
        };
        fetchTasks();
    }, []);

    const chartJsDefaults = (isDark) => {
        Chart.defaults.color = isDark ? '#9ca3af' : '#4b5563';
        Chart.defaults.borderColor = isDark ? '#374151' : '#e5e7eb';
    };

    // Chart 1: Task Status Doughnut Chart
    useEffect(() => {
        if (tasks.length > 0 && statusChartRef.current) {
            chartJsDefaults(theme === 'dark');
            const completedTasks = tasks.filter(t => t.completed).length;
            const incompleteTasks = tasks.length - completedTasks;

            const chartInstance = new Chart(statusChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Incomplete'],
                    datasets: [{
                        data: [completedTasks, incompleteTasks],
                        backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(236, 72, 153, 0.7)'],
                        borderColor: [theme === 'dark' ? '#111827' : '#fff', theme === 'dark' ? '#111827' : '#fff'],
                        borderWidth: 3,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Overall Task Status', font: { size: 16 } }
                    }
                },
            });
            return () => chartInstance.destroy();
        }
    }, [tasks, theme]);

    // Chart 2: Tasks per Category Bar Chart
    useEffect(() => {
        if (tasks.length > 0 && categoryChartRef.current) {
            chartJsDefaults(theme === 'dark');
            const categories = tasks.reduce((acc, task) => {
                acc[task.category] = (acc[task.category] || 0) + 1;
                return acc;
            }, {});
            
            const chartInstance = new Chart(categoryChartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        label: 'Number of Tasks',
                        data: Object.values(categories),
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Tasks per Category', font: { size: 16 } }
                    }
                }
            });
            return () => chartInstance.destroy();
        }
    }, [tasks, theme]);

    // Chart 3: Completion Trend Line Chart
    useEffect(() => {
        if (tasks.length > 0 && trendChartRef.current) {
            chartJsDefaults(theme === 'dark');
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const completedTasksByDay = tasks
                .filter(task => task.completed && task.completedAt)
                .reduce((acc, task) => {
                    const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
                    if (last7Days.includes(completedDate)) {
                        acc[completedDate] = (acc[completedDate] || 0) + 1;
                    }
                    return acc;
                }, {});

            const chartData = last7Days.map(date => completedTasksByDay[date] || 0);

            const chartInstance = new Chart(trendChartRef.current, {
                type: 'line',
                data: {
                    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Tasks Completed',
                        data: chartData,
                        fill: true,
                        backgroundColor: 'rgba(236, 72, 153, 0.2)',
                        borderColor: 'rgba(236, 72, 153, 1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Completion Trend (Last 7 Days)', font: { size: 16 } }
                    }
                }
            });
            return () => chartInstance.destroy();
        }
    }, [tasks, theme]);

    return (
        <Fragment>
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Statistics</h2>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800"><canvas ref={statusChartRef}></canvas></div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800"><canvas ref={categoryChartRef}></canvas></div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 lg:col-span-2 border border-gray-200 dark:border-gray-800"><canvas ref={trendChartRef}></canvas></div>
            </div>
        </Fragment>
    );
};

const About = () => {
    return (
        <Fragment>
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">About</h2>
            </header>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 space-y-4 border border-gray-200 dark:border-gray-800">
                <p>This is a simple task manager application built with React, Node.js, and MongoDB.</p>
                <p>Content to be provided later.</p>
            </div>
        </Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));