import { parseArgs } from 'node:util';
import { Database } from './db.js';

export class TodoCLI {
  private db: Database;

  constructor(dbPath: string = './todos.db') {
    this.db = new Database(dbPath);
  }

  async run(args: string[]): Promise<void> {
    const { positionals } = parseArgs({
      args,
      allowPositionals: true,
      strict: false
    });

    const [command, ...commandArgs] = positionals;

    try {
      switch (command) {
        case 'add':
          await this.add(commandArgs);
          break;
        case 'list':
          await this.list();
          break;
        case 'done':
          await this.done(commandArgs);
          break;
        case 'undone':
          await this.undone(commandArgs);
          break;
        case 'delete':
          await this.delete(commandArgs);
          break;
        case 'help':
          this.help();
          break;
        default:
          console.error(`Unknown command: ${command}`);
          this.help();
          process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async add(args: string[]): Promise<void> {
    if (args.length === 0) {
      throw new Error('Please provide a todo title');
    }
    
    const title = args.join(' ');
    const todo = this.db.create(title);
    console.log(`✅ Created todo #${todo.id}: ${todo.title}`);
  }

  private async list(): Promise<void> {
    const todos = this.db.findAll();
    
    if (todos.length === 0) {
      console.log('No todos found. Add one with: todo add "Your task"');
      return;
    }

    console.log('\n📋 Your todos:\n');
    todos.forEach(todo => {
      const status = todo.completed ? '✅' : '⬜';
      const date = new Date(todo.created_at).toLocaleDateString();
      console.log(`${status} [${todo.id}] ${todo.title} (${date})`);
    });

    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    console.log(`\n📊 Progress: ${completed}/${total} completed`);
  }

  private async done(args: string[]): Promise<void> {
    const id = parseInt(args[0]);
    if (isNaN(id)) {
      throw new Error('Please provide a valid todo ID');
    }

    const todo = this.db.update(id, { completed: true });
    if (!todo) {
      throw new Error(`Todo #${id} not found`);
    }
    
    console.log(`✅ Marked todo #${todo.id} as completed: ${todo.title}`);
  }

  private async undone(args: string[]): Promise<void> {
    const id = parseInt(args[0]);
    if (isNaN(id)) {
      throw new Error('Please provide a valid todo ID');
    }

    const todo = this.db.update(id, { completed: false });
    if (!todo) {
      throw new Error(`Todo #${id} not found`);
    }
    
    console.log(`⬜ Marked todo #${todo.id} as not completed: ${todo.title}`);
  }

  private async delete(args: string[]): Promise<void> {
    const id = parseInt(args[0]);
    if (isNaN(id)) {
      throw new Error('Please provide a valid todo ID');
    }

    const todo = this.db.findById(id);
    if (!todo) {
      throw new Error(`Todo #${id} not found`);
    }

    const deleted = this.db.delete(id);
    if (deleted) {
      console.log(`🗑️  Deleted todo #${id}: ${todo.title}`);
    }
  }

  private help(): void {
    console.log(`
Todo CLI - Simple task management

Usage:
  todo <command> [arguments]

Commands:
  add <title>     Add a new todo
  list            List all todos
  done <id>       Mark a todo as completed
  undone <id>     Mark a todo as not completed
  delete <id>     Delete a todo
  help            Show this help message

Examples:
  todo add "Buy groceries"
  todo list
  todo done 1
  todo delete 2
    `);
  }

  close(): void {
    this.db.close();
  }
}