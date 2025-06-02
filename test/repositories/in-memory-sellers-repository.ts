import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'

export class InMemorySellersRepository implements SellersRepository {
  public items: Seller[] = []

  constructor(private attachmentsRepository: InMemoryAttachmentsRepository) {}

  async findById(id: string): Promise<Seller | null> {
    const seller = this.items.find((item) => item.id.toString() === id)

    if (!seller) {
      return null
    }

    return seller
  }

  async findByEmail(email: string): Promise<Seller | null> {
    const seller = this.items.find((item) => item.email === email)

    if (!seller) {
      return null
    }

    return seller
  }

  async findByPhone(phone: string): Promise<Seller | null> {
    const seller = this.items.find((item) => item.phone === phone)

    if (!seller) {
      return null
    }

    return seller
  }

  async create(seller: Seller): Promise<void> {
    this.items.push(seller)

    if (seller.avatar) {
      await this.attachmentsRepository.createMany([seller.avatar])
    }
  }

  async save(seller: Seller): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === seller.id)

    if (seller.avatar) {
      await this.attachmentsRepository.createMany([seller.avatar])
    }

    this.items[itemIndex] = seller
  }
}
