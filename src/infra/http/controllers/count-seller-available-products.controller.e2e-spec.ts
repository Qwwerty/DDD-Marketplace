import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { ProductFactory } from 'test/factories/make-product'
import { SellerFactory } from 'test/factories/make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { JwtService } from '@nestjs/jwt'

describe('Count seller available products (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let sellerFactory: SellerFactory
  let productFactory: ProductFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, ProductFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    sellerFactory = moduleRef.get(SellerFactory)
    productFactory = moduleRef.get(ProductFactory)

    await app.init()
  })

  test('[GET] /sellers/metrics/products/available', async () => {
    const owner = await sellerFactory.makePrismaSeller({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const category = Category.create(
      {
        title: 'Electronics',
        slug: 'electronics',
      },
      new UniqueEntityId('electronics'),
    )

    for (let i = 1; i <= 3; i++) {
      await productFactory.makePrismaProduct({
        description: 'Iphone 14',
        owner,
        category,
      })
    }

    const accessToken = jwt.sign({ sub: owner.id.toString() })

    const response = await request(app.getHttpServer())
      .get('/sellers/metrics/products/available')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.body).toStrictEqual({
      amount: 3
    })
  })
})
