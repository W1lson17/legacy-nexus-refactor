import type { UserRepository } from '../../domain/ports/UserRepository.js';
import { UnauthorizedError } from '../../domain/errors.js';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: GetCurrentUserUseCase.Input): Promise<GetCurrentUserUseCase.Output> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    return { user: user.toSafeOutput() };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetCurrentUserUseCase {
  export interface Input {
    userId: number;
  }

  export interface Output {
    user: { id: number; username: string; isAdmin: boolean };
  }
}