import { Controller, HttpCode, Post } from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CacheRepository } from '@/infra/cache/cache-repository'

@Controller('/sign-out')
export class SignOutController {
  constructor(private cache: CacheRepository) {}

  @Post()
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const { sub, exp } = user

    const now = Math.floor(Date.now() / 1000)
    const ttl = exp - now

    const existsAuthenticate = await this.cache.get(`user-token-${sub}`)

    if (!existsAuthenticate) {
      await this.cache.set(`user-token-${sub}`, '', ttl)
    }
  }
}
