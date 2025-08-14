import { Category } from './category'
import { ProductAttachmentList } from './product-attachments-list'
import { Seller } from './seller'

import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Optional } from '@/core/types/optional'

export enum ProductStatus {
  available = 'AVAILABLE',
  sold = 'SOLD',
  cancelled = 'CANCELLED',
}

export interface ProductProps {
  title: string
  description: string
  priceInCents: number
  status: ProductStatus
  owner: Seller
  category: Category
  attachments: ProductAttachmentList
  createdAt: Date
}

export class Product extends Entity<ProductProps> {
  set title(value: string) {
    this.props.title = value
  }

  get title() {
    return this.props.title
  }

  set description(value: string) {
    this.props.description = value
  }

  get description() {
    return this.props.description
  }

  set priceInCents(value: number) {
    this.props.priceInCents = value
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  set status(value: ProductStatus) {
    this.props.status = value
  }

  get status() {
    return this.props.status
  }

  set owner(value: Seller) {
    this.props.owner = value
  }

  get owner() {
    return this.props.owner
  }

  set category(value: Category) {
    this.props.category = value
  }

  get category() {
    return this.props.category
  }

  set attachments(attachments: ProductAttachmentList) {
    this.props.attachments = attachments
  }

  get attachments() {
    return this.props.attachments
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ProductProps, 'createdAt' | 'status' | 'attachments'>,
    id?: UniqueEntityId,
  ): Product {
    const product: ProductProps = {
      ...props,
      attachments: props.attachments ?? new ProductAttachmentList(),
      status: props.status ?? ProductStatus.AVAILABLE,
      createdAt: props.createdAt ?? new Date(),
    }

    return new Product(product, id)
  }
}
