import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Mark as available product (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[PATCH] /product/{id}/available', async () => {
    await request(app.getHttpServer()).post('/sellers').send({
      name: 'John Doe',
      phone: '32988000000',
      email: 'johndoe@example.com',
      password: '123456',
      passwordConfirmation: '123456',
      avatarId: null,
    })

    const authenticateResponse = await request(app.getHttpServer())
      .post('/sellers/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    const accessToken = authenticateResponse.body.access_token

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Iphone 16',
        categoryId: 'electronics',
        description: 'Description product',
        priceInCents: 15000,
        attachmentsIds: [],
      })

    const productId = response.body.product.id

    await request(app.getHttpServer())
      .patch(`/products/${productId}/available`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    })

    expect(product.status).toBe('AVAILABLE')
  })
})
