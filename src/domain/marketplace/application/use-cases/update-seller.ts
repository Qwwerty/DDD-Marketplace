import { hash } from 'bcryptjs'

import { Either, left, right } from '@/core/either'

import { SellersRepository } from '../repositories/sellers-repository'
import { Seller } from '../../enterprise/entities/seller'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

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

    const currentAvatar = seller.avatar

    if (avatarId) {
      const avatar = await this.attachmentsRepository.findById(avatarId)

      if (!avatar) {
        return left(new ResourceNotFoundError('avatarId', avatarId))
      }

      seller.avatar = avatar
    }

    await this.sellersRepository.save(seller)

    if (currentAvatar && currentAvatar.id.toString() !== avatarId) {
      await this.attachmentsRepository.delete(currentAvatar.id.toString())
    }

    return right({
      seller,
    })
  }
}
