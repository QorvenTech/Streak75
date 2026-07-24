import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BunkGauge } from '../components/BunkGauge';
import { Card } from '../components/Card';
import { MetricTile } from '../components/MetricTile';
import { Screen } from '../components/Screen';
import { colors, fonts, radii } from '../constants/theme';
import { TabParamList } from '../navigation/types';
import { useApp } from '../store/AppProvider';
import {
  aggregateSubjects,
  attendancePercentage,
  classesNeededToReachTarget,
  maxMissableClasses,
  projectedAfterAttend,
  projectedAfterMiss,
} from '../utils/attendance';

export function BunkMeterScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<TabParamList, 'BunkMeter'>>();
  const { subjects, settings, selectedSubjectId, setSelectedSubjectId } = useApp();
  const [scope, setScope] = useState<string>(selectedSubjectId ?? 'overall');
  const [simulation, setSimulation] = useState(6);
  const overall = useMemo(() => aggregateSubjects(subjects), [subjects]);
  const selected = subjects.find((subject) => subject.id === scope);
  const attended = selected?.classesAttended ?? overall.classesAttended;
  const held = selected?.classesHeld ?? overall.classesHeld;
  const percentage = attendancePercentage(attended, held);
  const target = settings.targetPercentage;
  const aboveTarget = percentage >= target;
  const missable = maxMissableClasses(attended, held, target);
  const needed = classesNeededToReachTarget(attended, held, target);
  const projected = projectedAfterAttend(attended, held, simulation);

  if (!subjects.length) {
    return (
      <Screen scroll={false} contentContainerStyle={styles.empty}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons name="speedometer" color={colors.lime} size={42} />
        </View>
        <Text style={styles.emptyTitle}>Your Bunk Meter needs a subject</Text>
        <Text style={styles.emptyText}>
          Add your first subject and starting totals to calculate a safe bunk allowance.
        </Text>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Go to dashboard</Text>
        </Pressable>
      </Screen>
    );
  }

  const selectScope = (id: string) => {
    setScope(id);
    if (id !== 'overall') setSelectedSubjectId(id);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bunk Meter</Text>
          <Text style={styles.subtitle}>Know your limit. Plan smart.</Text>
        </View>
        <View style={styles.info}>
          <MaterialCommunityIcons name="information-outline" color={colors.cyan} size={21} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selector}
      >
        <Pressable
          onPress={() => selectScope('overall')}
          style={[styles.chip, scope === 'overall' && styles.chipActive]}
        >
          <MaterialCommunityIcons
            name="chart-donut"
            color={scope === 'overall' ? colors.background : colors.cyan}
            size={15}
          />
          <Text style={[styles.chipText, scope === 'overall' && styles.chipTextActive]}>
            Overall
          </Text>
        </Pressable>
        {subjects.map((subject) => (
          <Pressable
            key={subject.id}
            onPress={() => selectScope(subject.id)}
            style={[
              styles.chip,
              scope === subject.id && {
                borderColor: subject.color,
                backgroundColor: subject.color,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: subject.color }]} />
            <Text
              style={[
                styles.chipText,
                scope === subject.id && styles.chipTextActive,
              ]}
            >
              {subject.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Card style={styles.gaugeCard}>
        <BunkGauge
          percentage={percentage}
          target={target}
          headline={aboveTarget ? 'Bunk limit left' : 'Recovery needed'}
          value={aboveTarget ? missable : Number.isFinite(needed) ? needed : '∞'}
          valueLabel={aboveTarget ? 'classes' : 'classes in a row'}
        />
        <View style={styles.message}>
          <MaterialCommunityIcons
            name={aboveTarget ? 'check-decagram-outline' : 'alert-circle-outline'}
            color={aboveTarget ? colors.lime : colors.warning}
            size={19}
          />
          <Text style={styles.messageText}>
            {aboveTarget
              ? `You can miss ${missable} more ${missable === 1 ? 'class' : 'classes'} and still stay at or above ${target}%.`
              : `Attend the next ${Number.isFinite(needed) ? needed : 'all'} classes to reach ${target}%.`}
          </Text>
        </View>
      </Card>

      <View style={styles.metrics}>
        <MetricTile label="Current" value={`${Math.round(percentage)}%`} accent={colors.cyan} />
        <MetricTile
          label="Target"
          value={`${target}%`}
          accent={colors.lime}
        />
        <MetricTile
          label="If you miss 1"
          value={`${Math.round(projectedAfterMiss(attended, held, 1))}%`}
          accent={colors.orange}
        />
        <MetricTile
          label="If you attend 1"
          value={`${Math.round(projectedAfterAttend(attended, held, 1))}%`}
          accent={colors.success}
        />
      </View>

      <Card style={styles.simulator}>
        <View style={styles.simulatorHeading}>
          <View>
            <Text style={styles.simulatorTitle}>Recovery simulator</Text>
            <Text style={styles.simulatorSubtitle}>
              See how attending upcoming classes helps.
            </Text>
          </View>
          <MaterialCommunityIcons name="chart-timeline-variant-shimmer" color={colors.cyan} size={23} />
        </View>
        <Text style={styles.attendLabel}>Attend next</Text>
        <View style={styles.simulatorRow}>
          <View style={styles.options}>
            {[1, 3, 6, 10].map((value) => (
              <Pressable
                key={value}
                onPress={() => setSimulation(value)}
                style={[styles.option, simulation === value && styles.optionActive]}
              >
                <Text
                  style={[
                    styles.optionText,
                    simulation === value && styles.optionTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <MaterialCommunityIcons name="arrow-right" color={colors.cyan} size={22} />
          <View style={styles.projected}>
            <Text style={styles.projectedLabel}>New attendance</Text>
            <Text style={styles.projectedValue}>{projected.toFixed(1)}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, projected))}%` },
            ]}
          />
          <View style={[styles.targetMarker, { left: `${target}%` }]} />
        </View>
      </Card>

      <View style={styles.footerTip}>
        <MaterialCommunityIcons name="lightning-bolt" color={colors.lime} size={19} />
        <Text style={styles.footerText}>
          Stay consistent. Small effort, big difference.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 84,
    height: 84,
    marginBottom: 17,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 290,
    marginTop: 7,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  emptyButton: {
    minHeight: 46,
    marginTop: 18,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 23,
  },
  subtitle: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  info: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selector: {
    paddingBottom: 11,
    gap: 8,
  },
  chip: {
    minHeight: 35,
    paddingHorizontal: 11,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    borderColor: colors.lime,
    backgroundColor: colors.lime,
  },
  chipText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  chipTextActive: {
    color: colors.background,
    fontFamily: fonts.bold,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  gaugeCard: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  message: {
    marginHorizontal: 8,
    minHeight: 55,
    paddingHorizontal: 13,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  messageText: {
    maxWidth: 270,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  metrics: {
    marginVertical: 10,
    flexDirection: 'row',
    gap: 7,
  },
  simulator: {
    padding: 14,
  },
  simulatorHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simulatorTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  simulatorSubtitle: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  attendLabel: {
    marginTop: 14,
    marginBottom: 6,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  simulatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
  },
  option: {
    width: 40,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    borderColor: colors.lime,
    backgroundColor: colors.lime,
  },
  optionText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  optionTextActive: {
    color: colors.background,
  },
  projected: {
    minWidth: 103,
    height: 58,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectedLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  projectedValue: {
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 21,
  },
  progressTrack: {
    height: 6,
    marginTop: 15,
    borderRadius: 3,
    backgroundColor: colors.surfaceSoft,
    overflow: 'visible',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  targetMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 14,
    backgroundColor: colors.white,
  },
  footerTip: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: `${colors.cyan}0E`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: colors.cyan,
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
});
