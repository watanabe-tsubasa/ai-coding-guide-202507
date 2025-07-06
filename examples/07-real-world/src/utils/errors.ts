export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const NotFoundError = (resource: string) => 
  new ApiError(404, `${resource} not found`);

export const ValidationError = (message: string) => 
  new ApiError(400, message);