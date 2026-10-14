import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountdownEvent } from '../types';
import { formatDisplayDate, daysFromToday } from '../utils/dateUtils';
import { getMilestoneInfo } from '../utils/milestoneUtils';
import { useT } from '../i18n/useT';

interface Props {
  event: CountdownEvent;
  onPress: () => void;
  onPinPress: () => void;
}

export default function EventCard({ event, onPress, onPinPress }: Props) {
  const { t, language } = useT();
  const diff = daysFromToday(event.targetDate);
  const isToday = diff === 0;
  const milestone = getMilestoneInfo(Math.abs(diff));

  const dayLabel = isToday
    ? t('todayBang')
    : event.type === 'countdown'
      ? diff > 0 ? t('daysLeft', { n: diff }) : t('daysAgo', { n: Math.abs(diff) })
      : diff < 0 ? t('daysSince', { n: Math.abs(diff) }) : t('daysUntil', { n: diff });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: event.themeColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <TouchableOpacity onPress={onPinPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={event.pinned ? 'pin' : 'pin-outline'}
            size={18}
            color="rgba(255,255,255,0.85)"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{formatDisplayDate(event.targetDate, language)}</Text>

      {milestone && (
        <View style={[
          styles.milestoneBadge,
          milestone.status === 'at' ? styles.milestoneAt : styles.milestoneApproaching,
        ]}>
          <Text style={styles.milestoneText}>
            {milestone.status === 'at'
              ? t('milestoneAt', { value: milestone.value })
              : t('milestoneApproaching', { days: milestone.daysTo, value: milestone.value })}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dayLabel}>{dayLabel}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {t(event.type === 'countdown' ? 'typeCountdown' : 'typeCountup')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 10,
  },
  milestoneBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  milestoneAt: {
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  milestoneApproaching: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dayLabel: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
