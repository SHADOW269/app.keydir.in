import Image from 'next/image';
import { signInWithGoogle, signInWithDiscord } from '@/lib/auth/actions';

export function SocialButtons() {
  return (
    <div className="auth-social">
      <form action={signInWithGoogle}>
        <button type="submit" className="btn-secondary auth-btn">
          <Image src="/logos/google-logo.png" alt="" width={16} height={16} unoptimized />
          Login
        </button>
      </form>
      <form action={signInWithDiscord}>
        <button type="submit" className="btn-secondary auth-btn">
          <Image src="/logos/discord-logo.png" alt="" width={16} height={16} unoptimized />
          Login
        </button>
      </form>
    </div>
  );
}
