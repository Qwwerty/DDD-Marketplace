import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Upload attachment (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test('[POST] /attachments', async () => {
    const response = await request(app.getHttpServer())
      .post('/attachments')
      .attach('files', './test/e2e/sample-upload.jpeg')

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      attachments: [
        {
          id: expect.any(String),
          url: expect.any(String),
        },
      ],
    })
  })
})
