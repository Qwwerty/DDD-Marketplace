import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export interface CategoryProps {
  title: string
  slug: string
}

export class Category extends Entity<CategoryProps> {
  get title() {
    return this.props.title
  }

  get slug() {
    return this.props.slug
  }

  static create(props: CategoryProps, id?: UniqueEntityId): Category {
    return new Category(props, id)
  }
}
