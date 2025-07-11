import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ValueObject } from '@/core/entities/value-object'

export interface SellerDetailsProps {
  userId: UniqueEntityId
  name: string
  email: string
  phone: string
  avatar?: {
    id: UniqueEntityId
    path: string
  } | null
}

export class SellerDetails extends ValueObject<SellerDetailsProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get avatar() {
    return this.props.avatar
  }

  get userId() {
    return this.props.userId
  }

  static create(props: SellerDetailsProps) {
    return new SellerDetails(props)
  }
}
