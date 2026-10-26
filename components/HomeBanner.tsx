'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { IconButton } from './PortalControls';
import styles from './HomeBanner.module.css';

export function HomeBanner() {
  const [active, setActive] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const banners = [
    'Build exam confidence for ICAN Professional. Plan your study, practise with purpose and keep your resources in one place.',
    'Have any comments on how we are doing? Your feedback helps us improve the Mastrevo learning experience.',
    'Need more information? Connect with the Mastrevo team for guidance on getting started.',
    'ICAN registration announcement — sample artwork, not a current registration notice.',
    'Struggling with Audit? Explore Mastrevo exam resources — sample artwork.'
  ];
  const count = banners.length;
  const move = (direction: number) => setActive(current => (current + direction + count) % count);

  return <section className={styles.banner} aria-label="Featured banners" aria-roledescription="carousel">
    <div className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${count}`}
      onTouchStart={event => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={event => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}>
      <Image className={styles.image} src={`/brand/sample-${active + 1}.png`} alt={banners[active]} width={2048} height={683} sizes="(max-width: 760px) 100vw, 1100px" priority={active === 0} />
    </div>
    <div className={styles.controls}>
      <p aria-live="polite" aria-atomic="true">Banner {active + 1} of {count} <span>· Sample artwork</span></p>
      <div className={styles.navigation}>
        <IconButton label="Previous banner" icon="arrow-left" onClick={() => move(-1)}/>
        <div className={styles.dots} role="group" aria-label="Choose banner">
          {Array.from({ length: count }, (_, index) => <button key={index} type="button" aria-label={`Show banner ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)}><span /></button>)}
        </div>
        <IconButton label="Next banner" icon="arrow-right" onClick={() => move(1)}/>
      </div>
    </div>
  </section>;
}
