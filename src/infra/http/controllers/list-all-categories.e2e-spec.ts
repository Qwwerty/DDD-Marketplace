import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('List all categories (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test('[GET] /categories', async () => {
    const response = await request(app.getHttpServer())
      .get('/categories')
      .send()

    expect(response.body).toEqual({
      categories: expect.arrayContaining([
        {
          id: 'electronics',
          slug: 'electronics',
          title: 'Electronics',
        },
      ]),
    })
  })
})
