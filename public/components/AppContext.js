const { useState, useContext, createContext } = React;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    return (
        <AppContext.Provider value={{ tasks, fetchTasks }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
