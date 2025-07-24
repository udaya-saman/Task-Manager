const { useState, useEffect, useRef } = React;

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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{task ? 'Edit Task' : 'Add New Task'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="title">
                            Task Title
                        </label>
                        <input
                            className="appearance-none border border-slate-300 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                            id="title" type="text" placeholder="e.g., Finish project report"
                            value={title} onChange={(e) => setTitle(e.target.value)} required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="category">
                            Category
                        </label>
                        {showNewCategoryInput ? (
                            <input
                                ref={newCategoryInputRef}
                                className="appearance-none border border-slate-300 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                className="appearance-none border border-slate-300 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="add-new" className="font-bold text-purple-600">+ Add a new category</option>
                                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 font-bold py-2 px-4 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {task ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};