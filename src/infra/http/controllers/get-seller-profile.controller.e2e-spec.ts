import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Get seller profile (E2E)', () => {
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

  test('[GET] /sellers/me', async () => {
    await prisma.attachment.create({
      data: {
        id: '1',
        title: 'Title test',
        path: 'Path test',
      },
    })

    await request(app.getHttpServer()).post('/sellers').send({
      name: 'John Doe',
      phone: '32988000000',
      email: 'johndoe@example.com',
      password: '123456',
      passwordConfirmation: '123456',
      avatarId: '1',
    })

    const authenticateResponse = await request(app.getHttpServer())
      .post('/sellers/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    const accessToken = authenticateResponse.body.access_token

    const response = await request(app.getHttpServer())
      .get('/sellers/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.body).toEqual({
      seller: expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
        avatar: expect.objectContaining({
          id: '1',
        }),
      }),
    })
  })
})
