# Task Manager

A modern, full-stack web application for managing daily tasks, built with Node.js, Express, and React. This project features a clean, responsive interface with light and dark themes, robust task management, and insightful statistics.

## Features

*   **User Authentication:** Secure user signup and login functionality using JSON Web Tokens (JWT).
*   **Task Management:**
    *   Create, read, update, and delete tasks.
    *   Mark tasks as completed or incomplete.
    *   Organize tasks with custom categories.
    *   Sort tasks by creation date or alphabetically.
    *   Paginated task view with "Previous" and "Next" buttons to handle a large number of tasks.
*   **Category Management:**
    *   Create, rename, and delete task categories.
*   **User-Friendly Interface:**
    *   Light and dark themes to suit your preference.
    *   Fully responsive design for seamless use on desktop and mobile devices.
    *   Modern, custom confirmation modals for destructive actions.
    *   Intuitive keyboard controls for improved accessibility.
*   **Task Statistics:**
    *   Visualize your productivity with charts showing overall task status, tasks per category, and completion trends over the last 7 days.
*   **Automated Cleanup:**
    *   A cron job runs daily to delete users who have been inactive for more than 30 days, ensuring a clean and optimized database.

## Tech Stack

*   **Backend:** Node.js, Express.js, `node-cron` for scheduling tasks.
*   **Frontend:** React (served via CDN), JavaScript (ES6+), Babel
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication:** JSON Web Tokens (JWT) for securing API endpoints, `bcryptjs` for password hashing.
*   **Styling:** Tailwind CSS

## Project Structure

The project is organized into a modular structure for better maintainability and scalability.

```
.
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── taskController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   └── errorMiddleware.js
├── models/
│   ├── category.js
│   ├── task.js
│   └── user.js
├── public/
│   ├── components/
│   │   ├── About.js
│   │   ├── App.js
│   │   ├── CategoryManager.js
│   │   ├── ConfirmModal.js
│   │   ├── Login.js
│   │   ├── Pagination.js
│   │   ├── Sidebar.js
│   │   ├── Signup.js
│   │   ├── Stats.js
│   │   ├── TaskItem.js
│   │   ├── TaskManager.js
│   │   ├── TaskModal.js
│   │   └── useTheme.js
│   ├── app.js
│   ├── favicon.ico
│   ├── index.html
│   └── style.css
├── routes/
│   ├── auth.js
│   ├── category.js
│   ├── task.js
│   └── user.js
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

## Setup and Installation

To get this project up and running on your local machine, follow these steps.

### Prerequisites

*   **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** Ensure you have MongoDB installed and the database server (`mongod`) is running. You can get it from the [MongoDB website](https://www.mongodb.com/try/download/community).

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/udaya-saman/Task-Manager.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd Task-Manager
    ```

3.  **Install dependencies:**
    This will install all the necessary packages for the backend server.
    ```bash
    npm install
    ```

4.  **Start the server:**
    ```bash
    node server.js
    ```
    You should see the messages "MongoDB connected" and "Server is running on http://localhost:3000" in your terminal.

5.  **Access the application:**
    Open your web browser and navigate to `http://localhost:3000`.

## API Endpoints

The backend server provides the following RESTful API endpoints:

| Method | Endpoint             | Description                  | Authentication |
|--------|----------------------|------------------------------|----------------|
| `POST` | `/api/auth/signup`   | Register a new user.         | None           |
| `POST` | `/api/auth/login`    | Log in an existing user.     | None           |
| `GET`  | `/api/auth/me`       | Get the current user's data. | Required       |
| `PUT`  | `/api/user/theme`    | Update the user's theme.     | Required       |
| `GET`  | `/api/tasks`         | Get all tasks for the user.  | Required       |
| `POST` | `/api/tasks`         | Create a new task.           | Required       |
| `PUT`  | `/api/tasks/:id`     | Update an existing task.     | Required       |
| `DELETE`| `/api/tasks/:id`    | Delete a task.               | Required       |
| `GET`  | `/api/categories`    | Get all categories for the user. | Required   |
| `POST` | `/api/categories`    | Create a new category.       | Required       |
| `PUT`  | `/api/categories/:id`| Update an existing category. | Required       |
| `DELETE`| `/api/categories/:id`| Delete a category.         | Required       |
