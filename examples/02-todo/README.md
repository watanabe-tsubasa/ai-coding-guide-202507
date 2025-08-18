# Todo CLI Application

This is a simple command-line interface (CLI) application for managing a TODO list. The data is stored in a local SQLite database file (`database.db`).

## Setup and Installation

1.  **Install dependencies:**
    Navigate to the project directory and install the necessary packages.
    ```bash
    npm install
    ```

2.  **Build the project:**
    Compile the TypeScript code into JavaScript.
    ```bash
    npm run build
    ```

3.  **Link the CLI:**
    To use the `todo` command globally from your terminal, link the package.
    ```bash
    npm link
    ```
    You may need to use `sudo` depending on your system configuration.

## Usage

Once linked, you can use the `todo` command from anywhere in your terminal.

### Add a new todo

```bash
todo add "Buy milk and eggs"
```

### List all todos

```bash
todo list
```
**Output:**
```
--- TODOs ---
[ ] 1: Buy milk and eggs
```

### Mark a todo as completed

Use the ID of the todo you want to mark as done.

```bash
todo done 1
```

### Delete a todo

Use the ID of the todo you want to delete.

```bash
todo delete 1
```