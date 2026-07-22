import { BannerForm } from '@/components/admin/banner-form';
import { BannerToastWrapper } from '@/components/admin/banner-toast-wrapper';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Banner — Admin' };

export default function NewBannerPage() {
  return (
    <BannerToastWrapper>
      <BannerForm />
    </BannerToastWrapper>
  );
}
