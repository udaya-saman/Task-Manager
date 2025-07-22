const { useState, useEffect, Fragment } = React;

// --- Main App Component ---
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                } catch (error) {
                    // Token is invalid or expired
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
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                {showLogin ? (
                    <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
                ) : (
                    <Signup onSwitch={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-50 text-slate-800 flex min-h-screen">
            <Sidebar user={user} onLogout={handleLogout} />
            <TaskManager />
        </div>
    );
};

// --- Authentication Components ---
const Login = ({ onLogin, onSwitch }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const { token } = response.data;
            // After login, fetch user data
            const userResponse = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            onLogin(token, userResponse.data);
        } catch (error) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">Welcome Back</h2>
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="username" type="text" placeholder="Enter your username"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="password" type="password" placeholder="••••••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                    type="submit">
                    Sign In
                </button>
                <p className="text-center text-sm text-slate-600 mt-6">
                    Don't have an account?{' '}
                    <a href="#" onClick={onSwitch} className="font-bold text-blue-600 hover:text-blue-800">
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
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-900">Create an Account</h2>
            {message && <p className="text-green-500 text-center mb-4 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="signup-username">
                        Username
                    </label>
                    <input
                        className="appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="signup-username" type="text" placeholder="Choose a username"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="signup-password">
                        Password
                    </label>
                    <input
                        className="appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="signup-password" type="password" placeholder="••••••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                    type="submit">
                    Sign Up
                </button>
                <p className="text-center text-sm text-slate-600 mt-6">
                    Already have an account?{' '}
                    <a href="#" onClick={onSwitch} className="font-bold text-blue-600 hover:text-blue-800">
                        Sign In
                    </a>
                </p>
            </form>
        </div>
    );
};


// --- UI Components ---
const Sidebar = ({ user, onLogout }) => {
    const menuItems = ['Overview', 'Stats', 'Projects', 'Chat', 'Calendar'];
    return (
        <aside className="w-64 bg-white p-8 border-r border-slate-200 flex-shrink-0 flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Task Manager</h1>
            <div className="flex items-center mb-10">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <p className="ml-3 font-bold text-slate-800">{user.username}</p>
            </div>
            <nav className="flex-grow">
                <ul>
                    {menuItems.map(item => (
                        <li key={item} className="mb-4">
                            <a href="#" className={`flex items-center p-2 rounded-lg font-bold ${item === 'Projects' ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <button onClick={onLogout} className="w-full flex items-center justify-center p-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H3"></path></svg>
                Logout
            </button>
        </aside>
    );
};

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

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
        setTasks([...tasks, task]);
        setShowModal(false);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
        setShowModal(false);
        setSelectedTask(null);
    };

    const handleTaskDeleted = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasks.filter(task => task._id !== taskId));
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

    return (
        <main className="flex-1 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Today's Tasks</h2>
                    <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={() => { setSelectedTask(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add New Task
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm">
                <ul className="divide-y divide-slate-200">
                    {tasks.length > 0 ? tasks.map(task => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onToggleComplete={() => handleToggleComplete(task)}
                            onEdit={() => { setSelectedTask(task); setShowModal(true); }}
                            onDelete={() => handleTaskDeleted(task._id)}
                        />
                    )) : (
                        <li className="p-6 text-center text-slate-500">No tasks yet. Add one to get started!</li>
                    )}
                </ul>
            </div>

            {showModal && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => { setShowModal(false); setSelectedTask(null); }}
                    onTaskAdded={handleTaskAdded}
                    onTaskUpdated={handleTaskUpdated}
                />
            )}
        </main>
    );
};

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
    return (
        <li className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={onToggleComplete}
                    className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4">
                    <p className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{task.category}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                </button>
                <button onClick={onDelete} className="text-slate-400 hover:text-red-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </li>
    );
};

const TaskModal = ({ task, onClose, onTaskAdded, onTaskUpdated }) => {
    const [title, setTitle] = useState(task ? task.title : '');
    const [category, setCategory] = useState(task ? task.category : 'General');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const taskData = { title, category };

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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">{task ? 'Edit Task' : 'Add New Task'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="title">
                            Task Title
                        </label>
                        <input
                            className="appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="title" type="text" placeholder="e.g., Finish project report"
                            value={title} onChange={(e) => setTitle(e.target.value)} required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="category">
                            Category
                        </label>
                        <input
                            className="appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="category" type="text" placeholder="e.g., Work"
                            value={category} onChange={(e) => setCategory(e.target.value)} required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {task ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));