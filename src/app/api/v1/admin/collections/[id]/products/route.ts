import { buildTaxonomyRoutes } from '@/lib/admin/taxonomy-routes';
import { adminCollectionCreateSchema, adminCollectionUpdateSchema } from '@/lib/api/validation';

const routes = buildTaxonomyRoutes({
  kind: 'COLLECTION',
  label: 'Collection',
  createSchema: adminCollectionCreateSchema,
  updateSchema: adminCollectionUpdateSchema,
});

export const GET = routes.PRODUCTS;
export const POST = routes.ATTACH;
export const DELETE = routes.DETACH;
