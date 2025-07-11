import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import { InMemoryUserAttachmentsRepository } from './in-memory-user-attachments-repository'

import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'
import { SellerDetails } from '@/domain/marketplace/enterprise/entities/value-objects/seller-details'

export class InMemorySellersRepository implements SellersRepository {
  public items: Seller[] = []

  constructor(
    private userAttachmentRepository: InMemoryUserAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async findById(sellerId: string): Promise<Seller | null> {
    const seller = this.items.find((item) => item.id.toString() === sellerId)

    if (!seller) {
      return null
    }

    return seller
  }

  async findDetailsById(sellerId: string): Promise<SellerDetails | null> {
    const seller = this.items.find((item) => item.id.toString() === sellerId)

    if (!seller) {
      return null
    }

    const attachment = await this.attachmentsRepository.findById(
      seller.avatar?.attachmentId.toString() || '',
    )

    return SellerDetails.create({
      userId: seller.id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      avatar: attachment
        ? {
            id: attachment.id,
            path: attachment.path,
          }
        : null,
    })
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
      await this.userAttachmentRepository.create(seller.avatar)
    }
  }

  async save(seller: Seller): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === seller.id)

    if (!seller.avatar && !!seller.oldAvatarId) {
      await this.userAttachmentRepository.delete(seller.oldAvatarId.toString())
    }

    if (seller.avatar) {
      await this.userAttachmentRepository.create(seller.avatar)
    }

    this.items[itemIndex] = seller
  }
}
