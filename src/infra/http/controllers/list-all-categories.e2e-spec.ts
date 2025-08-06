import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('List all categories (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test('[GET] /categories', async () => {
    const response = await request(app.getHttpServer()).get('/categories').send()

    expect(response.body).toEqual({
      categories: expect.arrayContaining([
        {
          "id": "electronics",
          "slug": "electronics",
          "title": "Electronics",
        }
      ]),
    })
  })
})
