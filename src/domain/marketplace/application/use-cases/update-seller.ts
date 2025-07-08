import { Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'

import { Seller } from '../../enterprise/entities/seller'
import { UserAttachment } from '../../enterprise/entities/user-attachment'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

interface UpdateSellerUseCaseRequest {
  userId: string
  name: string
  phone: string
  email: string
  password?: string
  avatarId?: string
}

type UpdateSellerUseCaseResponse = Either<
  ResourceNotFoundError | EmailAlreadyExistsError | PhoneAlreadyExistsError,
  {
    seller: Seller
  }
>

@Injectable()
export class UpdateSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute({
    userId,
    name,
    phone,
    email,
    password,
    avatarId,
  }: UpdateSellerUseCaseRequest): Promise<UpdateSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(userId)

    if (!seller) {
      return left(new ResourceNotFoundError('seller', userId))
    }

    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email)

    if (sellerWithSameEmail && sellerWithSameEmail.id.toString() !== userId) {
      return left(new EmailAlreadyExistsError(email))
    }

    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone)

    if (sellerWithSamePhone && sellerWithSamePhone.id.toString() !== userId) {
      return left(new PhoneAlreadyExistsError(phone))
    }

    seller.name = name
    seller.email = email
    seller.phone = phone

    if (password) {
      seller.password = await hash(password, 8)
    }

    if (avatarId) {
      const existsAvatar = await this.attachmentsRepository.findById(avatarId)

      if (!existsAvatar) {
        return left(new ResourceNotFoundError('avatarId', avatarId))
      }

      const avatar = UserAttachment.create({
        userId: seller.id,
        attachmentId: new UniqueEntityId(avatarId),
      })

      seller.avatar = avatar
    }

    await this.sellersRepository.save(seller)

    return right({
      seller,
    })
  }
}
