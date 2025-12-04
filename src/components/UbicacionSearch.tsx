'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import type { Ubicacion } from '@/app/(main)/reservas/model/reserva.interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
}

interface UbicacionSearchProps {
  value: number; // ubicacionId seleccionada
  onChange: (ubicacionId: number) => void;
  onUbicacionCreated?: (ubicacion: Ubicacion) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function UbicacionSearch({
  value,
  onChange,
  onUbicacionCreated,
  placeholder = 'Buscar ubicación...',
  required = false,
  disabled = false,
}: UbicacionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [existingUbicaciones, setExistingUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);
  const [creating, setCreating] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cargar ubicaciones existentes
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/ubicaciones`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data: Ubicacion[] = await res.json();
          setExistingUbicaciones(data);
        }
      } catch (e) {
        console.error('Error cargando ubicaciones:', e);
      } finally {
        setLoadingUbicaciones(false);
      }
    })();
  }, []);

  // Buscar en Nominatim cuando el usuario escribe
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // Usar Nominatim de OpenStreetMap (gratis, sin API key)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
          {
            headers: {
              'User-Agent': 'Layover App', // Nominatim requiere User-Agent
            },
          }
        );

        if (response.ok) {
          const data: NominatimResult[] = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error buscando ubicación:', error);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectExisting = (ubicacionId: number) => {
    onChange(ubicacionId);
    const ubicacion = existingUbicaciones.find(u => u.idUbicacion === ubicacionId);
    if (ubicacion) {
      setSearchQuery(ubicacion.nombreLugar + (ubicacion.direccion ? `, ${ubicacion.direccion}` : ''));
    }
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = async (suggestion: NominatimResult) => {
    setCreating(true);
    try {
      // Crear la ubicación en el backend
      const nuevaUbicacion = {
        nombreLugar: suggestion.display_name.split(',')[0], // Primera parte del nombre
        direccion: suggestion.display_name,
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      };

      const res = await fetch(`${API_URL}/ubicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaUbicacion),
      });

      if (res.ok) {
        const creada: Ubicacion = await res.json();
        setExistingUbicaciones(prev => [...prev, creada]);
        onChange(creada.idUbicacion);
        setSearchQuery(creada.nombreLugar || suggestion.display_name.split(',')[0]);
        setShowSuggestions(false);
        
        if (onUbicacionCreated) {
          onUbicacionCreated(creada);
        }
      } else {
        const error = await res.json().catch(() => ({ message: 'Error creando ubicación' }));
        alert(error.message || 'Error al crear la ubicación');
      }
    } catch (error) {
      console.error('Error creando ubicación:', error);
      alert('Error al crear la ubicación');
    } finally {
      setCreating(false);
    }
  };

  const ubicacionSeleccionada = existingUbicaciones.find(u => u.idUbicacion === value);

  // Mostrar el nombre de la ubicación seleccionada si no hay búsqueda activa
  const displayValue = searchQuery || (ubicacionSeleccionada 
    ? ubicacionSeleccionada.nombreLugar + (ubicacionSeleccionada.direccion ? `, ${ubicacionSeleccionada.direccion}` : '')
    : '');

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value === '') {
              onChange(0);
            }
          }}
          onFocus={() => {
            if (ubicacionSeleccionada && !searchQuery) {
              setSearchQuery(ubicacionSeleccionada.nombreLugar || '');
            }
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled || creating}
          className="pl-10 pr-10"
        />
        {(loading || creating) && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || existingUbicaciones.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Ubicaciones existentes */}
          {existingUbicaciones.length > 0 && searchQuery.length >= 3 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                Ubicaciones existentes
              </div>
              {existingUbicaciones
                .filter(u => 
                  u.nombreLugar.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.direccion?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(ubicacion => (
                  <button
                    key={ubicacion.idUbicacion}
                    type="button"
                    onClick={() => handleSelectExisting(ubicacion.idUbicacion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{ubicacion.nombreLugar}</div>
                    {ubicacion.direccion && (
                      <div className="text-xs text-gray-500 truncate">{ubicacion.direccion}</div>
                    )}
                  </button>
                ))}
            </>
          )}

          {/* Sugerencias de Nominatim */}
          {suggestions.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                Nuevas ubicaciones (se crearán automáticamente)
              </div>
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  disabled={creating}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-500 truncate">{suggestion.display_name}</div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

