import { hash } from 'bcryptjs'

import { Seller } from '../../enterprise/entities/seller'
import { SellersRepository } from '../repositories/sellers-repository'
import { Attachment } from '../../enterprise/entities/attachment'

interface RegisterSellerUseCaseProps {
  name: string
  phone: string
  email: string
  password: string
  avatarId?: string
}

export class RegisterSellerUseCase {
  constructor(private sellerRepository: SellersRepository) {}

  async execute({
    name,
    phone,
    email,
    password,
    avatarId,
  }: RegisterSellerUseCaseProps) {
    const sellerWithSameEmail = await this.sellerRepository.findByEmail(email)
    const sellerWithSamePhone = await this.sellerRepository.findByPhone(phone)

    if (sellerWithSameEmail || sellerWithSamePhone) {
      throw new Error()
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
  }
}
