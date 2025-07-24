const { useState, useEffect, useRef } = React;

const Stats = ({ tasks }) => {
    const statusChartRef = useRef(null);
    const categoryChartRef = useRef(null);
    const trendChartRef = useRef(null);
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    const chartJsDefaults = (isDark) => {
        Chart.defaults.color = isDark ? '#cbd5e1' : '#475569';
        Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0';
    };

    // Chart 1: Task Status Doughnut Chart
    useEffect(() => {
        if (tasks.length > 0 && statusChartRef.current) {
            chartJsDefaults(theme === 'dark');
            const completedTasks = tasks.filter(t => t.completed).length;
            const incompleteTasks = tasks.length - completedTasks;

            const chartInstance = new Chart(statusChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Incomplete'],
                    datasets: [{
                        data: [completedTasks, incompleteTasks],
                        backgroundColor: ['rgba(147, 51, 234, 0.7)', 'rgba(236, 72, 153, 0.7)'],
                        borderColor: [theme === 'dark' ? '#1e293b' : '#fff', theme === 'dark' ? '#1e293b' : '#fff'],
                        borderWidth: 2,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Overall Task Status' }
                    }
                },
            });
            return () => chartInstance.destroy();
        }
    }, [tasks, theme]);

    // Chart 2: Tasks per Category Bar Chart
    useEffect(() => {
        if (tasks.length > 0 && categoryChartRef.current) {
            chartJsDefaults(theme === 'dark');
            const categories = tasks.reduce((acc, task) => {
                acc[task.category] = (acc[task.category] || 0) + 1;
                return acc;
            }, {});
            
            const chartInstance = new Chart(categoryChartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        label: 'Number of Tasks',
                        data: Object.values(categories),
                        backgroundColor: 'rgba(147, 51, 234, 0.7)',
                        borderColor: 'rgba(147, 51, 234, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Tasks per Category' }
                    }
                }
            });
            return () => chartInstance.destroy();
        }
    }, [tasks, theme]);

    // Chart 3: Completion Trend Line Chart
    useEffect(() => {
        if (tasks.length > 0 && trendChartRef.current) {
            chartJsDefaults(theme === 'dark');
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const completedTasksByDay = tasks
                .filter(task => task.completed && task.completedAt)
                .reduce((acc, task) => {
                    const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
                    if (last7Days.includes(completedDate)) {
                        acc[completedDate] = (acc[completedDate] || 0) + 1;
                    }
                    return acc;
                }, {});

            const chartData = last7Days.map(date => completedTasksByDay[date] || 0);

            const chartInstance = new Chart(trendChartRef.current, {
                type: 'line',
                data: {
                    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Tasks Completed',
                        data: chartData,
                        fill: true,
                        backgroundColor: 'rgba(236, 72, 153, 0.2)',
                        borderColor: 'rgba(236, 72, 153, 1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Completion Trend (Last 7 Days)' }
                    }
                }
            });
            return () => chartInstance.destroy();
        }
    }, [tasks, theme]);

    return (
        <React.Fragment>
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Statistics</h2>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6"><canvas ref={statusChartRef}></canvas></div>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6"><canvas ref={categoryChartRef}></canvas></div>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 lg:col-span-2"><canvas ref={trendChartRef}></canvas></div>
            </div>
        </React.Fragment>
    );
};