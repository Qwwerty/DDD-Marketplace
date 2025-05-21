import { hash } from 'bcryptjs'

import { SellersRepository } from '../repositories/sellers-repository'
import { Either, left, right } from '@/core/either'
import { Seller } from '../../enterprise/entities/seller'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { Attachment } from '../../enterprise/entities/attachment'

interface UpdateSellerUseCaseRequest {
  id: string
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
  constructor(private sellersRepository: SellersRepository) {}

  async execute({
    id,
    name,
    phone,
    email,
    password,
    avatarId,
  }: UpdateSellerUseCaseRequest): Promise<UpdateSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(id)

    if (!seller) {
      return left(new ResourceNotFoundError())
    }

    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email)

    if (sellerWithSameEmail && sellerWithSameEmail.id.toString() !== id) {
      return left(new EmailAlreadyExistsError(email))
    }

    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone)

    if (sellerWithSamePhone && sellerWithSamePhone.id.toString() !== id) {
      return left(new PhoneAlreadyExistsError(phone))
    }

    seller.name = name
    seller.email = email
    seller.phone = phone

    if (password) {
      seller.password = await hash(password, 8)
    }

    if (avatarId) {
      seller.avatar = Attachment.create({ path: avatarId })
    }

    await this.sellersRepository.save(seller)

    return right({
      seller,
    })
  }
}
