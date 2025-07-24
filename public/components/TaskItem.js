const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
    return (
        <li className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={onToggleComplete}
                    className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 bg-transparent"
                />
                <div className="ml-4">
                    <p className={`font-semibold text-slate-800 dark:text-slate-200 ${task.completed ? 'line-through text-slate-500 dark:text-slate-500' : ''}`}>{task.title}</p>
                    <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">{task.category}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onEdit} className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                </button>
                <button onClick={onDelete} className="text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </li>
    );
};