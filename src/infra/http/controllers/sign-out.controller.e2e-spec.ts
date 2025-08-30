import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { CacheModule } from '@/infra/cache/cache.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Sign out (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let redis: CacheRepository
  let selllerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
      providers: [SellerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)
    redis = moduleRef.get(CacheRepository)
    selllerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('[POST] /sign-out', async () => {
    const seller = await selllerFactory.makePrismaSeller({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const accessToken = jwt.sign({ sub: seller.id.toString() })

    await request(app.getHttpServer())
      .post('/sign-out')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    const blackListToken = await redis.get(`user-token:${seller.id.toString()}`)
    expect(blackListToken).not.toBeNull()

    await request(app.getHttpServer())
      .get('/sellers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(401)
  })
})
