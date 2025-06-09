import { Entity } from '@/core/entities/entity'
import { Viewer } from './viewer'
import { Product } from './product'
import { Optional } from '@/core/types/optional'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

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
