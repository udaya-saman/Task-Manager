const ConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{title}</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 font-bold py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};