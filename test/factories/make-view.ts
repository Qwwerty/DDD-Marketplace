import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Product } from '@/domain/marketplace/enterprise/entities/product'
import { View, ViewProps } from '@/domain/marketplace/enterprise/entities/view'
import { Viewer } from '@/domain/marketplace/enterprise/entities/viewer'

export function makeView(
  override: Partial<ViewProps> = {},
  viewer: Viewer,
  product: Product,
  id?: UniqueEntityId,
) {
  return View.create(
    {
      viewer,
      product,
      ...override,
    },
    id,
  )
}
