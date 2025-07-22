
const { useState, useEffect } = React;

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [showLogin, setShowLogin] = useState(true);

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        setToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    if (!token) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                {showLogin ? (
                    <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
                ) : (
                    <Signup onSwitch={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    return <TaskManager onLogout={handleLogout} />;
};

const Login = ({ onLogin, onSwitch }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            onLogin(response.data.token);
        } catch (error) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="******************"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign In
                    </button>
                    <a
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        href="#"
                        onClick={onSwitch}
                    >
                        Create an Account
                    </a>
                </div>
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
        try {
            await axios.post('/api/auth/signup', { username, password });
            setMessage('Account created successfully! Please login.');
            setError('');
            setTimeout(() => onSwitch(), 2000);
        } catch (error) {
            setError('Error creating account. Please try again.');
            setMessage('');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
            {message && <p className="text-green-500 text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="******************"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign Up
                    </button>
                    <a
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        href="#"
                        onClick={onSwitch}
                    >
                        Already have an account?
                    </a>
                </div>
            </form>
        </div>
    );
};


const TaskManager = ({ onLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskAdded = (task) => {
        setTasks([...tasks, task]);
        setShowModal(false);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
        setShowModal(false);
        setSelectedTask(null);
    };

    const handleTaskDeleted = (taskId) => {
        setTasks(tasks.filter(task => task._id !== taskId));
    };
    
    const handleToggleComplete = async (task) => {
        try {
            const token = localStorage.getItem('token');
            const updatedTask = { ...task, completed: !task.completed };
            const response = await axios.put(`/api/tasks/${task._id}`, updatedTask, {
                headers: { Authorization: `Bearer ${token}` },
            });
            handleTaskUpdated(response.data);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };


    const categories = tasks.reduce((acc, task) => {
        if (!acc[task.category]) {
            acc[task.category] = { total: 0, completed: 0 };
        }
        acc[task.category].total++;
        if (task.completed) {
            acc[task.category].completed++;
        }
        return acc;
    }, {});

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Todo List</h1>
                        <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={onLogout} className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" />
                            </svg>
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Object.entries(categories).map(([category, counts]) => (
                        <div key={category} className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{category}</h3>
                                <p className="text-gray-500">{`${counts.completed}/${counts.total} Task Completed`}</p>
                            </div>
                        </div>
                    ))}
                    <div
                        className="bg-orange-500 text-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => {
                            setSelectedTask(null);
                            setShowModal(true);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="mt-2">Add New</p>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Tasks</h2>
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleToggleComplete(task)}
                                        className="h-6 w-6 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
                                    />
                                    <div className="ml-4">
                                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                                        <p className="text-sm text-gray-500">{task.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => {
                                        setSelectedTask(task);
                                        setShowModal(true);
                                    }} className="text-gray-400 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleTaskDeleted(task._id)} className="text-gray-400 hover:text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedTask(null);
                    }}
                    onTaskAdded={handleTaskAdded}
                    onTaskUpdated={handleTaskUpdated}
                />
            )}
        </div>
    );
};

const TaskModal = ({ task, onClose, onTaskAdded, onTaskUpdated }) => {
    const [title, setTitle] = useState(task ? task.title : '');
    const [category, setCategory] = useState(task ? task.category : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const taskData = { title, category };

        try {
            if (task) {
                const response = await axios.put(`/api/tasks/${task._id}`, taskData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                onTaskUpdated(response.data);
            } else {
                const response = await axios.post('/api/tasks', taskData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                onTaskAdded(response.data);
            }
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{task ? 'Edit Task' : 'Add Task'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Title
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                            Category
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            id="category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            {task ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


ReactDOM.render(<App />, document.getElementById('root'));
