import { ProductDetailsProps } from './product-details'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ValueObject } from '@/core/entities/value-object'

export interface ViewDetailsProps {
  product: ProductDetailsProps
  viewer: {
    id: UniqueEntityId
    name: string
    phone: string
    email: string
    avatar: {
      id: string
      path: string
    } | null
  }
}

export class ViewDetails extends ValueObject<ViewDetailsProps> {
  get product() {
    return this.props.product
  }

  get viewer() {
    return this.props.viewer
  }

  static create(props: ViewDetailsProps) {
    return new ViewDetails(props)
  }
}
