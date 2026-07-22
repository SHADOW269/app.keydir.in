import { buildFilterResponse } from '@/lib/filters';

export async function GET() {
  return buildFilterResponse('mouse');
}
