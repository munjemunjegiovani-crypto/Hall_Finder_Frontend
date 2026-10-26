'use client';
import { useState } from 'react';

/** Shows /photos/<name>.jpg on top of whatever is rendered underneath.
 *  If the file is missing, it hides itself so the illustration shows instead. */
export default function Photo({ name, alt = '', className = '', position = 'center' }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/photos/${name}.jpg`} alt={alt} loading={name === 'hero' ? 'eager' : 'lazy'} onError={() => setOk(false)} style={{ objectPosition: position }} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
}
