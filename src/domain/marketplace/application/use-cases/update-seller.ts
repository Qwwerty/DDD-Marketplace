import { hash } from 'bcryptjs'

import { SellersRepository } from '../repositories/sellers-repository'

interface UpdateSellerUseCaseRequest {
  id: string
  name: string
  phone: string
  email: string
  password: string
}

export class UpdateSellerUseCase {
  constructor(private sellersRepository: SellersRepository) {}

  async execute({
    id,
    name,
    phone,
    email,
    password,
  }: UpdateSellerUseCaseRequest) {
    const seller = await this.sellersRepository.findById(id)

    if (!seller) {
      throw new Error()
    }

    const sallerWithSameEmail = await this.sellersRepository.findByEmail(email)
    const sallerWithSamePhone = await this.sellersRepository.findByPhone(phone)

    if (sallerWithSameEmail || sallerWithSamePhone) {
      throw new Error()
    }

    seller.name = name
    seller.email = email
    seller.phone = phone
    seller.password = password ? await hash(password, 8) : seller?.password

    await this.sellersRepository.save(seller)
  }
}
