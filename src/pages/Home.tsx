import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useCategoryStore } from '../store/categoryStore';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import { sortKey, daysFromToday } from '../utils/dateUtils';
import { useTheme } from '../theme/ThemeContext';

export default function Home() {
  const navigate = useNavigate();
  const { events, togglePin, remove } = useEventStore();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  function confirmDelete(id: string, title: string) {
    if (window.confirm(`确定删除「${title}」？`)) remove(id);
  }

  const todayEvents = useMemo(
    () => events.filter((e) => daysFromToday(e.targetDate) === 0),
    [events],
  );

  const sorted = useMemo(() => {
    let filtered = events;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(q));
    }
    if (activeCategoryId) {
      filtered = filtered.filter((e) => e.categoryId === activeCategoryId);
    }
    const pinned = filtered.filter((e) => e.pinned).sort((a, b) => sortKey(a.targetDate) - sortKey(b.targetDate));
    const rest = filtered.filter((e) => !e.pinned).sort((a, b) => sortKey(a.targetDate) - sortKey(b.targetDate));
    return [...pinned, ...rest];
  }, [events, searchQuery, activeCategoryId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: colors.background }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: colors.header,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 16px', height: 56,
      }}>
        <button onClick={() => navigate('/settings')} style={btnStyle}>⚙️</button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
          倒数日
        </h1>
        <button onClick={() => navigate('/event/new')} style={{ ...btnStyle, fontSize: 26 }}>＋</button>
      </div>

      <div style={{ flex: 1, maxWidth: 640, width: '100%', margin: '0 auto', padding: '0 0 32px' }}>
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          backgroundColor: colors.surface, borderRadius: 14,
          margin: '12px 16px 10px', padding: '10px 12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <span style={{ fontSize: 16, marginRight: 8, color: colors.textMuted }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索活动名称…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, color: colors.text,
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: colors.textMuted }}>✕</button>
          )}
        </div>

        {/* Today banner */}
        {todayEvents.length > 0 && (
          <div style={{ margin: '0 16px 10px' }}>
            {todayEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => navigate(`/event/${ev.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', textAlign: 'left',
                  background: 'linear-gradient(135deg, #FF6B9D, #C44EE0)',
                  border: 'none', borderRadius: 16,
                  padding: '14px 16px', marginBottom: 8,
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(196,78,224,0.35)',
                }}
              >
                <span style={{ fontSize: 28 }}>🎉</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    就是今天！
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 2 }}>
                    {ev.icon ? `${ev.icon} ` : ''}{ev.title}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>›</span>
              </button>
            ))}
          </div>
        )}

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 10px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveCategoryId(null)}
            style={{
              ...chipStyle(colors),
              backgroundColor: !activeCategoryId ? '#111827' : colors.pillBg,
              color: !activeCategoryId ? '#fff' : colors.textMuted,
              borderColor: !activeCategoryId ? '#111827' : 'transparent',
            }}
          >全部</button>
          {categories.map((cat) => {
            const active = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(active ? null : cat.id)}
                style={{
                  ...chipStyle(colors),
                  backgroundColor: active ? cat.color : colors.pillBg,
                  color: active ? '#fff' : colors.textMuted,
                  borderColor: active ? cat.color : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: active ? '#fff' : cat.color, display: 'inline-block' }} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Event list */}
        <div style={{ padding: '0 16px' }}>
          {sorted.length === 0
            ? <EmptyState />
            : sorted.map((item) => (
              <EventCard
                key={item.id}
                event={item}
                onPress={() => navigate(`/event/${item.id}`)}
                onPinPress={() => togglePin(item.id)}
                onDelete={() => confirmDelete(item.id, item.title)}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 20, padding: 4, color: '#5B8DEF',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, borderRadius: 8,
} as const;

function chipStyle(colors: { pillBg: string }) {
  return {
    border: '1.5px solid transparent', borderRadius: 20,
    padding: '6px 12px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0,
  };
}
