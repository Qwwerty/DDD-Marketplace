import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'

import { ProductFactory } from '../../../../test/factories/make-product'
import { SellerFactory } from '../../../../test/factories/make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('List all seller products (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let prisma: PrismaService
  let sellerFactory: SellerFactory
  let productFactory: ProductFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, ProductFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)
    sellerFactory = moduleRef.get(SellerFactory)
    productFactory = moduleRef.get(ProductFactory)

    await app.init()
  })

  test('[GET] /products/me', async () => {
    const owner = await sellerFactory.makePrismaSeller({
      name: 'John Doe',
      email: 'johndoe@example.com'
    })

    const category = Category.create(
      {
        title: 'Electronics',
        slug: 'electronics',
      },
      new UniqueEntityId('electronics'),
    )

    await Promise.all([
      productFactory.makePrismaProduct({
        description: 'Iphone 16',
        owner,
        status: ProductStatus.cancelled,
        category,
      }),
      productFactory.makePrismaProduct({
        description: 'Iphone 14',
        owner,
        status: ProductStatus.sold,
        category,
      }),
      productFactory.makePrismaProduct({ owner, category }),
    ])

    const accessToken = jwt.sign({ sub: owner.id.toString() })

    const response = await request(app.getHttpServer())
      .get('/products/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .query('status=cancelled')

    expect(response.body.products).toStrictEqual([
      expect.objectContaining({
        id: expect.any(String),
        description: 'Iphone 16',
        owner: expect.objectContaining({
          name: 'John Doe',
          email: 'johndoe@example.com',
        }),
      }),
    ])
  })
})
