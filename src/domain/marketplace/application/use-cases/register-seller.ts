import { hash } from 'bcryptjs'

import { Seller } from '../../enterprise/entities/seller'
import { SellersRepository } from '../repositories/sellers-repository'
import { Attachment } from '../../enterprise/entities/attachment'
import { Either, right } from '@/core/either'
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
  constructor(private sellerRepository: SellersRepository) {}

  async execute({
    name,
    phone,
    email,
    password,
    avatarId,
  }: RegisterSellerUseCaseProps): Promise<RegisterSellerUseCaseResponse> {
    const sellerWithSameEmail = await this.sellerRepository.findByEmail(email)

    if (sellerWithSameEmail) {
      throw new EmailAlreadyExistsError(email)
    }

    const sellerWithSamePhone = await this.sellerRepository.findByPhone(phone)

    if (sellerWithSamePhone) {
      throw new PhoneAlreadyExistsError(phone)
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

    await this.sellerRepository.create(seller)

    return right({
      seller,
    })
  }
}
