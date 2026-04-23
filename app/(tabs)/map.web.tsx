import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

import { getCities, listReviews } from '@/services/travoApi';

mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

const US_CENTER: [number, number] = [-98.5795, 39.8283];

export default function MapScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: US_CENTER,
      zoom: 4,
      maxBounds: [[-180, 15], [-50, 75]],
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    Promise.all([getCities(), listReviews()])
      .then(([cities, reviews]) => {
        const cityMap = new Map(cities.map((c) => [c.id, c]));

        const cityReviews = new Map<number, typeof reviews>();
        for (const review of reviews) {
          const existing = cityReviews.get(review.city) ?? [];
          cityReviews.set(review.city, [...existing, review]);
        }

        for (const [cityId, posts] of cityReviews) {
          const city = cityMap.get(cityId);
          if (!city) continue;

          const lat = parseFloat(city.lat);
          const lng = parseFloat(city.lng);
          if (isNaN(lat) || isNaN(lng)) continue;

          const count = posts.length;
          const avgRating = posts.reduce((sum, r) => sum + r.rating, 0) / count;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-family:sans-serif;padding:4px 2px;min-width:140px">
              <strong style="color:#001e52;font-size:14px">${city.city}, ${city.state}</strong><br/>
              <span style="color:#444;font-size:13px">${count} post${count !== 1 ? 's' : ''} &nbsp;·&nbsp; ★ ${avgRating.toFixed(1)}</span>
            </div>`,
          );

          new mapboxgl.Marker({ color: '#216e82' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        }
      })
      .catch((e: unknown) =>
        setLoadError(e instanceof Error ? e.message : 'Failed to load posts'),
      );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(0,30,82,0.92)',
            color: '#efe9e7',
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 13,
            whiteSpace: 'nowrap',
          }}
        >
          {loadError}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
