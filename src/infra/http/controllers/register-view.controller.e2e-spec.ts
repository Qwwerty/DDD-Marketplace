import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { ProductFactory } from 'test/factories/make-product'
import { SellerFactory } from 'test/factories/make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Register view (E2E)', () => {
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

  test('[PUT] /products/:id/views', async () => {
    const category = Category.create(
      {
        title: 'Electronics',
        slug: 'electronics',
      },
      new UniqueEntityId('electronics'),
    )

    const owner = await sellerFactory.makePrismaSeller()
    const product = await productFactory.makePrismaProduct({ owner, category })
    const viewer = await sellerFactory.makePrismaSeller()

    const productId = product.id.toString()

    const accessToken = jwt.sign({ sub: viewer.id.toString() })

    const response = await request(app.getHttpServer())
      .post(`/products/${productId}/views`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(201)

    expect(response.body).toStrictEqual({
      product: expect.objectContaining({
        id: expect.any(String),
      }),
      viewer: expect.objectContaining({
        id: expect.any(String),
      }),
    })
  })
})
