import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUS_META } from '../constants/attendance';
import { colors, fonts, radii } from '../constants/theme';
import { Subject } from '../types';
import { getCalendarDays, monthTitle } from '../utils/dates';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarHeatmapProps {
  subject: Subject;
  month: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayPress: (dateKey: string) => void;
}

export function CalendarHeatmap({
  subject,
  month,
  onPreviousMonth,
  onNextMonth,
  onDayPress,
}: CalendarHeatmapProps) {
  const days = getCalendarDays(month);

  return (
    <View>
      <View style={styles.monthHeader}>
        <Pressable
          accessibilityLabel="Previous month"
          hitSlop={10}
          onPress={onPreviousMonth}
          style={styles.monthButton}
        >
          <MaterialCommunityIcons name="chevron-left" color={colors.text} size={22} />
        </Pressable>
        <Text style={styles.monthTitle}>{monthTitle(month)}</Text>
        <Pressable
          accessibilityLabel="Next month"
          hitSlop={10}
          onPress={onNextMonth}
          style={styles.monthButton}
        >
          <MaterialCommunityIcons name="chevron-right" color={colors.text} size={22} />
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const record = subject.records[day.key];
          const statusColor = record ? STATUS_META[record.status].color : undefined;
          return (
            <Pressable
              key={day.key}
              accessibilityRole="button"
              accessibilityLabel={`${day.key}${record ? `, ${STATUS_META[record.status].label}` : ''}`}
              onPress={() => onDayPress(day.key)}
              style={({ pressed }) => [
                styles.day,
                !day.inCurrentMonth && styles.outsideDay,
                statusColor
                  ? {
                      borderColor: `${statusColor}AA`,
                      backgroundColor: `${statusColor}34`,
                    }
                  : undefined,
                day.isToday && styles.today,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.inCurrentMonth && styles.outsideText,
                  statusColor && { color: colors.text },
                ]}
              >
                {day.day}
              </Text>
              {record?.note ? <View style={styles.noteDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  weekRow: {
    marginBottom: 6,
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  day: {
    width: '13.428%',
    aspectRatio: 1.08,
    maxHeight: 45,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outsideDay: {
    opacity: 0.36,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.lime,
  },
  dayText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  outsideText: {
    color: colors.faint,
  },
  noteDot: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.note,
  },
  pressed: {
    opacity: 0.6,
  },
});
