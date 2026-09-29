import { buildTaxonomyRoutes } from '@/lib/admin/taxonomy-routes';
import { adminApplicationCreateSchema, adminApplicationUpdateSchema } from '@/lib/api/validation';

const routes = buildTaxonomyRoutes({
  kind: 'APPLICATION',
  label: 'Application',
  createSchema: adminApplicationCreateSchema,
  updateSchema: adminApplicationUpdateSchema,
});

export const GET = routes.LIST;
export const POST = routes.CREATE;
