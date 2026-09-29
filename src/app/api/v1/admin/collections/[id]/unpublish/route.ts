import { buildTaxonomyRoutes } from '@/lib/admin/taxonomy-routes';
import { adminCollectionCreateSchema, adminCollectionUpdateSchema } from '@/lib/api/validation';

const routes = buildTaxonomyRoutes({
  kind: 'COLLECTION',
  label: 'Collection',
  createSchema: adminCollectionCreateSchema,
  updateSchema: adminCollectionUpdateSchema,
});

export const POST = routes.UNPUBLISH;
