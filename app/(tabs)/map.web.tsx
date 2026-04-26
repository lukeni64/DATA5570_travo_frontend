import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getCities, listRelationships, listReviews, type ApiCity, type ApiReview } from '@/services/travoApi';

mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

const US_CENTER: [number, number] = [-98.5795, 39.8283];
const CURRENT_USERNAME = 'traveler.jules';

type FilterMode = 'all' | 'mine' | 'friends';

const FILTER_LABELS: Record<FilterMode, string> = {
  all: 'All Posts',
  mine: 'My Posts',
  friends: 'Friends',
};

export default function MapScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const allReviewsRef = useRef<ApiReview[]>([]);
  const allCitiesRef = useRef<ApiCity[]>([]);
  const friendUsernamesRef = useRef<Set<string>>(new Set());

  const [filter, setFilter] = useState<FilterMode>('all');
  const [mapReady, setMapReady] = useState(false);
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

    Promise.all([getCities(), listReviews(), listRelationships(CURRENT_USERNAME)])
      .then(([cities, reviews, relationships]) => {
        allCitiesRef.current = cities;
        allReviewsRef.current = reviews;

        const friendSet = new Set<string>();
        for (const rel of relationships) {
          if (rel.status !== 'accepted') continue;
          const iAmRequester = rel.requester_username === CURRENT_USERNAME;
          const iAmAddressee = rel.addressee_username === CURRENT_USERNAME;
          if (!iAmRequester && !iAmAddressee) continue;
          friendSet.add(iAmRequester ? rel.addressee_username : rel.requester_username);
        }
        friendUsernamesRef.current = friendSet;
        setMapReady(true);
      })
      .catch((e: unknown) =>
        setLoadError(e instanceof Error ? e.message : 'Failed to load posts'),
      );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const drawMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const cityMap = new Map(allCitiesRef.current.map((c) => [c.id, c]));
    const friends = friendUsernamesRef.current;

    const filtered =
      filter === 'mine'
        ? allReviewsRef.current.filter((r) => r.username === CURRENT_USERNAME)
        : filter === 'friends'
          ? allReviewsRef.current.filter((r) => friends.has(r.username))
          : allReviewsRef.current;

    const byCity = new Map<number, ApiReview[]>();
    for (const review of filtered) {
      byCity.set(review.city, [...(byCity.get(review.city) ?? []), review]);
    }

    for (const [cityId, posts] of byCity) {
      const city = cityMap.get(cityId);
      if (!city) continue;
      const lat = parseFloat(city.lat);
      const lng = parseFloat(city.lng);
      if (isNaN(lat) || isNaN(lng)) continue;

      const count = posts.length;
      const avgRating = (posts.reduce((s, r) => s + r.rating, 0) / count).toFixed(1);
      const authors = [...new Set(posts.map((p) => p.username))].join(', ');

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="font-family:sans-serif;padding:4px 2px;min-width:160px">
          <strong style="color:#001e52;font-size:14px">${city.city}, ${city.state}</strong><br/>
          <span style="color:#444;font-size:13px">${count} post${count !== 1 ? 's' : ''} &nbsp;·&nbsp; ★ ${avgRating}</span><br/>
          <span style="color:#666;font-size:12px">${authors}</span>
        </div>`,
      );

      const marker = new mapboxgl.Marker({ color: '#216e82' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [filter]);

  useEffect(() => {
    if (mapReady) drawMarkers();
  }, [mapReady, drawMarkers]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Filter toggle */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          background: 'rgba(0,30,82,0.88)',
          borderRadius: 10,
          padding: 4,
          gap: 4,
          backdropFilter: 'blur(6px)',
        }}
      >
        {(Object.keys(FILTER_LABELS) as FilterMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            style={{
              padding: '6px 18px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: filter === mode ? '#216e82' : 'transparent',
              color: filter === mode ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {FILTER_LABELS[mode]}
          </button>
        ))}
      </div>

      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: 60,
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
