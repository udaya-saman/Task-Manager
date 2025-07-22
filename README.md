# Simple Task Manager

A full-stack web application for managing daily tasks, built with Node.js, Express, React, and MongoDB. This project features a clean, modern user interface and provides core functionalities like user authentication and complete task management (create, read, update, delete).

## Features

*   **User Authentication:** Secure user signup and login functionality using JSON Web Tokens (JWT).
*   **Task Management:**
    *   Create new tasks with a title and category.
    *   View all tasks in an organized list.
    *   Mark tasks as completed or incomplete.
    *   Update existing task details through a modal interface.
    *   Delete tasks.
*   **Categorized Overview:** See a summary of your tasks grouped by category, including completion counts.
*   **Responsive Design:** A clean and modern UI styled with Tailwind CSS that works on various screen sizes.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Frontend:** React (served via CDN), JavaScript (ES6+)
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication:** JSON Web Tokens (JWT) for securing API endpoints, `bcryptjs` for password hashing.
*   **Styling:** Tailwind CSS

## Setup and Installation

To get this project up and running on your local machine, follow these steps.

### Prerequisites

*   **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** Ensure you have MongoDB installed and the database server (`mongod`) is running. You can get it from the [MongoDB website](https://www.mongodb.com/try/download/community).

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/udaya-saman/Simple-Task-Manager.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd Simple-Task-Manager
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
| `GET`  | `/api/tasks`         | Get all tasks for the user.  | Required       |
| `POST` | `/api/tasks`         | Create a new task.           | Required       |
| `PUT`  | `/api/tasks/:id`     | Update an existing task.     | Required       |
| `DELETE`| `/api/tasks/:id`    | Delete a task.               | Required       |
