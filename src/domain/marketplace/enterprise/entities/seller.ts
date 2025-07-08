import { User, UserProps } from './user'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export interface SellerProps extends UserProps {}

export class Seller extends User {
  static create(props: UserProps, id?: UniqueEntityId): Seller {
    return new Seller(props, id)
  }
}
