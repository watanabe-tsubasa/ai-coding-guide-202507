import { parseArgs } from 'node:util';
import { getRepository, TodoRepository } from './repository';

// Export the main function for testing
export async function runCliApp(argv: string[], consoleMock: Console = console) {
  // Temporarily override process.argv for parseArgs
  const originalArgv = process.argv;
  process.argv = ['node', 'cli.ts', ...argv];

  const { positionals } = parseArgs({
    allowPositionals: true,
  });

  process.argv = originalArgv; // Restore original process.argv

  const [command, ...args] = positionals;

  let repository: TodoRepository | undefined;

  try {
    repository = getRepository();

    switch (command) {
      case 'add': {
        const [text] = args;
        if (!text) {
          consoleMock.error('Error: Missing text for "add" command.');
          throw new Error('Missing text for "add" command.');
        }
        const newTodo = await repository.add(text);
        consoleMock.log(`Added todo: "${newTodo.text}" with ID ${newTodo.id}`);
        break;
      }

      case 'list': {
        const todos = await repository.list();
        if (todos.length === 0) {
          consoleMock.log('No todos yet!');
        } else {
          consoleMock.log('--- TODOs ---');
          todos.forEach(todo => {
            const status = todo.completed ? '[x]' : '[ ]';
            consoleMock.log(`${status} ${todo.id}: ${todo.text}`);
          });
        }
        break;
      }

      case 'done': {
        const [idStr] = args;
        if (!idStr) {
          consoleMock.error('Error: Missing ID for "done" command.');
          throw new Error('Missing ID for "done" command.');
        }
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
            consoleMock.error('Error: Invalid ID provided.');
            throw new Error('Invalid ID provided.');
        }
        const todo = await repository.getById(id);
        if (!todo) {
            consoleMock.error(`Error: Todo with ID ${id} not found.`);
            throw new Error(`Todo with ID ${id} not found.`);
        }
        const updatedTodo = await repository.update(id, todo.text, true);
        consoleMock.log(`Completed todo: "${updatedTodo!.text}"`);
        break;
      }

      case 'delete': {
        const [idStr] = args;
        if (!idStr) {
          consoleMock.error('Error: Missing ID for "delete" command.');
          throw new Error('Missing ID for "delete" command.');
        }
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
            consoleMock.error('Error: Invalid ID provided.');
            throw new Error('Invalid ID provided.');
        }
        const deleted = await repository.delete(id);
        if (deleted) {
          consoleMock.log(`Deleted todo with ID ${id}`);
        } else {
          consoleMock.error(`Error: Todo with ID ${id} not found.`);
          throw new Error(`Todo with ID ${id} not found.`);
        }
        break;
      }

      default:
        consoleMock.log(`
          Unknown command: ${command || ''}

          Usage:
          - add "<text>": Add a new todo
          - list: List all todos
          - done <id>: Mark a todo as completed
          - delete <id>: Delete a todo
        `);
        throw new Error('Unknown command');
    }
  } finally {
    // Disconnect Prisma client if it was used
    if (repository && 'disconnect' in repository && typeof repository.disconnect === 'function') {
      await (repository as any).disconnect();
    }
  }
}

// This block will only run when the script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCliApp(process.argv.slice(2));
}
