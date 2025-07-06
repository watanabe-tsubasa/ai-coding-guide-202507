import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.todo.deleteMany();

  // Create sample todos
  const todos = await prisma.todo.createMany({
    data: [
      {
        title: 'Setup development environment',
        description: 'Install Node.js, npm, and required tools',
        completed: true,
        priority: 2,
      },
      {
        title: 'Create API endpoints',
        description: 'Implement RESTful API for Todo operations',
        completed: true,
        priority: 2,
      },
      {
        title: 'Build Next.js dashboard',
        description: 'Create a user-friendly interface for managing todos',
        completed: false,
        priority: 1,
      },
      {
        title: 'Write tests',
        description: 'Add unit and integration tests for API',
        completed: false,
        priority: 1,
      },
      {
        title: 'Deploy to production',
        description: 'Set up CI/CD pipeline and deploy the application',
        completed: false,
        priority: 0,
        dueDate: new Date('2025-08-01'),
      },
    ],
  });

  console.log(`Created ${todos.count} todos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });