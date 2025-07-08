import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Create session (E2E)', () => {
  let app: INestApplication
  let selllerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    selllerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('[POST] /sellers/sessions', async () => {
    await selllerFactory.makePrismaSeller({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const response = await request(app.getHttpServer())
      .post('/sellers/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})
