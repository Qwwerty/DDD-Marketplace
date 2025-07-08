import { Product } from './product'
import { Viewer } from './viewer'

import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Optional } from '@/core/types/optional'

export interface ViewProps {
  viewer: Viewer
  product: Product
  createdAt: Date
}

export class View extends Entity<ViewProps> {
  get viewer() {
    return this.props.viewer
  }

  get product() {
    return this.props.product
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<ViewProps, 'createdAt'>, id?: UniqueEntityId) {
    const view: ViewProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }

    return new View(view, id)
  }
}
