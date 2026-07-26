import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { StatusPill } from '../components/StatusPill';
import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useApp } from '../store/AppProvider';
import {
  aggregateSubjects,
  classesNeededToReachTarget,
  getColorBand,
  roundedAttendance,
} from '../utils/attendance';

export function InsightsScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const { subjects, settings } = useApp();
  const overall = useMemo(() => aggregateSubjects(subjects), [subjects]);
  const ranked = useMemo(
    () =>
      [...subjects].sort(
        (a, b) =>
          roundedAttendance(b.classesAttended, b.classesHeld) -
          roundedAttendance(a.classesAttended, a.classesHeld),
      ),
    [subjects],
  );
  const belowTarget = ranked.filter(
    (subject) =>
      roundedAttendance(subject.classesAttended, subject.classesHeld) <
      settings.targetPercentage,
  );
  const presentThisMonth = subjects.reduce(
    (sum, subject) =>
      sum +
      Object.values(subject.records).filter((record) => record.status === 'present')
        .length,
    0,
  );
  const markedThisMonth = subjects.reduce(
    (sum, subject) =>
      sum +
      Object.values(subject.records).filter(
        (record) => record.status === 'present' || record.status === 'absent',
      ).length,
    0,
  );
  const consistency = markedThisMonth
    ? Math.round((presentThisMonth / markedThisMonth) * 100)
    : 0;

  if (!subjects.length) {
    return (
      <Screen scroll={false} contentContainerStyle={styles.empty}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons name="chart-box-outline" color={colors.cyan} size={42} />
        </View>
        <Text style={styles.emptyTitle}>Insights begin with your first subject</Text>
        <Text style={styles.emptyText}>
          Mark a few classes and Streak75 will surface risks, rankings, and recovery plans.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Smart insights</Text>
          <Text style={styles.subtitle}>Patterns that help you stay ahead.</Text>
        </View>
        <MaterialCommunityIcons name="chart-areaspline" color={colors.lime} size={28} />
      </View>

      <View style={styles.heroRow}>
        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>Overall</Text>
          <Text style={styles.heroValue}>{Math.round(overall.percentage)}%</Text>
          <Text style={styles.heroHint}>
            {overall.percentage >= settings.targetPercentage
              ? 'On track'
              : 'Needs attention'}
          </Text>
        </Card>
        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>This month</Text>
          <Text style={[styles.heroValue, { color: colors.cyan }]}>{consistency}%</Text>
          <Text style={styles.heroHint}>Present rate</Text>
        </Card>
        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>At risk</Text>
          <Text style={[styles.heroValue, { color: belowTarget.length ? colors.warning : colors.success }]}>
            {belowTarget.length}
          </Text>
          <Text style={styles.heroHint}>Subjects</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Attendance by subject</Text>
      <Card style={styles.rankingCard}>
        {ranked.map((subject, index) => {
          const percentage = roundedAttendance(
            subject.classesAttended,
            subject.classesHeld,
          );
          const band = getColorBand(percentage, settings.colorBands);
          return (
            <View key={subject.id}>
              <View style={styles.subjectRow}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.subjectCopy}>
                  <View style={styles.subjectTop}>
                    <Text style={styles.subjectName} numberOfLines={1}>
                      {subject.name}
                    </Text>
                    <Text style={styles.subjectPercent}>{percentage}%</Text>
                  </View>
                  <View style={styles.bar}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${percentage}%`, backgroundColor: band.color },
                      ]}
                    />
                  </View>
                </View>
                <StatusPill band={band} compact />
              </View>
              {index < ranked.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </Card>

      <Text style={styles.sectionTitle}>Action plan</Text>
      {belowTarget.length ? (
        belowTarget.slice(0, 3).map((subject) => {
          const needed = classesNeededToReachTarget(
            subject.classesAttended,
            subject.classesHeld,
            settings.targetPercentage,
          );
          return (
            <Card key={subject.id} style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: `${subject.color}1E` }]}>
                <MaterialCommunityIcons name="trending-up" color={subject.color} size={22} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{subject.name}</Text>
                <Text style={styles.actionText}>
                  Attend the next {needed} {needed === 1 ? 'class' : 'classes'} to reach{' '}
                  {settings.targetPercentage}%.
                </Text>
              </View>
            </Card>
          );
        })
      ) : (
        <Card style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.success}1E` }]}>
            <MaterialCommunityIcons name="trophy-outline" color={colors.success} size={22} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>Every subject is on track</Text>
            <Text style={styles.actionText}>Keep the streak alive with consistent attendance.</Text>
          </View>
        </Card>
      )}

      <Card style={styles.smartTip}>
        <MaterialCommunityIcons name="lightbulb-on-outline" color={colors.warning} size={24} />
        <View style={styles.actionCopy}>
          <Text style={styles.tipLabel}>Smart tip</Text>
          <Text style={styles.actionText}>
            Mark attendance after every class. Fresh records produce more reliable forecasts.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  header: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  heroRow: {
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  hero: {
    flex: 1,
    minHeight: 102,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  heroValue: {
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 27,
    letterSpacing: -1,
  },
  heroHint: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 8.5,
  },
  sectionTitle: {
    marginBottom: 8,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rankingCard: {
    marginBottom: 17,
    paddingHorizontal: 12,
  },
  subjectRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rank: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  subjectCopy: {
    flex: 1,
    gap: 5,
  },
  subjectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectName: {
    maxWidth: '76%',
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
  },
  subjectPercent: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  bar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceSoft,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionCard: {
    minHeight: 72,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  actionText: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
  },
  smartTip: {
    marginTop: 8,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  tipLabel: {
    color: colors.warning,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});
