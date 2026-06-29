import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useEventStore } from '../store/eventStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTheme } from '../theme/ThemeContext';
import { daysFromToday, formatDisplayDate } from '../utils/dateUtils';
import { getMilestoneInfo } from '../utils/milestoneUtils';
import { GRADIENT_PRESETS } from '../types';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, togglePin, remove } = useEventStore();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();
  const event = events.find((e) => e.id === id);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!event) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
          <div style={{ color: colors.textMuted }}>找不到这个活动</div>
        </div>
      </div>
    );
  }

  const diff = daysFromToday(event.targetDate);
  const isToday = diff === 0;
  const absDiff = Math.abs(diff);
  const color = event.themeColor;
  const category = event.categoryId ? categories.find((c) => c.id === event.categoryId) : undefined;
  const milestone = getMilestoneInfo(absDiff);

  // Background
  let heroBg = `linear-gradient(135deg, ${color}CC, ${color}66)`;
  if (event.coverImage?.startsWith('gradient:')) {
    const gid = event.coverImage.replace('gradient:', '');
    const preset = GRADIENT_PRESETS.find((g) => g.id === gid);
    if (preset) heroBg = `linear-gradient(135deg, ${preset.colors.join(', ')})`;
  }

  // Live countdown units
  const target = dayjs(event.targetDate + 'T00:00:00');
  const nowDayjs = dayjs(now);
  const totalSecs = Math.abs(target.diff(nowDayjs, 'second'));
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const weeks = Math.floor(absDiff / 7);
  const months = Math.abs(target.diff(nowDayjs, 'month'));
  const years = Math.abs(target.diff(nowDayjs, 'year'));

  const isPast = diff < 0;
  const typeLabel = isToday ? '就是今天！' : event.type === 'countdown'
    ? (isPast ? '已经过去' : '还有')
    : (isPast ? '已经' : '还有');

  function handleDelete() {
    if (window.confirm(`确定删除「${event!.title}」？`)) {
      remove(id!);
      navigate('/');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: colors.background }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: colors.header, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px', height: 56,
      }}>
        <button onClick={() => navigate('/')} style={navBtnStyle}>← 返回</button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: colors.text, margin: 0 }}>详情</h1>
        <button onClick={() => navigate(`/event/${id}/edit`)} style={{ ...navBtnStyle, color: '#5B8DEF' }}>编辑</button>
      </div>

      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto', padding: '16px' }}>
        {/* Hero card */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          background: heroBg, marginBottom: 16,
          padding: '32px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            {event.icon && (
              <span style={{ fontSize: 32 }}>{event.icon}</span>
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                {event.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {formatDisplayDate(event.targetDate)}
                {category && <span style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>{category.label}</span>}
              </div>
            </div>
          </div>

          {/* Main count */}
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>{typeLabel}</div>
            {isToday ? (
              <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>🎉</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{absDiff}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>天</span>
              </div>
            )}
            {/* Live HH:MM:SS */}
            {!isToday && (
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Milestone banner */}
          {milestone && (
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
              padding: '8px 16px', textAlign: 'center', color: '#fff',
              fontSize: 13, fontWeight: 600,
            }}>
              {milestone.status === 'at'
                ? `🎊 第 ${milestone.value} 天里程碑！`
                : `✨ 距第 ${milestone.value} 天还有 ${milestone.daysTo} 天`}
            </div>
          )}
        </div>

        {/* Stats */}
        {!isToday && (
          <div style={{
            backgroundColor: colors.surface, borderRadius: 20,
            padding: '16px', marginBottom: 16,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            {[
              { label: '周', value: weeks },
              { label: '个月', value: months },
              { label: '年', value: years },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center', padding: '12px 8px' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color }}>{item.value}</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        {event.note && (
          <div style={{ backgroundColor: colors.surface, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>备注</div>
            <div style={{ fontSize: 15, color: colors.text, lineHeight: 1.6 }}>{event.note}</div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => togglePin(id!)}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${event.pinned ? color : colors.border}`,
              backgroundColor: event.pinned ? color + '1A' : colors.surface,
              color: event.pinned ? color : colors.textSecondary, cursor: 'pointer',
            }}
          >{event.pinned ? '📌 已置顶' : '📍 置顶'}</button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: event.title, text: `${event.title} — 还有 ${absDiff} 天` });
              } else {
                navigator.clipboard.writeText(`${event.title} — 还有 ${absDiff} 天`);
                alert('已复制到剪贴板');
              }
            }}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.surface, color: colors.textSecondary, cursor: 'pointer',
            }}
          >📤 分享</button>

          <button
            onClick={handleDelete}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              border: '1.5px solid #F87171',
              backgroundColor: 'transparent', color: '#F87171', cursor: 'pointer',
            }}
          >🗑️ 删除</button>
        </div>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, padding: '4px 8px', color: '#5B8DEF',
  borderRadius: 8, whiteSpace: 'nowrap',
};
