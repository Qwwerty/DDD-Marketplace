import { Injectable } from '@nestjs/common'

import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

import { PrismaService } from '../prisma.service'
import { PrismaSellerMapper } from '../mappers/prisma-seller-mapper'

@Injectable()
export class PrismaSellersRepository implements SellersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(sellerId: string): Promise<Seller | null> {
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

    return PrismaSellerMapper.toDomain(seller)
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
      await this.prisma.attachment.update({
        where: {
          id: seller.avatar.attachmentId.toString(),
        },
        data: {
          user_id: seller.id.toString(),
        },
      })
    }
  }

  save(seller: Seller): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
