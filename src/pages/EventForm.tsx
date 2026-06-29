import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownEvent, EventType, RepeatType, THEME_COLORS, DEFAULT_COLOR, REPEAT_LABELS } from '../types';
import { useCategoryStore } from '../store/categoryStore';
import { useTheme } from '../theme/ThemeContext';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

interface Props {
  initialData?: CountdownEvent;
  onSubmit: (data: FormData) => void;
  onDelete?: () => void;
  title: string;
}

export default function EventForm({ initialData, onSubmit, onDelete, title }: Props) {
  const navigate = useNavigate();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();

  const [formTitle, setFormTitle]         = useState(initialData?.title ?? '');
  const [targetDate, setTargetDate]       = useState(initialData?.targetDate ?? '');
  const [type, setType]                   = useState<EventType>(initialData?.type ?? 'countdown');
  const [repeat, setRepeat]               = useState<RepeatType>(initialData?.repeat ?? 'none');
  const [categoryId, setCategoryId]       = useState(initialData?.categoryId ?? '');
  const [themeColor, setThemeColor]       = useState(initialData?.themeColor ?? DEFAULT_COLOR);
  const [icon, setIcon]                   = useState(initialData?.icon ?? '');
  const [note, setNote]                   = useState(initialData?.note ?? '');
  const [pinned]                          = useState(initialData?.pinned ?? false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !targetDate) return;
    onSubmit({
      title: formTitle.trim(),
      targetDate,
      type,
      repeat,
      isLunar: false,
      pinned,
      categoryId: categoryId || undefined,
      themeColor,
      icon: icon.trim() || undefined,
      note: note.trim() || undefined,
    });
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: colors.textMuted,
    marginBottom: 6, display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${colors.border}`, backgroundColor: colors.inputBg,
    color: colors.text, fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: '16px', marginBottom: 12,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: colors.background }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: colors.header, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px', height: 56,
      }}>
        <button onClick={() => navigate(-1)} style={navBtnStyle}>← 返回</button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: colors.text, margin: 0 }}>{title}</h1>
        <button form="event-form" type="submit" style={{ ...navBtnStyle, color: '#5B8DEF', fontWeight: 700 }}>保存</button>
      </div>

      <form id="event-form" onSubmit={handleSubmit} style={{ maxWidth: 640, width: '100%', margin: '0 auto', padding: '16px 16px 40px' }}>
        {/* Title & Icon */}
        <div style={sectionStyle}>
          <label style={labelStyle}>活动名称 *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="图标"
              maxLength={4}
              style={{ ...inputStyle, width: 60, textAlign: 'center', fontSize: 20, padding: '12px 8px', flexShrink: 0 }}
            />
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="活动名称"
              required
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>

        {/* Date */}
        <div style={sectionStyle}>
          <label style={labelStyle}>目标日期 *</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
            style={{ ...inputStyle, colorScheme: colors.background === '#0F1014' ? 'dark' : 'light' } as React.CSSProperties}
          />
        </div>

        {/* Type */}
        <div style={sectionStyle}>
          <label style={labelStyle}>类型</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['countdown', 'countup'] as EventType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  border: `1.5px solid ${type === t ? '#5B8DEF' : colors.border}`,
                  backgroundColor: type === t ? '#5B8DEF' : colors.inputBg,
                  color: type === t ? '#fff' : colors.textSecondary,
                  cursor: 'pointer',
                }}
              >
                {t === 'countdown' ? '⏳ 倒数日' : '📅 纪念日'}
              </button>
            ))}
          </div>
        </div>

        {/* Repeat */}
        <div style={sectionStyle}>
          <label style={labelStyle}>重复</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as RepeatType)}
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          >
            {(Object.entries(REPEAT_LABELS) as [RepeatType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div style={sectionStyle}>
          <label style={labelStyle}>分类</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCategoryId('')}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${!categoryId ? '#5B8DEF' : colors.border}`,
                backgroundColor: !categoryId ? '#5B8DEF1A' : colors.pillBg,
                color: !categoryId ? '#5B8DEF' : colors.textMuted, cursor: 'pointer',
              }}
            >无</button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${categoryId === cat.id ? cat.color : colors.border}`,
                  backgroundColor: categoryId === cat.id ? cat.color + '1A' : colors.pillBg,
                  color: categoryId === cat.id ? cat.color : colors.textMuted,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color, display: 'inline-block' }} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme color */}
        <div style={sectionStyle}>
          <label style={labelStyle}>主题颜色</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {THEME_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setThemeColor(c)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', backgroundColor: c,
                  border: themeColor === c ? `3px solid ${colors.text}` : '3px solid transparent',
                  cursor: 'pointer', padding: 0,
                  boxShadow: themeColor === c ? `0 0 0 2px ${colors.background}` : 'none',
                  outline: themeColor === c ? `2px solid ${c}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={sectionStyle}>
          <label style={labelStyle}>备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="可选备注…"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('确定删除这个活动？')) onDelete();
            }}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              border: '1.5px solid #F87171', backgroundColor: 'transparent',
              color: '#F87171', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              marginTop: 8,
            }}
          >🗑️ 删除活动</button>
        )}
      </form>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, padding: '4px 8px', color: '#5B8DEF',
  borderRadius: 8, whiteSpace: 'nowrap',
};
