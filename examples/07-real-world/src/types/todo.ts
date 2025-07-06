export interface CreateTodoDto {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: number;
  dueDate?: string;
}