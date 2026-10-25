# BayaniAlert Map and Barangay Lookup API

This document covers the map page and the barangay lookup that sits behind it.

**Stack:** React + Vite on the frontend, Supabase (Postgres + PostGIS) as the database and API, Leaflet for the map.

There is no separate backend server. Supabase turns the SQL functions below into API endpoints automatically.

---

## Status

- The map page (`/map`) works and is locked to the Philippines bounding box.
- The `get_barangay` lookup works.
- **The `barangays` table is currently empty.** Real barangay boundaries still need to be imported for our target area. Until then, every lookup returns no result.

---

## 1. Setup (every teammate does this once)

1. Pull the branch and install packages:

   ```
   git pull
   npm install
   ```

2. Create a file named `.env.local` in the project root (same folder as `package.json`). Ask the person who owns the Supabase project for the values:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-KEY
   ```

   Rules:
   - The names must start with `VITE_` or Vite ignores them.
   - No quotes, no spaces around `=`.
   - Restart `npm run dev` after creating or editing this file.
   - Never commit this file. Never use the `service_role` / secret key in frontend code.

3. Start the app with `npm run dev`, log in, and open the Map page from the sidebar.

---

## 2. Using the lookup in React

The Supabase client is exported from `src/supabase.js`.

```jsx
import { supabase } from '../supabase';

// Which barangay contains this point?
const { data, error } = await supabase.rpc('get_barangay', {
  lat: 14.65,
  lng: 121.05,
});

// data is an array. data[0] looks like:
// { psgc_code: 'TEST001', name: 'Test Barangay', municipality: 'Quezon City', province: 'Metro Manila' }
// An empty array means the point is not inside any stored barangay.
```

Get all barangay shapes of one municipality as GeoJSON (for drawing outlines on the map):

```jsx
const { data: geojson } = await supabase.rpc('barangays_by_municipality', {
  muni: 'Quezon City',
});
// Pass it to <GeoJSON data={geojson} /> from react-leaflet
```

### Plain HTTP (non-React usage)

```
POST https://YOUR-PROJECT.supabase.co/rest/v1/rpc/get_barangay
Headers:
  apikey: YOUR-PUBLISHABLE-KEY
  Content-Type: application/json
Body:
  { "lat": 14.65, "lng": 121.05 }
```

---

## 3. Coordinate order (common bug)

- Leaflet and our function parameters use **lat, lng**.
- GeoJSON and PostGIS points use **lng, lat**.

The `get_barangay` function already handles this internally. Just pass `lat` and `lng` by name.

---

## 4. Files involved

| File | Purpose |
| --- | --- |
| `src/supabase.js` | Creates the Supabase client from `.env.local` |
| `src/pages/Map.jsx` | Leaflet map, evac center markers, click-to-lookup card |
| `src/context/AppContext.jsx` | Evac centers now carry `lat` and `lng` fields |

Evac centers must have `lat` and `lng` to appear as markers. The rest of the app data (resources, announcements, households) is still local prototype data stored in the browser's localStorage.

---

## 5. Database setup (only the Supabase project owner needs this)

Run in the Supabase dashboard under **SQL Editor**.

```sql
create extension if not exists postgis;

create table barangays (
  id bigint generated always as identity primary key,
  psgc_code text,
  name text,
  municipality text,
  province text,
  geom geometry(MultiPolygon, 4326)
);
create index barangays_geom_idx on barangays using gist (geom);

alter table barangays enable row level security;
create policy "public read barangays" on barangays for select using (true);

create or replace function get_barangay(lat double precision, lng double precision)
returns table (psgc_code text, name text, municipality text, province text)
language sql stable as $$
  select psgc_code, name, municipality, province
  from barangays
  where st_contains(geom, st_setsrid(st_point(lng, lat), 4326))
  limit 1;
$$;

create or replace function barangays_by_municipality(muni text)
returns json language sql stable as $$
  select json_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(json_agg(json_build_object(
      'type', 'Feature',
      'properties', json_build_object('name', name, 'psgc_code', psgc_code),
      'geometry', st_asgeojson(geom)::json
    )), '[]'::json))
  from barangays where municipality = muni;
$$;
```

Quick test row (remove it once real data is imported):

```sql
insert into barangays (psgc_code, name, municipality, province, geom)
values ('TEST001', 'Test Barangay', 'Quezon City', 'Metro Manila',
  st_multi(st_geomfromtext(
    'POLYGON((121.03 14.63, 121.07 14.63, 121.07 14.67, 121.03 14.67, 121.03 14.63))', 4326)));

delete from barangays where psgc_code = 'TEST001';
```

---

## 6. Known limits

- The map is restricted to a rectangle around the Philippines, so small parts of neighboring land (for example Sabah) still appear at the edges.
- Lookup accuracy depends entirely on the boundary data imported into `barangays`.
- Free OpenStreetMap tiles are fine for development and demos. For real production traffic, switch to a tile provider that allows it (MapTiler, Stadia, or self-hosted tiles).
