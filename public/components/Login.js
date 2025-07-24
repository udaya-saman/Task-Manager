const { useState, useRef } = React;

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
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg w-full max-w-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-white">Welcome Back</h2>
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="appearance-none bg-white/80 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                        id="username" type="text" placeholder="Enter your username"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleUsernameKeyDown}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        ref={passwordInputRef}
                        className="appearance-none bg-white/80 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                        id="password" type="password" placeholder="••••••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handlePasswordKeyDown}
                    />
                </div>
                <button
                    ref={submitButtonRef}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                    type="submit">
                    Sign In
                </button>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <a href="#" onClick={onSwitch} className="font-bold text-purple-600 hover:text-purple-800 dark:hover:text-purple-400">
                        Sign Up
                    </a>
                </p>
            </form>
        </div>
    );
};