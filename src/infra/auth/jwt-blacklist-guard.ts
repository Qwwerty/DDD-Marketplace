import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { CacheRepository } from '../cache/cache-repository'

@Injectable()
export class JwtBlacklistGuard implements CanActivate {
  constructor(private cache: CacheRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (!request.user) {
      return true
    }

    const { sub } = request.user

    const isRevoked = await this.cache.get(`user-token:${sub}`)

    if (isRevoked) {
      throw new UnauthorizedException('Token revogado')
    }

    return true
  }
}
