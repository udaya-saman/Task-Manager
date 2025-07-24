const Pagination = ({ tasksPerPage, totalTasks, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalTasks / tasksPerPage); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null;

    return (
        <nav className="mt-6 flex justify-center">
            <ul className="inline-flex items-center -space-x-px">
                <li>
                    <a
                        onClick={() => paginate(currentPage - 1)}
                        href="#"
                        className={`py-2 px-3 leading-tight ${currentPage === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} border border-slate-300 dark:border-slate-700 rounded-l-lg`}
                    >
                        Previous
                    </a>
                </li>
                {pageNumbers.map(number => (
                    <li key={number}>
                        <a
                            onClick={() => paginate(number)}
                            href="#"
                            className={`py-2 px-3 leading-tight ${currentPage === number ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} border border-slate-300 dark:border-slate-700`}
                        >
                            {number}
                        </a>
                    </li>
                ))}
                <li>
                    <a
                        onClick={() => paginate(currentPage + 1)}
                        href="#"
                        className={`py-2 px-3 leading-tight ${currentPage === pageNumbers.length ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} border border-slate-300 dark:border-slate-700 rounded-r-lg`}
                    >
                        Next
                    </a>
                </li>
            </ul>
        </nav>
    );
};