import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { SellerPresenter } from '../presenters/seller-presenter'

import { EmailAlreadyExistsError } from '@/domain/marketplace/application/use-cases/errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from '@/domain/marketplace/application/use-cases/errors/phone-already-exists-error'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { Public } from '@/infra/auth/public'

const registerSellerBodySchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    password: z.string(),
    passwordConfirmation: z.string(),
    avatarId: z.string().nullable(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password and confirmation must match.',
  })

const bodyValidationPipe = new ZodValidationPipe(registerSellerBodySchema)

type CreateSellerBodySchema = z.infer<typeof registerSellerBodySchema>

@Controller('/sellers')
@Public()
export class RegisterSellerController {
  constructor(private registerSeller: RegisterSellerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateSellerBodySchema) {
    const { name, phone, email, password, avatarId } = body

    const result = await this.registerSeller.execute({
      name,
      phone,
      email,
      password,
      avatarId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case PhoneAlreadyExistsError || EmailAlreadyExistsError:
          throw new ConflictException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const seller = result.value.seller

    return {
      seller: SellerPresenter.toHTTP(seller),
    }
  }
}
