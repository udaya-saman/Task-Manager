const Sidebar = ({ user, onLogout, currentView, setCurrentView, toggleTheme, isOpen, setOpen }) => {
    const menuItems = ['Tasks', 'Stats', 'Category', 'About'];
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    return (
        <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 p-6 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Manager</h1>
                <button onClick={() => setOpen(false)} className="md:hidden p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div className="flex items-center mb-10">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <p className="ml-3 font-bold text-slate-800 dark:text-slate-200">{user.username}</p>
            </div>
            <nav className="flex-grow">
                <ul>
                    {menuItems.map(item => (
                        <li key={item} className="mb-4">
                            <a href="#" onClick={() => { setCurrentView(item); setOpen(false); }} className={`flex items-center p-2 rounded-lg font-bold ${item === currentView ? 'bg-purple-100 text-purple-600 dark:bg-slate-800 dark:text-purple-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex flex-col space-y-2">
                <button onClick={toggleTheme} className="w-full flex items-center justify-center p-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                    {theme === 'light' ? 
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> :
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    }
                    Toggle Theme
                </button>
                <button onClick={onLogout} className="w-full flex items-center justify-center p-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H3"></path></svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};