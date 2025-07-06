import { test, expect } from '@playwright/test';

test.describe('Todo Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the dashboard title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Todo Dashboard');
  });

  test('should create a new todo', async ({ page }) => {
    const todoTitle = 'Test Todo ' + Date.now();
    const todoDescription = 'This is a test description';

    // Fill in the form
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', todoDescription);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for the new todo to appear
    await expect(page.locator('h3').filter({ hasText: todoTitle })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: todoDescription })).toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Todo to Complete ' + Date.now();
    await page.fill('input[id="title"]', todoTitle);
    await page.click('button[type="submit"]');
    
    // Wait for the todo to appear
    await expect(page.locator('h3').filter({ hasText: todoTitle })).toBeVisible();
    
    // Find the checkbox for this specific todo and click it
    const todoItem = page.locator('li').filter({ hasText: todoTitle });
    const checkbox = todoItem.locator('input[type="checkbox"]');
    
    // Verify initial state
    await expect(checkbox).not.toBeChecked();
    
    // Toggle completion
    await checkbox.click();
    
    // Verify the todo is marked as completed (has line-through style)
    await expect(todoItem.locator('h3')).toHaveClass(/line-through/);
    await expect(checkbox).toBeChecked();
  });

  test('should delete a todo', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Todo to Delete ' + Date.now();
    await page.fill('input[id="title"]', todoTitle);
    await page.click('button[type="submit"]');
    
    // Wait for the todo to appear
    await expect(page.locator('h3').filter({ hasText: todoTitle })).toBeVisible();
    
    // Count todos before deletion
    const initialCount = await page.locator('li').count();
    
    // Find and click the delete button for this specific todo
    const todoItem = page.locator('li').filter({ hasText: todoTitle });
    await todoItem.locator('button:has-text("Delete")').click();
    
    // Verify the todo is removed
    await expect(page.locator('h3').filter({ hasText: todoTitle })).not.toBeVisible();
    
    // Verify the count decreased
    const finalCount = await page.locator('li').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('should show empty state when no todos exist', async ({ page }) => {
    // Delete all existing todos
    while (await page.locator('button:has-text("Delete")').count() > 0) {
      await page.locator('button:has-text("Delete")').first().click();
      await page.waitForTimeout(500); // Small delay to ensure deletion is processed
    }
    
    // Verify empty state message
    await expect(page.locator('text=No todos yet. Create one above!')).toBeVisible();
  });

  test('should persist todos after page reload', async ({ page }) => {
    // Create a todo
    const todoTitle = 'Persistent Todo ' + Date.now();
    await page.fill('input[id="title"]', todoTitle);
    await page.click('button[type="submit"]');
    
    // Wait for the todo to appear
    await expect(page.locator('h3').filter({ hasText: todoTitle })).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Verify the todo is still there
    await expect(page.locator('h3').filter({ hasText: todoTitle })).toBeVisible();
  });

  test('should validate required title field', async ({ page }) => {
    // Try to submit without filling the title
    await page.click('button[type="submit"]');
    
    // Check for HTML5 validation
    const titleInput = page.locator('input[id="title"]');
    const validationMessage = await titleInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});