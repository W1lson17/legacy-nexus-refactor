import type { UserRepository } from '../../domain/ports/UserRepository.js';
import type { TokenService, TokenPayload } from '../../domain/ports/TokenService.js';
import type { PasswordHasher } from '../../domain/ports/PasswordHasher.js';
import { InvalidCredentialsError } from '../../domain/errors.js';

export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUseCase.Input): Promise<LoginUseCase.Output> {
    const user = await this.userRepo.findByUsername(input.username);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await user.checkPassword(input.password, this.passwordHasher);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    const tokens = this.tokenService.generate(payload);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toSafeOutput(),
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace LoginUseCase {
  export interface Input {
    username: string;
    password: string;
  }

  export interface Output {
    accessToken: string;
    refreshToken: string;
    user: { id: number; username: string; isAdmin: boolean };
  }
}