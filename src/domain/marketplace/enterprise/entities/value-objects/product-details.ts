import { ProductStatus } from '../product'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ValueObject } from '@/core/entities/value-object'

export interface ProductDetailsProps {
  productId: UniqueEntityId
  title: string
  description: string
  priceInCents: number
  status: ProductStatus
  owner: {
    id: UniqueEntityId
    name: string
    phone: string
    email: string
    avatar:
      | {
          id: UniqueEntityId
          path: string
        }
      | null
  }
  category: {
    id: UniqueEntityId
    title: string
    slug: string
  }
  attachments: { id: UniqueEntityId; path: string }[]
}

export class ProductDetails extends ValueObject<ProductDetailsProps> {
  get productId() {
    return this.props.productId
  }

  get title() {
    return this.props.title
  }

  get description() {
    return this.props.description
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  get status() {
    return this.props.status
  }

  get owner() {
    return this.props.owner
  }

  get category() {
    return this.props.category
  }

  get attachments() {
    return this.props.attachments
  }

  static create(props: ProductDetailsProps) {
    return new ProductDetails(props)
  }
}
