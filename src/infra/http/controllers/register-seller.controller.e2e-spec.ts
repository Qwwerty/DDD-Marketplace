import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Create Seller (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sellers', async () => {
    await prisma.attachment.create({
      data: {
        id: '1',
        title: 'Title test',
        path: 'Path test',
      },
    })

    const response = await request(app.getHttpServer()).post('/sellers').send({
      name: 'John Doe',
      phone: '32988000000',
      email: 'johndoe@example.com',
      password: '123456',
      passwordConfirmation: '123456',
      avatarId: '1',
    })

    expect(response.body).toStrictEqual({
      seller: expect.objectContaining({
        id: expect.any(String),
        name: 'John Doe',
        phone: '32988000000',
        email: 'johndoe@example.com',
      }),
    })
  })
})
