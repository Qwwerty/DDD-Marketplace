import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'

import { ProductFactory } from '../../../../test/factories/make-product'
import { SellerFactory } from '../../../../test/factories/make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('List all products (E2E)', () => {
  let app: INestApplication
  let sellerFactory: SellerFactory
  let productFactory: ProductFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, ProductFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    sellerFactory = moduleRef.get(SellerFactory)
    productFactory = moduleRef.get(ProductFactory)

    await app.init()
  })

  test('[GET] /products', async () => {
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

    for (let i = 1; i <= 22; i++) {
      await productFactory.makePrismaProduct({
        description: 'Iphone 14',
        owner,
        category,
      })
    }

    const response = await request(app.getHttpServer())
      .get('/products')
      .query('page=2')

    expect(response.body.products).toHaveLength(2)
  })
})
