const { useState, useEffect, Fragment } = React;
const { useAppContext } = AppContext;

const TaskManager = ({ setCurrentView }) => {
    const { tasks, fetchTasks } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(6);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskAdded = () => {
        fetchTasks();
        setShowModal(false);
    };

    const handleTaskUpdated = () => {
        fetchTasks();
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
            fetchTasks();
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
            await axios.put(`/api/tasks/${task._id}`, updatedTaskData, { headers: { Authorization: `Bearer ${token}` } });
            fetchTasks();
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
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Today's Tasks</h2>
                    <p className="text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="appearance-none border border-slate-300 dark:border-slate-600 rounded-lg py-3 px-4 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="newest">Sort by Newest</option>
                        <option value="oldest">Sort by Oldest</option>
                        <option value="a-z">Sort by A-Z</option>
                        <option value="z-a">Sort by Z-A</option>
                    </select>
                    <button onClick={() => { setSelectedTask(null); setShowModal(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add New Task
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {currentTasks.length > 0 ? currentTasks.map(task => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onToggleComplete={() => handleToggleComplete(task)}
                            onEdit={() => { setSelectedTask(task); setShowModal(true); }}
                            onDelete={() => handleDeleteRequest(task._id)}
                        />
                    )) : (
                        <li className="p-6 text-center text-slate-500 dark:text-slate-400">No tasks yet. Add one to get started!</li>
                    )}
                </ul>
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