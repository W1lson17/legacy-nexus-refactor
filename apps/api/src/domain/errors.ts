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