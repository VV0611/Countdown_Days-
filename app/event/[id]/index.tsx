import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '../../../src/store/eventStore';
import { daysFromToday, formatDisplayDate } from '../../../src/utils/dateUtils';
import { getMilestoneInfo } from '../../../src/utils/milestoneUtils';
import { useT } from '../../../src/i18n/useT';
import { webMaxWidth } from '../../../src/utils/webStyle';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events } = useEventStore();
  const event = events.find((e) => e.id === id);
  const { t, language } = useT();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: t('detailTitle') }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('eventNotFound')}</Text>
        </View>
      </>
    );
  }

  const diff = daysFromToday(event.targetDate);
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;
  const isToday = diff === 0;
  const milestone = getMilestoneInfo(absDiff);

  // ── Week breakdown ──────────────────────────────────────────────
  const weeks = Math.floor(absDiff / 7);
  const daysAfterWeeks = absDiff % 7;

  // ── Month breakdown (dayjs-accurate) ────────────────────────────
  const targetDay = dayjs(event.targetDate).startOf('day');
  const todayDay = dayjs().startOf('day');
  const months = Math.abs(targetDay.diff(todayDay, 'month'));
  const pivotDate = isPast
    ? targetDay.add(months, 'month')
    : todayDay.add(months, 'month');
  const daysAfterMonths = Math.abs(targetDay.diff(pivotDate, 'day'));

  // ── Year breakdown ───────────────────────────────────────────────
  const years = Math.floor(absDiff / 365);
  const daysAfterYears = absDiff - years * 365;

  // ── Live H:M:S (intra-day precision) ────────────────────────────
  const totalSecondsRaw = targetDay.diff(dayjs(now), 'second');
  const intradaySeconds = Math.abs(totalSecondsRaw) % 86400;
  const hh = String(Math.floor(intradaySeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((intradaySeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(intradaySeconds % 60).padStart(2, '0');
  const preciseStr = isToday ? `${hh}:${mm}:${ss}` : `${absDiff} ${t('dayUnit')}  ${hh}:${mm}:${ss}`;

  const heroLabel = isToday ? null : isPast ? t('past') : t('remaining');
  const typeLabel = t(event.type === 'countdown' ? 'typeCountdown' : 'typeCountup');

  return (
    <>
      <Stack.Screen
        options={{
          title: event.title,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/event/${id}/edit`)}
              style={styles.editBtn}
            >
              <Ionicons name="pencil-outline" size={22} color="#5B8DEF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={webMaxWidth} showsVerticalScrollIndicator={false}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: event.themeColor }]}>
          {milestone?.status === 'at' && (
            <View style={styles.milestoneBanner}>
              <Text style={styles.milestoneBannerText}>{t('milestoneAt', { value: milestone.value })}</Text>
            </View>
          )}
          {milestone?.status === 'approaching' && (
            <View style={[styles.milestoneBanner, styles.approachingBanner]}>
              <Text style={styles.milestoneBannerText}>
                {t('milestoneApproaching', { days: milestone.daysTo, value: milestone.value })}
              </Text>
            </View>
          )}

          {heroLabel && <Text style={styles.heroLabel}>{heroLabel}</Text>}

          {isToday ? (
            <Text style={styles.todayEmoji}>🎉</Text>
          ) : (
            <Text style={styles.bigNumber}>{absDiff}</Text>
          )}

          {isToday ? (
            <Text style={styles.todayText}>{t('todayIsText')}</Text>
          ) : (
            <Text style={styles.bigUnit}>{t('dayUnit')}</Text>
          )}

          <Text style={styles.heroDate}>{formatDisplayDate(event.targetDate, language)}</Text>
        </View>

        {/* ── Conversions ──────────────────────────────────────── */}
        {!isToday && (
          <View style={styles.section}>
            <UnitRow
              icon="time-outline"
              label={t('preciseToSecond')}
              value={preciseStr}
              accent
              color={event.themeColor}
            />
            <Divider />
            <UnitRow
              icon="calendar-outline"
              label={t('convertWeeks')}
              value={weeks > 0 ? `${weeks} ${t('unitWeek')}${daysAfterWeeks > 0 ? ` ${daysAfterWeeks} ${t('dayUnit')}` : ''}` : `${daysAfterWeeks} ${t('dayUnit')}`}
            />
            <Divider />
            <UnitRow
              icon="calendar-number-outline"
              label={t('convertMonths')}
              value={months > 0 ? `${t('approxPrefix')}${months} ${t('unitMonth')}${daysAfterMonths > 0 ? ` ${daysAfterMonths} ${t('dayUnit')}` : ''}` : `${daysAfterMonths} ${t('dayUnit')}`}
            />
            {years >= 1 && (
              <>
                <Divider />
                <UnitRow
                  icon="planet-outline"
                  label={t('convertYears')}
                  value={`${years} ${t('unitYear')}${daysAfterYears > 0 ? ` ${daysAfterYears} ${t('dayUnit')}` : ''}`}
                />
              </>
            )}
          </View>
        )}

        {/* ── Meta badges ──────────────────────────────────────── */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: event.themeColor + '22' }]}>
            <Text style={[styles.badgeText, { color: event.themeColor }]}>{typeLabel}</Text>
          </View>
          {event.pinned && (
            <View style={[styles.badge, { backgroundColor: '#FBBF2420' }]}>
              <Text style={[styles.badgeText, { color: '#D97706' }]}>{t('pinnedBadge')}</Text>
            </View>
          )}
        </View>

        {event.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{event.note}</Text>
          </View>
        ) : null}

        <View style={{ height: 48 }} />
      </ScrollView>
    </>
  );
}

function UnitRow({
  icon, label, value, accent, color,
}: {
  icon: string; label: string; value: string; accent?: boolean; color?: string;
}) {
  return (
    <View style={styles.unitRow}>
      <Ionicons
        name={icon as any}
        size={18}
        color={accent && color ? color : '#9CA3AF'}
        style={styles.unitIcon}
      />
      <Text style={styles.unitLabel}>{label}</Text>
      <Text style={[styles.unitValue, accent && color ? { color } : null]}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#9CA3AF', fontSize: 15 },
  editBtn: { marginRight: 4, padding: 4 },

  // Hero
  hero: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  milestoneBanner: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  approachingBanner: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  milestoneBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.80)',
    marginBottom: 4,
  },
  bigNumber: {
    fontSize: 96,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 104,
  },
  bigUnit: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginTop: -4,
    marginBottom: 12,
  },
  todayEmoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  todayText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    marginBottom: 12,
  },
  heroDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 4,
  },

  // Conversions section
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  unitIcon: { marginRight: 10 },
  unitLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  unitValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginLeft: 44,
  },

  // Meta
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Note
  noteBox: {
    margin: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
