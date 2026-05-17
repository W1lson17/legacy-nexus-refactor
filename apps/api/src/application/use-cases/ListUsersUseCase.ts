import type { UserRepository } from '../../domain/ports/UserRepository.js';

export class ListUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(): Promise<ListUsersUseCase.Output> {
    const users = await this.userRepo.findAll();
    return { users: users.map((u) => u.toSafeOutput()) };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListUsersUseCase {
  export interface Input {} // eslint-disable-line @typescript-eslint/no-empty-object-type

  export interface Output {
    users: Array<{ id: number; username: string; isAdmin: boolean }>;
  }
}