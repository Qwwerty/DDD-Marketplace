import { hash } from 'bcryptjs'

import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found'

import { SellersRepository } from '../repositories/sellers-repository'
import { Seller } from '../../enterprise/entities/seller'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { UserAttachmentsRepository } from '../repositories/user-attachments-repository'

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
    private userAttachmentsRepository: UserAttachmentsRepository,
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
      return left(new ResourceNotFoundError())
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

    await this.sellersRepository.save(seller)

    return right({
      seller,
    })
  }
}
