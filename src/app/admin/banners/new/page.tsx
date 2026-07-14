import { BannerForm } from '@/components/admin/banner-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Banner — Admin' };

export default function NewBannerPage() {
  return <BannerForm />;
}
