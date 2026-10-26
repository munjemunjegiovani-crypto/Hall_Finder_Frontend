'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocationCtx } from '@/components/Providers';
import { Spinner } from '@/components/ui';

// A door QR code points here: it records where the person is standing, then opens the hall.
export default function Here() {
  const { code } = useParams();
  const { setLoc } = useLocationCtx();
  const router = useRouter();
  useEffect(() => { setLoc(String(code).toUpperCase()); router.replace(`/app/halls/${String(code).toUpperCase()}?here=1`); }, [code]); // eslint-disable-line
  return <Spinner label="Setting your location" />;
}
