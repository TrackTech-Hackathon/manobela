import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { OSMView, SearchBox, type OSMViewRef } from 'expo-osm-sdk';
import { useRouteCalculation } from './hooks/useRouteCalculation';
import { RouteControls } from './components/RouteControls';
import { RouteInfo } from './components/RouteInfo';

interface Location {
  coordinate: { latitude: number; longitude: number };
  displayName?: string;
}

export default function MapsScreen() {
  const mapRef = useRef<OSMViewRef>(null);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);

  const {
    route,
    isCalculating,
    error,
    calculateRoute,
    clearRoute,
    formatDistance,
    formatDuration,
  } = useRouteCalculation();

  // Convert locations to markers array
  const markers = useMemo(() => {
    const markersArray = [];

    if (startLocation) {
      markersArray.push({
        id: 'start-location',
        coordinate: {
          latitude: startLocation.coordinate.latitude,
          longitude: startLocation.coordinate.longitude,
        },
        title: 'Start Location',
        description: startLocation.displayName || 'Current Location',
      });
    }

    if (destinationLocation) {
      markersArray.push({
        id: 'destination-location',
        coordinate: {
          latitude: destinationLocation.coordinate.latitude,
          longitude: destinationLocation.coordinate.longitude,
        },
        title: destinationLocation.displayName || 'Destination',
        description: destinationLocation.displayName || 'Destination Location',
      });
    }

    return markersArray;
  }, [startLocation, destinationLocation]);

  // Handle location selection from search (sets destination)
  const handleLocationSelected = useCallback(
    (location: Location) => {
      setDestinationLocation(location);

      // Animate map to selected location
      mapRef.current?.animateToLocation(
        location.coordinate.latitude,
        location.coordinate.longitude,
        15
      );
    },
    []
  );

  // Handle using current location (sets start and auto-calculates route)
  const handleUseCurrentLocation = useCallback(async () => {
    try {
      if (!mapRef.current) {
        Alert.alert('Error', 'Map not ready');
        return;
      }

      // Get current location from map
      const currentLocation = await mapRef.current.getCurrentLocation();

      if (!currentLocation) {
        Alert.alert('Error', 'Unable to get current location');
        return;
      }

      const location: Location = {
        coordinate: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        displayName: 'Current Location',
      };

      setStartLocation(location);

      // If destination exists, automatically calculate route
      if (destinationLocation) {
        await calculateRoute(
          location.coordinate,
          destinationLocation.coordinate,
          mapRef
        );
      } else {
        // Animate to current location if no destination
        mapRef.current?.animateToLocation(
          location.coordinate.latitude,
          location.coordinate.longitude,
          15
        );
      }
    } catch (err: any) {
      console.error('Error getting current location:', err);
      Alert.alert('Error', err.message || 'Failed to get current location');
    }
  }, [destinationLocation, calculateRoute]);

  // Handle clear route
  const handleClearRoute = useCallback(() => {
    clearRoute();
    setStartLocation(null);
    setDestinationLocation(null);
  }, [clearRoute]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Route Error', error);
    }
  }, [error]);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Maps' }} />
      <SearchBox
        placeholder="Search for destination..."
        onLocationSelected={handleLocationSelected}
        style={{ margin: 20, marginTop: 60 }}
      />
      <OSMView
        ref={mapRef}
        style={{ flex: 1 }}
        initialCenter={{ latitude: 40.7128, longitude: -74.006 }}
        initialZoom={13}
        markers={markers}
        onMarkerPress={(id) => {
          console.log('Marker pressed:', id);
        }}
      />
      <RouteControls
        onUseCurrentLocation={handleUseCurrentLocation}
        onClearRoute={handleClearRoute}
        hasRoute={!!route}
        isCalculating={isCalculating}
        hasCurrentLocation={!!startLocation}
      />
      <RouteInfo
        route={route}
        formatDistance={formatDistance}
        formatDuration={formatDuration}
      />
    </View>
  );
}
