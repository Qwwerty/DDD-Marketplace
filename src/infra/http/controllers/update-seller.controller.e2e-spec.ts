import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachement'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Update Seller (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let sellerFactory: SellerFactory
  let attachmentFactory: AttachmentFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    sellerFactory = moduleRef.get(SellerFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /sellers', async () => {
    const seller = await sellerFactory.makePrismaSeller()

    const accessToken = jwt.sign({ sub: seller.id.toString() })

    const avatar = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .put('/sellers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        phone: seller.phone,
        email: seller.email,
        avatarId: avatar.id.toString(),
      })

    expect(response.statusCode).toBe(200)

    const sellerOnDatabase = await prisma.user.findFirst({
      where: {
        name: 'John Doe',
      },
    })

    expect(sellerOnDatabase).toBeTruthy()
  })
})
