import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Navigation, X } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

interface RouteControlsProps {
  onUseCurrentLocation: () => void;
  onClearRoute: () => void;
  hasRoute: boolean;
  isCalculating: boolean;
  hasCurrentLocation: boolean;
  isGettingUserLocation: boolean;
}

export function RouteControls({
  onUseCurrentLocation,
  onClearRoute,
  hasRoute,
  isCalculating,
  hasCurrentLocation,
  isGettingUserLocation,
}: RouteControlsProps) {
  const { colors } = useTheme();
  return (
    <View className="absolute bottom-24 right-4 flex-col gap-3">
      {/* Use Current Location Button */}
      {!hasCurrentLocation && (
        <TouchableOpacity
          onPress={onUseCurrentLocation}
          disabled={isCalculating || isGettingUserLocation}
          className="rounded-full bg-background/80 p-3 shadow-lg active:bg-background">
          {isCalculating || isGettingUserLocation ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Navigation color={colors.text} size={20} />
          )}
        </TouchableOpacity>
      )}

      {/* Clear Route Button */}
      {hasRoute && (
        <TouchableOpacity
          onPress={onClearRoute}
          className="rounded-full bg-destructive/80 p-3 shadow-lg active:bg-destructive">
          <X color="white" size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}
