import { hash } from 'bcryptjs'

import { SellersRepository } from '../repositories/sellers-repository'
import { Either, left, right } from '@/core/either'
import { Seller } from '../../enterprise/entities/seller'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'

interface UpdateSellerUseCaseRequest {
  id: string
  name: string
  phone: string
  email: string
  password: string
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
  }: UpdateSellerUseCaseRequest): Promise<UpdateSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(id)

    if (!seller) {
      return left(new ResourceNotFoundError())
    }

    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email)

    if (sellerWithSameEmail) {
      return left(new EmailAlreadyExistsError(email))
    }

    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone)

    if (sellerWithSamePhone) {
      return left(new PhoneAlreadyExistsError(phone))
    }

    seller.name = name
    seller.email = email
    seller.phone = phone
    seller.password = password ? await hash(password, 8) : seller?.password

    await this.sellersRepository.save(seller)

    return right({
      seller,
    })
  }
}
