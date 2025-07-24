const { useState, useEffect } = React;

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