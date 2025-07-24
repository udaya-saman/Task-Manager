const About = () => {
    return (
        <React.Fragment>
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">About</h2>
            </header>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 space-y-4">
                <p>This is a simple task manager application built with React, Node.js, and MongoDB.</p>
                <p>This application is designed to demonstrate a full-stack web application with features like user authentication, task management, and data visualization. The backend is built with Node.js and Express, and the frontend is built with React. The database is MongoDB.</p>
            </div>
        </React.Fragment>
    );
};