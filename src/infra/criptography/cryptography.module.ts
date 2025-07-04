import { Module } from '@nestjs/common'

import { HashComparer } from '@/domain/marketplace/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/marketplace/application/cryptography/hash-generator'

import { BcryptHasher } from './bycrpt-hasher'

@Module({
  providers: [
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [HashComparer, HashGenerator],
})
export class CryptographyModule {}
