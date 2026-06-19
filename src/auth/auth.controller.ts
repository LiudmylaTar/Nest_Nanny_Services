import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  AuthTokensResponseDto,
  MeResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
import type { AuthUser } from './type/auth-user.type';
import {
  REFRESH_COOKIE_NAME,
  refreshCookieClearOptions,
  refreshCookieOptions,
} from './constants/refresh-cookie.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getRefreshToken(req: Request, body?: RefreshTokenDto): string {
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] ?? body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return refreshToken;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Postman: send JSON body only. Response returns accessToken + user. refreshToken is set as httpOnly cookie (check Cookies tab, not JSON body).',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    type: AuthTokensResponseDto,
    description: 'Also sets Set-Cookie: refreshToken (httpOnly)',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    return { accessToken, user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description:
      'Postman: send email + password in body. Save accessToken from response for GET /auth/me. refreshToken goes to cookie automatically.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: AuthTokensResponseDto,
    description: 'Also sets Set-Cookie: refreshToken (httpOnly)',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return {
      accessToken,
      user,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset email',
    description:
      'Postman: send email in body. Always returns the same message (does not reveal if email exists). Check email for reset link with ?token=...',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token from email',
    description:
      'Postman: copy token value from email link (?token=...) into JSON body. password and confirmPassword must match. Revokes all refresh sessions.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Postman option A: call after login without body — cookie refreshToken is sent automatically. Option B: send refreshToken in JSON body (manual testing). Returns new accessToken + user and rotates refresh cookie.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    required: false,
    description: 'Optional when refreshToken cookie is present',
  })
  @ApiOkResponse({
    type: AuthTokensResponseDto,
    description: 'Also sets new Set-Cookie: refreshToken (rotation)',
  })
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshToken(req, body);
    const { accessToken, refreshToken: newRefreshToken, user } =
      await this.authService.refresh(refreshToken);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

    return { accessToken, user };
  }

  @Auth()
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Postman: Authorization tab → Bearer Token → paste accessToken from login/refresh. No body.',
  })
  @ApiOkResponse({ type: MeResponseDto })
  getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout',
    description:
      'Postman option A: call with cookie after login (no body). Option B: send refreshToken in body. Revokes refresh in DB and clears refreshToken cookie. accessToken may still work until it expires (~15 min).',
  })
  @ApiBody({
    type: LogoutDto,
    required: false,
    description: 'Optional when refreshToken cookie is present',
  })
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(
    @Req() req: Request,
    @Body() body: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] ?? body?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieClearOptions);

    return { message: 'Logged out successfully' };
  }
}
