const { useState, useEffect, Fragment } = React;

const CategoryManager = ({ setCurrentView }) => {
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
            await axios.put(`/api/categories/${category._id}`, { name: category.name }, { headers: { Authorization: `Bearer ${token}` } });
            setCategories(categories.map(c => c._id === category._id ? { ...c, name: category.name } : c));
            setEditingCategory(null);
            setCurrentView('Tasks'); // Switch back to tasks view
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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Categories</h2>
            </header>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
                <form onSubmit={handleAddCategory} className="mb-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Add new category..."
                        className="flex-grow appearance-none border border-slate-300 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={categories.length >= 10}
                    />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-slate-400" disabled={categories.length >= 10}>
                        Add
                    </button>
                </form>
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {categories.map(cat => (
                        <li key={cat._id} className="p-4 flex items-center justify-between">
                            {editingCategory?._id === cat._id ? (
                                <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    onKeyDown={(e) => handleEditKeyDown(e, editingCategory)}
                                    className="appearance-none border border-slate-300 dark:border-slate-600 rounded-lg py-1 px-2 bg-white dark:bg-slate-800"
                                    autoFocus
                                />
                            ) : (
                                <span className="font-semibold">{cat.name}</span>
                            )}
                            <div className="flex items-center space-x-2">
                                {editingCategory?._id === cat._id ? (
                                    <button onClick={() => handleUpdateCategory(editingCategory)} className="text-green-500 hover:text-green-700 p-2 rounded-lg">Save</button>
                                ) : (
                                    <button onClick={() => setEditingCategory(cat)} className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-lg">Edit</button>
                                )}
                                <button onClick={() => handleDeleteRequest(cat._id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-lg">Delete</button>
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