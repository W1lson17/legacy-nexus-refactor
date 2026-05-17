export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid username or password');
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('Authentication required');
  }
}

export class ForbiddenError extends DomainError {
  constructor() {
    super('Insufficient permissions');
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string | number) {
    super(`${entity} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}