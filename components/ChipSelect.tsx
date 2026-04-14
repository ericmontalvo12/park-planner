import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Colors from '../constants/Colors';

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

export function ChipSelect({ options, selected, onToggle }: ChipSelectProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onToggle(option)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.tint : colors.card,
                borderColor: isSelected ? colors.tint : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? '#fff' : colors.text },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
