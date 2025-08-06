import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  'Vehicles',
  'Property Rentals',
  'Apparel',
  'Electronics',
  'Furniture',
  'Home & Garden',
  'Classifieds',
  'Family',
  'Entertainment',
  'Hobbies',
  'Books & Study Materials',
  'Toys, Baby & Kids',
  'Tools & DIY Supplies',
  'Health & Beauty',
  'Sports & Outdoor Equipment',
  'Collectibles & Vintage Items',
  'Seasonal & Holiday Items',
  'Office Supplies & Stationery',
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function main() {
  for (const title of categories) {
    const slug = slugify(title)

    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        ...(process.env.NODE_ENV === 'test' && { id: slug }), // define id só em ambiente de teste
      },
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
