import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common'
import { z } from 'zod'
import { FastifyReply } from 'fastify'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { WrongCrenditalsError } from '@/domain/marketplace/application/use-cases/errors/wrong-crendentials-errors'
import { Public } from '@/infra/auth/public'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema)

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sellers/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateSeller: AuthenticateSellerUseCase) { }

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: AuthenticateBodySchema, @Res({ passthrough: true }) response: FastifyReply) {
    const { email, password } = body

    const result = await this.authenticateSeller.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCrenditalsError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

    response.cookie('access_token', accessToken)

    return {
      access_token: accessToken,
    }
  }
}
