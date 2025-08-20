import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { ProductFactory } from 'test/factories/make-product'
import { SellerFactory } from 'test/factories/make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Get product by id (E2E)', () => {
  let app: INestApplication
  let sellerFactory: SellerFactory
  let productFactory: ProductFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, ProductFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    sellerFactory = moduleRef.get(SellerFactory)
    productFactory = moduleRef.get(ProductFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /products/:id', async () => {
    const owner = await sellerFactory.makePrismaSeller({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '32988003322',
    })

    const category = Category.create(
      {
        title: 'Electronics',
        slug: 'electronics',
      },
      new UniqueEntityId('electronics'),
    )

    const product = await productFactory.makePrismaProduct({
      description: 'Iphone 16',
      owner,
      status: ProductStatus.available,
      category,
    })

    const productId = product.id.toString()

    const accessToken = jwt.sign({ sub: owner.id.toString() })

    const response = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.body).toEqual({
      product: expect.objectContaining({
        id: expect.any(String),
        description: 'Iphone 16',
        owner: expect.objectContaining({
          name: 'John Doe',
          phone: '32988003322',
          email: 'johndoe@example.com',
        }),
      }),
    })
  })
})
