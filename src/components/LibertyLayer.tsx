import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';                    
import '@maplibre/maplibre-gl-leaflet';             
import 'maplibre-gl/dist/maplibre-gl.css';          

export default function LibertyLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = L.maplibreGL({
      style: 'https://tiles.openfreemap.org/styles/liberty',
    });

    layer.addTo(map);

    map.attributionControl?.addAttribution(
      '© OpenStreetMap contributors | © OpenMapTiles | © OpenFreeMap'
    );

    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
