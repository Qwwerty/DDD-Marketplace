import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { CacheRepository } from "@/infra/cache/cache-repository";
import { Controller, HttpCode, Post, Request } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Controller('/sign-out')
export class SignOutController {
  constructor(private jwt: JwtService, private cache: CacheRepository) { }

  @Post()
  @HttpCode(200)
  async handle(@Request() request, @CurrentUser() user: UserPayload,) {
    const token = request.headers.authorization

    const existsAuthenticate = await this.cache.get(`user-token-${user.sub}`)

    if (!existsAuthenticate) {
      await this.cache.set(`user-token-${user.sub}`, token)
    }
  }
}