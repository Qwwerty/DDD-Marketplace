import { Module } from '@nestjs/common'

import { BcryptHasher } from './bycrpt-hasher'
import { JwtEncrypter } from './jwt-encrypter'

import { Encrypter } from '@/domain/marketplace/application/cryptography/encrypter'
import { HashComparer } from '@/domain/marketplace/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/marketplace/application/cryptography/hash-generator'

@Module({
  providers: [
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: Encrypter, useClass: JwtEncrypter },
  ],
  exports: [HashComparer, HashGenerator, Encrypter],
})
export class CryptographyModule {}
