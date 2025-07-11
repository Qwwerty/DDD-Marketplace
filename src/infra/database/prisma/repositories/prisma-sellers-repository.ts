import { Injectable } from '@nestjs/common'

import { PrismaSellerDetailsMapper } from '../mappers/prisma-seller-deitals-mapper'
import { PrismaSellerMapper } from '../mappers/prisma-seller-mapper'
import { PrismaService } from '../prisma.service'

import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'
import { UserAttachmentsRepository } from '@/domain/marketplace/application/repositories/user-attachments-repository'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'
import { SellerDetails } from '@/domain/marketplace/enterprise/entities/value-objects/seller-details'

@Injectable()
export class PrismaSellersRepository implements SellersRepository {
  constructor(
    private prisma: PrismaService,
    private userAttachmentRepository: UserAttachmentsRepository,
  ) {}

  async findById(sellerId: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        id: sellerId,
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerMapper.toDomain(seller)
  }

  async findDetailsById(sellerId: string): Promise<SellerDetails | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        id: sellerId,
      },
      include: {
        attachments: true,
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerDetailsMapper.toDomain(seller)
  }

  async findByEmail(email: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerMapper.toDomain(seller)
  }

  async findByPhone(phone: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        phone,
      },
    })

    if (!seller) {
      return null
    }

    return PrismaSellerMapper.toDomain(seller)
  }

  async create(seller: Seller): Promise<void> {
    const data = PrismaSellerMapper.toPrisma(seller)

    await this.prisma.user.create({
      data,
    })

    if (seller.avatar) {
      await this.userAttachmentRepository.create(seller.avatar)
    }
  }

  async save(seller: Seller): Promise<void> {
    const data = PrismaSellerMapper.toPrisma(seller)

    await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data,
    })

    if (seller.oldAvatarId) {
      await this.userAttachmentRepository.delete(seller.oldAvatarId.toString())
    }

    if (seller.avatar) {
      await this.userAttachmentRepository.create(seller.avatar)
    }
  }
}
