import { CountdownEvent } from '../types';
import { formatDisplayDate, daysFromToday } from '../utils/dateUtils';
import { useCategoryStore } from '../store/categoryStore';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  event: CountdownEvent;
  onPress: () => void;
  onPinPress: () => void;
  onDelete: () => void;
}

export default function EventCard({ event, onPress, onPinPress, onDelete }: Props) {
  const diff = daysFromToday(event.targetDate);
  const isToday = diff === 0;
  const absDiff = Math.abs(diff);
  const color = event.themeColor;

  const { categories } = useCategoryStore();
  const { colors } = useTheme();
  const category = event.categoryId ? categories.find((c) => c.id === event.categoryId) : undefined;

  const unitLabel = isToday
    ? '天'
    : event.type === 'countdown'
    ? diff > 0 ? '天后' : '天前'
    : diff < 0 ? '天' : '天后';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', borderRadius: 20,
      marginBottom: 10, backgroundColor: colors.surface,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden',
    }}>
      {/* Accent bar */}
      <div style={{ width: 4, alignSelf: 'stretch', backgroundColor: color, flexShrink: 0 }} />

      {/* Main clickable area */}
      <div
        onClick={onPress}
        style={{
          flex: 1, display: 'flex', alignItems: 'center',
          padding: '12px 0', cursor: 'pointer', minWidth: 0,
        }}
      >
        {/* Icon badge */}
        <div style={{
          width: 56, height: 48, borderRadius: 14, margin: '0 12px',
          backgroundColor: color + '1A', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          {event.icon
            ? <span style={{ fontSize: event.icon.length > 2 ? 14 : 24, lineHeight: 1.2, textAlign: 'center' }}>{event.icon}</span>
            : <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color }} />
          }
        </div>

        {/* Middle: title + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: colors.textMuted }}>{formatDisplayDate(event.targetDate)}</span>
            {category && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: category.color,
                backgroundColor: category.color + '1A', borderRadius: 6,
                padding: '2px 6px',
              }}>{category.label}</span>
            )}
          </div>
        </div>

        {/* Right: number */}
        <div style={{ textAlign: 'right', minWidth: 52, marginLeft: 8 }}>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color }}>{isToday ? '今' : absDiff}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: color + 'AA' }}>{unitLabel}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px', alignItems: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onPinPress(); }}
          title={event.pinned ? '取消置顶' : '置顶'}
          style={{
            background: event.pinned ? color + '22' : 'transparent',
            border: 'none', cursor: 'pointer', borderRadius: 10,
            width: 32, height: 32, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}
        >
          <span style={{ color: event.pinned ? color : colors.textPlaceholder }}>
            {event.pinned ? '📌' : '📍'}
          </span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="删除"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            borderRadius: 8, width: 28, height: 28, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
