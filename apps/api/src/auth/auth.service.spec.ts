import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  let prismaMock: {
    user: {
      update: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    emailVerification: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  let usersServiceMock: {
    findByEmail: jest.Mock;
  };

  let jwtServiceMock: {
    sign: jest.Mock;
    verify: jest.Mock;
  };

  let configServiceMock: {
    get: jest.Mock;
  };

  let emailServiceMock: {
    sendVerificationCode: jest.Mock;
    sendWelcomeEmail: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      emailVerification: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    usersServiceMock = {
      findByEmail: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn(),
    };

    emailServiceMock = {
      sendVerificationCode: jest.fn(),
      sendWelcomeEmail: jest.fn(),
    };

    authService = new AuthService(
      prismaMock as any,
      usersServiceMock as any,
      jwtServiceMock as any,
      configServiceMock as any,
      emailServiceMock as any,
    );

    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TC-AUTH-001 auto-verifies a valid user when SMTP is not configured', async () => {
    // TC-AUTH-001
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'SMTP_USER') {
        return 'your-email@example.com';
      }

      if (key === 'SMTP_PASS') {
        return 'your-app-password';
      }

      return undefined;
    });

    const storedUser = {
      id: 'user-1',
      email: '  User@Example.com ',
      password: 'hashed-password',
      name: 'Unit Tester',
      role: 'USER',
      isEmailVerified: false,
    };

    const verifiedUser = {
      ...storedUser,
      isEmailVerified: true,
    };

    usersServiceMock.findByEmail.mockResolvedValue(storedUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue(verifiedUser);

    const result = await authService.validateUserForLogin('  User@Example.com ', 'secret-password');

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isEmailVerified: true },
    });
    expect(result).toEqual({
      id: 'user-1',
      email: '  User@Example.com ',
      name: 'Unit Tester',
      role: 'USER',
      isEmailVerified: true,
    });
  });

  it('TC-AUTH-002 asks for email verification when SMTP is configured', async () => {
    // TC-AUTH-002
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'SMTP_USER') {
        return 'noreply@canvas-llm.com';
      }

      if (key === 'SMTP_PASS') {
        return 'real-app-password';
      }

      return undefined;
    });

    const storedUser = {
      id: 'user-2',
      email: 'pending@example.com',
      password: 'hashed-password',
      name: 'Pending User',
      role: 'USER',
      isEmailVerified: false,
    };

    usersServiceMock.findByEmail.mockResolvedValue(storedUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const resendVerificationSpy = jest.spyOn(authService, 'resendVerificationCode').mockResolvedValue(undefined as any);

    await expect(authService.validateUserForLogin('pending@example.com', 'secret-password')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(resendVerificationSpy).toHaveBeenCalledWith({ email: 'pending@example.com' });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});