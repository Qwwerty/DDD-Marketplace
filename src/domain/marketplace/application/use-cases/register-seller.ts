import { hash } from 'bcryptjs'

import { Seller } from '../../enterprise/entities/seller'
import { SellersRepository } from '../repositories/sellers-repository'
import { Attachment } from '../../enterprise/entities/attachment'
import { Either, left, right } from '@/core/either'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'

interface RegisterSellerUseCaseProps {
  name: string
  phone: string
  email: string
  password: string
  avatarId?: string
}

type RegisterSellerUseCaseResponse = Either<
  EmailAlreadyExistsError | PhoneAlreadyExistsError,
  {
    seller: Seller
  }
>

export class RegisterSellerUseCase {
  constructor(private sellersRepository: SellersRepository) {}

  async execute({
    name,
    phone,
    email,
    password,
    avatarId,
  }: RegisterSellerUseCaseProps): Promise<RegisterSellerUseCaseResponse> {
    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email)

    if (sellerWithSameEmail) {
      return left(new EmailAlreadyExistsError(email))
    }

    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone)

    if (sellerWithSamePhone) {
      return left(new PhoneAlreadyExistsError(phone))
    }
    const hashedPassword = await hash(password, 8)

    const seller = Seller.create({
      name,
      phone,
      email,
      password: hashedPassword,
    })

    if (avatarId) {
      seller.avatar = Attachment.create({ path: avatarId })
    }

    await this.sellersRepository.create(seller)

    return right({
      seller,
    })
  }
}
