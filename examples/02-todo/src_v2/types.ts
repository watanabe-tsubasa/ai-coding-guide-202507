export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface TodoRepository {
  create(title: string): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: number): Promise<Todo | null>;
  update(id: number, data: Partial<Omit<Todo, 'id' | 'created_at'>>): Promise<Todo | null>;
  delete(id: number): Promise<boolean>;
  close?(): Promise<void>;
}