'use client';

import { useEffect, useRef, useState } from 'react';
import type { Evento, EventoUI } from '@/app/(main)/calendario/model/eventos.interfaces';
import { useLocale } from './locale-provider';

// Type declaration for dynamically loaded Leaflet library
interface LeafletMarker {
  addTo: (map: unknown) => LeafletMarker;
  bindPopup: (content: string, options?: Record<string, unknown>) => LeafletMarker;
  on: (event: string, handler: () => void) => LeafletMarker;
}

interface LeafletFeatureGroup {
  getBounds: () => { pad: (padding: number) => unknown };
  fitBounds: (bounds: unknown) => void;
}

interface LeafletLibrary {
  map: (container: string, options?: Record<string, unknown>) => {
    center: (coords: [number, number]) => void;
    zoom: (level: number) => void;
    zoomControl: (enabled: boolean) => void;
    attributionControl: (enabled: boolean) => void;
    fitBounds: (bounds: unknown) => void;
  };
  tileLayer: (url: string, options?: Record<string, unknown>) => {
    addTo: (map: unknown) => void;
  };
  marker: (coords: [number, number], options?: Record<string, unknown>) => LeafletMarker;
  divIcon: (options: Record<string, unknown>) => unknown;
  featureGroup: new (markers: unknown[]) => LeafletFeatureGroup;
}

declare global {
  interface Window {
    L?: LeafletLibrary;
  }
}

interface MapaActividadesFuncionalProps {
  eventos: EventoUI[];
  className?: string;
}

export default function MapaActividadesFuncional({ eventos, className = '' }: MapaActividadesFuncionalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const { translate } = useLocale();

  const easyLabel     = translate('difficulty.easy', 'Fácil');
  const moderateLabel = translate('difficulty.moderate', 'Moderado');
  const hardLabel     = translate('difficulty.hard', 'Exigente');

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const getDifficultyColor = (label: unknown) => {
    const v = normalize(String(label ?? ''));

    const easy     = normalize(easyLabel);
    const moderate = normalize(moderateLabel);
    const hard     = normalize(hardLabel);

    if (v === easy || v === 'facil' || v === 'easy') return '#10B981';   // Verde
    if (v === moderate || v === 'moderado' || v === 'moderate') return '#F59E0B'; // Amarillo
    if (v === hard || v === 'exigente' || v === 'hard') return '#EF4444'; // Rojo
    return '#3B82F6'; // Azul por defecto
  };

  
  console.log('MapaActividadesFuncional render - eventos:', eventos.length, 'mapLoaded:', mapLoaded, 'mapError:', mapError);

  // estilos CSS personalizados para Leaflet
  useEffect(() => {
    const styleId = 'leaflet-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 16px !important;
          line-height: 1.5 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const getCoordinatesFromLocation = (ubicacion: string): [number, number] => {
    const locationMap: { [key: string]: [number, number] } = {
      'marrakech': [31.6295, -7.9811],
      'essaouira': [31.5085, -9.7595],
      'desierto del sahara': [31.1794, -4.0143], 
      'rabat': [34.0209, -6.8416],
      'casablanca': [33.5731, -7.5898],
      'fez': [34.0331, -5.0003],
      'tánger': [35.7595, -5.8340],
      'agadir': [30.4278, -9.5981],
      'chefchaouen': [35.1684, -5.2737],
      'ouarzazate': [30.9201, -6.9125],
      'ait ben haddou': [31.0486, -7.1322],
      'merzouga': [31.1794, -4.0143],
      'dades': [31.5128, -6.2431],
      'todra': [31.5128, -5.5328],
      'vallée du dades': [31.5128, -6.2431],
      'gorges du todra': [31.5128, -5.5328],
      'kasbah ait ben haddou': [31.0486, -7.1322],
      'kasbah ait benhaddou': [31.0486, -7.1322],
      'valle del dades': [31.5128, -6.2431],
      'gargantas del todra': [31.5128, -5.5328],
      'kasbah de ait ben haddou': [31.0486, -7.1322],
      'ouarzazate kasbah': [30.9201, -6.9125],
      'merzouga desierto': [31.1794, -4.0143],
      'dunas de merzouga': [31.1794, -4.0143],
      'erg chebbi': [31.1794, -4.0143],
      'marrakech, marruecos': [31.6295, -7.9811],
      'essaouira, marruecos': [31.5085, -9.7595],
      'madrid': [40.4168, -3.7038],
      'barcelona': [41.3851, 2.1734],
      'sevilla': [37.3891, -5.9845],
      'valencia': [39.4699, -0.3763],
      'bilbao': [43.2627, -2.9253],
      'granada': [37.1773, -3.5986],
      'málaga': [36.7213, -4.4214],
      'museo del prado': [40.4138, -3.6920],
      'museo del prado, madrid': [40.4138, -3.6920],
      'palacio real': [40.4181, -3.7142],
      'retiro': [40.4152, -3.6842],
      'puerta del sol': [40.4168, -3.7038],
      'plaza mayor': [40.4154, -3.7074],
      'aeropuerto el dorado': [4.7016, -74.1469],
      'cartagena': [10.3910, -75.4794],
      'bogotá': [4.7110, -74.0721],
      'bogota': [4.7110, -74.0721],
      'londres': [51.5074, -0.1278],
      'reino unido': [55.3781, -3.4360],
      'london': [51.5074, -0.1278],
      'florencia': [43.7696, 11.2558],
      'siena': [43.3188, 11.3307],
      'roma': [41.9028, 12.4964],
      'venecia': [45.4408, 12.3155],
      'milan': [45.4642, 9.1900],
      'florence': [43.7696, 11.2558],
      'rome': [41.9028, 12.4964],
      'nueva york': [40.7128, -74.0060],
      'central park': [40.7829, -73.9654],
      'broadway': [40.7614, -73.9776],
      'new york': [40.7128, -74.0060],
      'nyc': [40.7128, -74.0060],
      'tokio': [35.6762, 139.6503],
      'kioto': [35.0116, 135.7681],
      'tokyo': [35.6762, 139.6503],
      'kyoto': [35.0116, 135.7681],
      'paris': [48.8566, 2.3522],
      'parís': [48.8566, 2.3522],
      'torre eiffel': [48.8584, 2.2945],
      'louvre': [48.8606, 2.3376],
      'berlin': [52.5200, 13.4050],
      'múnich': [48.1351, 11.5820],
      'munich': [48.1351, 11.5820],
      'amsterdam': [52.3676, 4.9041],
      'holanda': [52.3676, 4.9041],
      'lisboa': [38.7223, -9.1393],
      'oporto': [41.1579, -8.6291],
      'porto': [41.1579, -8.6291],
    };

    if (!ubicacion || typeof ubicacion !== 'string') {
      console.warn('Ubicación inválida:', ubicacion);// Marruecos por defecto
    }

    const locationKey = ubicacion.toLowerCase().trim();
    
    if (locationMap[locationKey]) {
      return locationMap[locationKey];
    }
    
    for (const [key, coords] of Object.entries(locationMap)) {
      const cleanLocation = locationKey.replace(/[.,;:!?()]/g, '').trim();
      const cleanKey = key.replace(/[.,;:!?()]/g, '').trim();

      if (cleanLocation === cleanKey) {
        return coords;
      }
      
      if (cleanLocation.includes(cleanKey) || cleanKey.includes(cleanLocation)) {
        return coords;
      }
      
      const locationWords = cleanLocation.split(/\s+/);
      const keyWords = cleanKey.split(/\s+/);
      
      const matchingWords = locationWords.filter(word => 
        keyWords.some(keyWord => {
          const wordLower = word.toLowerCase();
          const keyWordLower = keyWord.toLowerCase();
          return wordLower.includes(keyWordLower) || keyWordLower.includes(wordLower);
        })
      );
      
      if (matchingWords.length >= Math.min(2, locationWords.length)) {
        return coords;
      }

      const longestLocationWord = locationWords.reduce((a, b) => a.length > b.length ? a : b);
      const longestKeyWord = keyWords.reduce((a, b) => a.length > b.length ? a : b);
      
      if (longestLocationWord.length > 4 && longestKeyWord.length > 4 && 
          (longestLocationWord.includes(longestKeyWord) || longestKeyWord.includes(longestLocationWord))) {
        return coords;
      }
    }
    
    const coordMatch = locationKey.match(/(-?\d+\.?\d*)[,;\s]+(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng];
      }
    }
    
    console.warn(`No se encontraron coordenadas para: "${ubicacion}", usando coordenadas por defecto`);
    return [31.6295, -7.9811];
  };

  useEffect(() => {
    const loadMap = () => {
      if (!mapRef.current) return;

      try {
        setMapError(false);
        setMapLoaded(false);

        if (mapRef.current.innerHTML) {
          mapRef.current.innerHTML = '';
        }

        const eventosConUbicacion = eventos.filter((evento): evento is Evento & { ubicacion: string } => Boolean(evento.ubicacion));
        
        console.log('Eventos con ubicación:', eventosConUbicacion.length);
        
        if (eventosConUbicacion.length === 0) {
          console.log('No hay eventos con ubicación, mostrando mapa vacío');
          setMapLoaded(true);
          return;
        }

        const markers = eventosConUbicacion.map((evento, index) => {
          const coords = getCoordinatesFromLocation(evento.ubicacion);
          console.log(`Evento ${index + 1}: "${evento.nombre}" | Ubicación: "${evento.ubicacion}" -> Coordenadas: [${coords[0]}, ${coords[1]}]`);
          
          if (isNaN(coords[0]) || isNaN(coords[1]) || 
              coords[0] < -90 || coords[0] > 90 || 
              coords[1] < -180 || coords[1] > 180) {
            console.warn(`Coordenadas inválidas para evento "${evento.nombre}":`, coords);
            return null;
          }
          
          return {
            lat: coords[0],
            lng: coords[1],
            nombre: evento.nombre,
            ubicacion: evento.ubicacion,
            hora: evento.hora,
            precio: evento.precio,
            dificultad: evento.dificultad,
            id: evento.id || `evento-${index}`
          };
        }).filter(marker => marker !== null);
        
        const marruecosMarkers = markers.filter(m => 
          m.lat >= 20 && m.lat <= 36 && m.lng >= -18 && m.lng <= -1
        );
        
        console.log(`Total marcadores: ${markers.length}`);
        console.log('Marcadores de Marruecos:', marruecosMarkers.length);
        
        let centerLat, centerLng;
        if (marruecosMarkers.length > 0 && marruecosMarkers.length >= markers.length / 2) {
          centerLat = marruecosMarkers.reduce((sum, marker) => sum + marker.lat, 0) / marruecosMarkers.length;
          centerLng = marruecosMarkers.reduce((sum, marker) => sum + marker.lng, 0) / marruecosMarkers.length;
        } else {
          centerLat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
          centerLng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
        }
        
        console.log('Centro calculado:', { centerLat, centerLng });

        let boundsLats, boundsLngs;
        if (marruecosMarkers.length > 0 && marruecosMarkers.length >= markers.length / 2) {
          boundsLats = marruecosMarkers.map(m => m.lat);
          boundsLngs = marruecosMarkers.map(m => m.lng);
        } else {
          boundsLats = markers.map(m => m.lat);
          boundsLngs = markers.map(m => m.lng);
        }
        
        const minLat = Math.min(...boundsLats);
        const maxLat = Math.max(...boundsLats);
        const minLng = Math.min(...boundsLngs);
        const maxLng = Math.max(...boundsLngs);
        
        console.log(`Total marcadores válidos: ${markers.length}`);
        console.log('Marcadores de Marruecos:', marruecosMarkers.length);
        console.log('Bounds del mapa:', { minLat, maxLat, minLng, maxLng });
        
        const latRange = maxLat - minLat;
        const lngRange = maxLng - minLng;
        const padding = Math.max(0.1, Math.min(latRange, lngRange) * 0.1); // Padding proporcional
        const bbox = `${minLng - padding},${minLat - padding},${maxLng + padding},${maxLat + padding}`;
        
        console.log('URL del mapa:', `bbox=${bbox}`);
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
          

          const mapContainer = document.createElement('div');
          mapContainer.style.width = '100%';
          mapContainer.style.height = '100%';
          mapContainer.style.position = 'relative';
          mapContainer.style.borderRadius = '8px';
          mapContainer.style.overflow = 'hidden';
          mapContainer.style.backgroundColor = '#f3f4f6';
          mapContainer.id = `map-${Date.now()}`;

          const loadLeaflet = () => {
            if (typeof window !== 'undefined' && window.L) {
              createMap();
              return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => {
              createMap();
            };
            script.onerror = () => {
              console.warn('Error cargando Leaflet, usando mapa estático');
              createStaticMap();
            };
            document.head.appendChild(script);
          };
          
          const createMap = () => {
            const L = window.L;
            if (!L) {
              console.warn('Leaflet no disponible, usando mapa estático');
              createStaticMap();
              return;
            }
            
            try {

              const map = L.map(mapContainer.id, {
                center: [centerLat, centerLng],
                zoom: 8,
                zoomControl: true,
                attributionControl: true
              });
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
              }).addTo(map);
              
              markers.forEach((marker, index) => {
              const markerColor = getDifficultyColor(marker.dificultad);
                const borderColor = 'white';
                
                const customIcon = L.divIcon({
                  html: `
                    <div style="
                      width: 32px; 
                      height: 32px; 
                      background-color: ${markerColor}; 
                      border: 3px solid ${borderColor}; 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      font-weight: bold; 
                      color: white; 
                      font-size: 14px; 
                      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                      cursor: pointer;
                      transition: all 0.2s ease;
                    " class="marker-${index}">
                      ${index + 1}
                    </div>
                  `,
                  className: 'custom-div-icon',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16]
                });

                let popupContent = `
                  <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <div style="
                        width: 20px; 
                        height: 20px; 
                        background-color: ${markerColor}; 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-weight: bold; 
                        color: white; 
                        font-size: 11px;
                        flex-shrink: 0;
                      ">${index + 1}</div>
                      <div style="font-weight: 600; color: #1f2937; font-size: 15px; flex: 1;">
                        ${marker.nombre}
                      </div>
                    </div>
                    <div style="margin-bottom: 6px; color: #6b7280; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                      📍 ${marker.ubicacion}
                    </div>
                `;
                
                if (marker.hora) {
                  popupContent += `<div style="margin-bottom: 4px; color: #3b82f6; font-size: 12px; display: flex; align-items: center; gap: 4px;">🕐 ${marker.hora}</div>`;
                }
                if (marker.precio) {
                  popupContent += `<div style="margin-bottom: 4px; color: #10b981; font-size: 12px; display: flex; align-items: center; gap: 4px;">💰 ${marker.precio}€ por persona</div>`;
                }
                if (marker.dificultad) {
                  const difficultyColors = {
                    'Fácil': '#10b981',
                    'Moderado': '#f59e0b', 
                    'Exigente': '#ef4444'
                  };
                  const color = difficultyColors[marker.dificultad as keyof typeof difficultyColors] || '#3b82f6';
                  popupContent += `<div style="margin-bottom: 4px; color: ${color}; font-size: 12px; display: flex; align-items: center; gap: 4px;">⚡ Dificultad: ${marker.dificultad}</div>`;
                }
                
                const evento = eventos.find(e => e.nombre === marker.nombre && e.ubicacion === marker.ubicacion);
                if (evento && evento.fecha) {
                  const fecha = new Date(evento.fecha);
                  popupContent += `<div style="margin-bottom: 4px; color: #8b5cf6; font-size: 12px; display: flex; align-items: center; gap: 4px;">📅 ${fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>`;
                }
                
                popupContent += '</div>';
                
                // Crear marcador
                const leafletMarker = L.marker([marker.lat, marker.lng], {
                  icon: customIcon
                }).addTo(map);
                
                // Añadir popup
                leafletMarker.bindPopup(popupContent, {
                  maxWidth: 250,
                  className: 'custom-popup'
                });
                
                // Efecto hover
                leafletMarker.on('mouseover', () => {
                  const markerElement = document.querySelector(`.marker-${index}`) as HTMLElement;
                  if (markerElement) {
                    markerElement.style.transform = 'scale(1.1)';
                    markerElement.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                  }
                });
                
                leafletMarker.on('mouseout', () => {
                  const markerElement = document.querySelector(`.marker-${index}`) as HTMLElement;
                  if (markerElement) {
                    markerElement.style.transform = 'scale(1)';
                    markerElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }
                });
              });
              
              // Ajustar vista para mostrar todos los marcadores
              if (markers.length > 0) {
                const group = new L.featureGroup(markers.map(m => L.marker([m.lat, m.lng])));
                map.fitBounds(group.getBounds().pad(0.1));
              }
              
              console.log('Mapa Leaflet creado exitosamente');
              
            } catch (error) {
              console.error('Error creando mapa Leaflet:', error);
              createStaticMap();
            }
          };
          
          const createStaticMap = () => {
            console.log('Creando mapa estático como fallback');
            
            // Crear iframe de fondo del mapa
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            iframe.style.border = 'none';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.zIndex = '1';
            iframe.style.opacity = '0.9';
            
            // Manejar errores de carga del iframe
            iframe.onerror = () => {
              console.warn('Error');

              iframe.style.display = 'none';
              // Mostrar mensaje de error en el contenedor
              const errorDiv = document.createElement('div');
              errorDiv.style.position = 'absolute';
              errorDiv.style.top = '50%';
              errorDiv.style.left = '50%';
              errorDiv.style.transform = 'translate(-50%, -50%)';
              errorDiv.style.textAlign = 'center';
              errorDiv.style.color = '#6b7280';
              errorDiv.style.fontSize = '14px';
              errorDiv.innerHTML = `
                <div style="margin-bottom: 8px;">🗺️</div>
                <div>${translate('map.error.loading', 'Error cargando el mapa')}</div>
                <div style="font-size: 12px; margin-top: 4px;">${translate('map.error.checkConnection', 'Verifica tu conexión a internet')}</div>
              `;
              mapContainer.appendChild(errorDiv);
            };
            
            mapContainer.appendChild(iframe);
            
            // Crear marcadores estáticos como overlay
            const markersOverlay = document.createElement('div');
            markersOverlay.style.position = 'absolute';
            markersOverlay.style.top = '0';
            markersOverlay.style.left = '0';
            markersOverlay.style.width = '100%';
            markersOverlay.style.height = '100%';
            markersOverlay.style.pointerEvents = 'none';
            markersOverlay.style.zIndex = '10';
            
          
            markers.forEach((marker, index) => {
              let markerColor = '#3B82F6'; 
              
              if (marker.dificultad) {
                switch (marker.dificultad) {
                  case 'Fácil':
                    markerColor = '#10B981'; 
                    break;
                  case 'Moderado':
                    markerColor = '#F59E0B'; 
                    break;
                  case 'Exigente':
                    markerColor = '#EF4444'; 
                    break;
                }
              }
              
              const markerElement = document.createElement('div');
              markerElement.style.position = 'absolute';
              markerElement.style.width = '32px';
              markerElement.style.height = '32px';
              markerElement.style.backgroundColor = markerColor;
              markerElement.style.border = '3px solid white';
              markerElement.style.borderRadius = '50%';
              markerElement.style.transform = 'translate(-50%, -50%)';
              markerElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              markerElement.style.cursor = 'pointer';
              markerElement.style.pointerEvents = 'auto';
              markerElement.style.transition = 'all 0.2s ease';
              
              const latRange = maxLat - minLat;
              const lngRange = maxLng - minLng;
              
              if (latRange > 0 && lngRange > 0) {
                const relativeLat = (marker.lat - minLat) / latRange;
                const relativeLng = (marker.lng - minLng) / lngRange;
                
                const topPercent = (1 - relativeLat) * 100;
                const leftPercent = relativeLng * 100;
                
                const clampedTop = Math.max(3, Math.min(97, topPercent));
                const clampedLeft = Math.max(3, Math.min(97, leftPercent));
                
                markerElement.style.top = `${clampedTop}%`;
                markerElement.style.left = `${clampedLeft}%`;
              }
              
              const numberElement = document.createElement('div');
              numberElement.style.position = 'absolute';
              numberElement.style.top = '50%';
              numberElement.style.left = '50%';
              numberElement.style.transform = 'translate(-50%, -50%)';
              numberElement.style.color = 'white';
              numberElement.style.fontSize = '14px';
              numberElement.style.fontWeight = 'bold';
              numberElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
              numberElement.style.userSelect = 'none';
              numberElement.textContent = (index + 1).toString();
              
              markerElement.appendChild(numberElement);
              markersOverlay.appendChild(markerElement);
            });
            
            mapContainer.appendChild(markersOverlay);
          };
          
          mapRef.current.appendChild(mapContainer);
          
          loadLeaflet();
        }

        console.log('Mapa cargado exitosamente');
        setMapLoaded(true);
      } catch (error) {
        console.error('Error cargando el mapa:', error);
        console.error('Error details:', error);
        setMapError(true);
      }
    };

    const timeoutId = setTimeout(() => {
      loadMap();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const currentMapRef = mapRef.current;
      if (currentMapRef) {
        currentMapRef.innerHTML = '';
      }
    };
  }, [eventos]);

  const generateFallbackMarkers = () => {
    const eventosConUbicacion = eventos.filter((evento): evento is Evento & { ubicacion: string } => Boolean(evento.ubicacion));
    
    return eventosConUbicacion.map((evento, index) => (
      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{evento.nombre}</h4>
            <p className="text-sm text-gray-600 mb-2">📍 {evento.ubicacion}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {evento.hora && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  🕐 {evento.hora}
                </span>
              )}
              {evento.precio && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  💰 {evento.precio}{translate('viajes.event.currencySymbol', '€')}
                </span>
              )}
              {evento.dificultad && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  ⚡ {evento.dificultad}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  console.log('Render - mapError:', mapError, 'mapLoaded:', mapLoaded);
  
  return (
    <div className={`relative ${className}`} style={{ minHeight: '320px' }}>
      {mapError ? (
        /* Fallback: Lista de ubicaciones */
        <div className="bg-gray-50 rounded-lg p-6 h-80 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0"></div>
              {translate('map.locations.title', 'Ubicaciones de las Actividades')}
            <span className="ml-auto text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {eventos.filter((e): e is Evento & { ubicacion: string } => Boolean(e.ubicacion)).length} {translate('viajes.map.locations', 'ubicaciones')}
            </span>
          </div>
          
              {eventos.filter((e): e is Evento & { ubicacion: string } => Boolean(e.ubicacion)).length > 0 ? (
            <>
              {/* Leyenda de colores */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                    {translate('viajes.map.legend.title', 'Leyenda')}
                </h4>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700">{translate('difficulty.none', 'Sin dificultad')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-blue-700">{easyLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-blue-700">{moderateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-blue-700">{hardLabel}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-0">
                {generateFallbackMarkers()}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">
                  {translate('viajes.map.noLocations.title', 'No hay ubicaciones registradas')}
              </p>
              <p className="text-sm">

                 {translate('map.noLocations.subtitle', 'Agrega ubicaciones a tus actividades para verlas aquí')}
               
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div 
            ref={mapRef} 
            className="w-full h-full rounded-lg"
            style={{ 
              height: '320px',
              minHeight: '320px',
              width: '100%'
            }}
          />
          
          {/* Estado de carga */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>{translate('map.loading', 'Cargando mapa...')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
