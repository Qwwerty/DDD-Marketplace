import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Put,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { SellerPresenter } from '../presenters/seller-presenter'

import { UpdateSellerUseCase } from '@/domain/marketplace/application/use-cases/update-seller'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

const updateSellerBodySchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
    avatarId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password) {
      if (data.password !== data.passwordConfirmation) {
        ctx.addIssue({
          path: ['passwordConfirmation'],
          code: z.ZodIssueCode.custom,
          message: 'Password and confirmation must match.',
        })
      }
    }
  })

const bodyValidationPipe = new ZodValidationPipe(updateSellerBodySchema)

type CreateSellerBodySchema = z.infer<typeof updateSellerBodySchema>

@Controller('/sellers')
export class UpdateSellerController {
  constructor(private updateSeller: UpdateSellerUseCase) {}

  @Put()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: CreateSellerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, phone, email, password, avatarId } = body
    const userId = user.sub

    const result = await this.updateSeller.execute({
      userId,
      name,
      phone,
      email,
      password,
      avatarId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return SellerPresenter.toHTTP(result.value.seller)
  }
}
