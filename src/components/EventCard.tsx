import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CountdownEvent } from '../types';
import { formatDisplayDate, daysFromToday } from '../utils/dateUtils';
import { getMilestoneInfo } from '../utils/milestoneUtils';
import { useT } from '../i18n/useT';
import { useCategoryStore, categoryLabel } from '../store/categoryStore';

interface Props {
  event: CountdownEvent;
  onPress: () => void;
  onPinPress: () => void;
}

export default function EventCard({ event, onPress, onPinPress }: Props) {
  const { t, language } = useT();
  const { categories } = useCategoryStore();
  const category = categories.find((c) => c.id === event.categoryId);
  const diff = daysFromToday(event.targetDate);
  const isToday = diff === 0;
  const milestone = getMilestoneInfo(Math.abs(diff));

  const dayLabel = isToday
    ? t('todayBang')
    : event.type === 'countdown'
      ? diff > 0 ? t('daysLeft', { n: diff }) : t('daysAgo', { n: Math.abs(diff) })
      : diff < 0 ? t('daysSince', { n: Math.abs(diff) }) : t('daysUntil', { n: diff });

  const cardInner = (
    <View style={styles.cardContent}>
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

      {category && (
        <View style={styles.categoryPill}>
          <View style={styles.categoryDot} />
          <Text style={styles.categoryText}>{categoryLabel(category, t)}</Text>
        </View>
      )}

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
    </View>
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {event.coverImage ? (
        <ImageBackground source={{ uri: event.coverImage }} style={styles.cardBg}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />
          {cardInner}
        </ImageBackground>
      ) : (
        <View style={[styles.cardBg, { backgroundColor: event.themeColor }]}>
          {cardInner}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBg: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
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
