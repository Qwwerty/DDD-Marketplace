import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Edit product (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let sellerFactory: SellerFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    sellerFactory = moduleRef.get(SellerFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /products', async () => {
    await prisma.attachment.create({
      data: {
        id: '1',
        title: 'Apple Watch series 10',
        path: 'apple-watch-series-10.jpeg',
      },
    })

    const seller = await sellerFactory.makePrismaSeller({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32988003322',
    })

    const accessToken = jwt.sign({ sub: seller.id.toString() })

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Iphone 16',
        categoryId: 'electronics',
        description: 'Description product',
        priceInCents: 39900,
        attachmentsIds: [],
      })

    const productId = productResponse.body.product.id

    const response = await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Iphone 16',
        categoryId: 'electronics',
        description: 'Description product',
        priceInCents: 39900,
        attachmentsIds: ['1'],
      })

    expect(response.body).toEqual({
      product: expect.objectContaining({
        id: expect.any(String),
        title: 'Iphone 16',
        description: 'Description product',
        priceInCents: 39900,
        status: 'AVAILABLE',
        owner: {
          id: expect.any(String),
          name: 'John Doe',
          phone: '32988003322',
          email: 'johndoe@example.com',
          avatar: null,
        },
        category: {
          id: 'electronics',
          title: 'Electronics',
          slug: 'electronics',
        },
        attachments: [
          {
            id: '1',
            url: 'apple-watch-series-10.jpeg',
          },
        ],
      }),
    })
  })
})
