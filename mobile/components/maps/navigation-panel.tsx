import { View } from 'react-native';
import { Navigation } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

interface NavigationPanelProps {
  isNavigating: boolean;
  distanceRemaining: number;
  timeRemaining: number;
  nextTurnInstruction: string;
  progress: number;
  turnInstructions: string[];
  onStopNavigation: () => void;
  formatDistanceMeters: (meters: number) => string;
  formatTimeSeconds: (seconds: number) => string;
}

export const NavigationPanel = ({
  isNavigating,
  distanceRemaining,
  timeRemaining,
  nextTurnInstruction,
  progress,
  turnInstructions,
  onStopNavigation,
  formatDistanceMeters,
  formatTimeSeconds,
}: NavigationPanelProps) => {
  const { colors } = useTheme();

  if (!isNavigating) return null;

  return (
    <View className="p-2">
      <Progress value={progress} className="mb-2" />

      {/* Turn Instruction */}
      {nextTurnInstruction && (
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 rounded-full p-2">
            <Navigation size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-primary">{nextTurnInstruction}</Text>
          </View>
        </View>
      )}

      {/* Distance and Time Info */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View>
            <Text className="text-xs text-muted-foreground">Distance</Text>
            <Text className="text-sm font-semibold text-primary">
              {formatDistanceMeters(distanceRemaining)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View>
            <Text className="text-right text-xs text-muted-foreground">ETA</Text>
            <Text className="text-sm font-semibold text-primary">
              {formatTimeSeconds(timeRemaining)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stop Navigation Button */}
      <Button onPress={onStopNavigation} variant="destructive" className="mb-4">
        <Text>Stop Navigation</Text>
      </Button>

      {/* Turn-by-turn list */}
      <View className="mb-4">
        <Text className="mb-2 text-sm font-semibold">Steps</Text>
        <BottomSheetFlatList
          data={turnInstructions}
          keyExtractor={(item: string) => item}
          className="max-h-40"
          contentContainerClassName="gap-2"
          renderItem={({ item, index }: { item: string; index: number }) => (
            <View className="flex-row items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <Text className="text-xs font-semibold text-muted-foreground">{index + 1}</Text>
              <Text className="flex-1 text-sm text-foreground">{item}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2">
              <Text className="text-sm text-muted-foreground">
                No turn-by-turn steps available yet.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};
