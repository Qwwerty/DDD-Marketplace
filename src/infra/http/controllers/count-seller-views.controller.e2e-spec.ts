import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { ProductFactory } from 'test/factories/make-product'
import { SellerFactory } from 'test/factories/make-seller'
import { ViewFactory } from 'test/factories/make-view'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Count seller views (E2E)', () => {
  let app: INestApplication

  let sellerFactory: SellerFactory
  let productFactory: ProductFactory
  let viewFactory: ViewFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, ProductFactory, ViewFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    sellerFactory = moduleRef.get(SellerFactory)
    productFactory = moduleRef.get(ProductFactory)
    viewFactory = moduleRef.get(ViewFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /sellers/metrics/views', async () => {
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

    await viewFactory.makePrismaView({
      viewer,
      product,
    })

    const accessToken = jwt.sign({ sub: owner.id.toString() })

    const response = await request(app.getHttpServer())
      .get('/sellers/metrics/views')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.body).toStrictEqual({
      amount: 1,
    })
  })
})
