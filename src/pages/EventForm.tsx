import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CountdownEvent, EventType, RepeatType,
  THEME_COLORS, DEFAULT_COLOR, REPEAT_LABELS,
  GRADIENT_PRESETS, GradientCategory,
} from '../types';
import { useCategoryStore } from '../store/categoryStore';
import { useTheme } from '../theme/ThemeContext';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

interface Props {
  initialData?: CountdownEvent;
  onSubmit: (data: FormData) => void;
  onDelete?: () => void;
  title: string;
}

const GRADIENT_CATEGORIES: { key: GradientCategory; label: string }[] = [
  { key: 'sakura', label: '🌸 桜' },
  { key: 'wa',     label: '🏮 和' },
  { key: 'shiki',  label: '🍁 四季' },
  { key: 'wabi',   label: '🍵 侘寂' },
  { key: 'yugen',  label: '🌙 幽玄' },
  { key: 'sumi',   label: '🖌️ 墨' },
];

const EMOJI_GROUPS = [
  { label: '❤️ 情感', emojis: ['❤️','💕','💖','💗','💝','🥰','😍','😘','💏','💑','👨‍👩‍👦','👨‍👩‍👧','👪','🫂','🤗','😊'] },
  { label: '🎉 庆典', emojis: ['🎉','🎊','🎈','🎂','🍰','🎁','🥳','🏆','🎖️','👑','🥂','🍾','✨','⭐','🌟','💫'] },
  { label: '🌸 自然', emojis: ['🌸','🌺','🌹','🌷','🌻','🍀','🌈','☀️','🌙','⭐','❄️','🌊','🔥','🍁','🌿','🦋'] },
  { label: '✈️ 旅行', emojis: ['✈️','🏖️','🏔️','🗺️','🏠','🏡','🌏','🚀','🛳️','🚂','🚗','🎡','🗼','🏯','⛩️','🌉'] },
  { label: '📚 学习', emojis: ['📚','🎓','✏️','📝','💡','🔬','🏫','💻','📊','📈','🎯','🏅','📖','🔭','🧪','⚗️'] },
  { label: '💼 工作', emojis: ['💼','📅','💻','📱','📊','📝','🔑','🏢','👔','🤝','📞','✉️','📌','🖥️','⌨️','🖨️'] },
  { label: '🍕 美食', emojis: ['🍕','🎂','🍜','🍣','🍸','☕','🍵','🍦','🥂','🍾','🍩','🍪','🥗','🍱','🍔','🍰'] },
  { label: '💪 运动', emojis: ['⚽','🏀','🎾','🏋️','🧘','🏃','🎮','🎲','🏊','🚴','⛷️','🏄','🥊','🎯','🏇','🎿'] },
];

export default function EventForm({ initialData, onSubmit, onDelete, title }: Props) {
  const navigate = useNavigate();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();

  const [formTitle, setFormTitle]     = useState(initialData?.title ?? '');
  const [targetDate, setTargetDate]   = useState(initialData?.targetDate ?? '');
  const [type, setType]               = useState<EventType>(initialData?.type ?? 'countdown');
  const [repeat, setRepeat]           = useState<RepeatType>(initialData?.repeat ?? 'none');
  const [categoryId, setCategoryId]   = useState(initialData?.categoryId ?? '');
  const [themeColor, setThemeColor]   = useState(initialData?.themeColor ?? DEFAULT_COLOR);
  const [coverImage, setCoverImage]   = useState(initialData?.coverImage ?? '');
  const [icon, setIcon]               = useState(initialData?.icon ?? '');
  const [note, setNote]               = useState(initialData?.note ?? '');
  const [pinned]                      = useState(initialData?.pinned ?? false);
  const [gradCat, setGradCat]         = useState<GradientCategory>('sakura');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [emojiGroup, setEmojiGroup]   = useState(0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !targetDate) return;
    onSubmit({
      title: formTitle.trim(),
      targetDate, type, repeat,
      isLunar: false, pinned,
      categoryId: categoryId || undefined,
      themeColor,
      coverImage: coverImage || undefined,
      icon: icon.trim() || undefined,
      note: note.trim() || undefined,
    });
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target?.result as string);
    reader.readAsDataURL(file);
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
  const chip = (active: boolean, accent = '#5B8DEF'): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600,
    border: `1.5px solid ${active ? accent : colors.border}`,
    backgroundColor: active ? accent + '1A' : colors.inputBg,
    color: active ? accent : colors.textMuted, cursor: 'pointer',
  });

  const selectedGradId = coverImage.startsWith('gradient:') ? coverImage.replace('gradient:', '') : '';

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
            {/* Icon button — click to open picker */}
            <button
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              style={{
                ...inputStyle, width: 60, textAlign: 'center', fontSize: 24,
                padding: '12px 8px', flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              {icon || '😊'}
            </button>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="活动名称"
              required
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>

          {/* Icon Picker */}
          {showIconPicker && (
            <div style={{
              marginTop: 10, backgroundColor: colors.background,
              borderRadius: 14, border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}>
              {/* Group tabs */}
              <div style={{
                display: 'flex', overflowX: 'auto', gap: 0,
                borderBottom: `1px solid ${colors.border}`,
              }}>
                {EMOJI_GROUPS.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEmojiGroup(i)}
                    style={{
                      flexShrink: 0, padding: '8px 12px', fontSize: 18,
                      background: emojiGroup === i ? colors.surface : 'transparent',
                      border: 'none', cursor: 'pointer',
                      borderBottom: emojiGroup === i ? `2px solid #5B8DEF` : '2px solid transparent',
                    }}
                  >
                    {g.emojis[0]}
                  </button>
                ))}
              </div>
              {/* Emoji grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', padding: '8px' }}>
                {/* Clear option */}
                <button
                  type="button"
                  onClick={() => { setIcon(''); setShowIconPicker(false); }}
                  style={{
                    fontSize: 13, padding: '6px', borderRadius: 8, border: 'none',
                    background: !icon ? colors.pillBg : 'transparent',
                    cursor: 'pointer', color: colors.textMuted,
                  }}
                >无</button>
                {EMOJI_GROUPS[emojiGroup].emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => { setIcon(em); setShowIconPicker(false); }}
                    style={{
                      fontSize: 24, padding: '6px', borderRadius: 8, border: 'none',
                      background: icon === em ? colors.pillBg : 'transparent',
                      cursor: 'pointer',
                    }}
                  >{em}</button>
                ))}
              </div>
            </div>
          )}
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
              <button key={t} type="button" onClick={() => setType(t)} style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                border: `1.5px solid ${type === t ? '#5B8DEF' : colors.border}`,
                backgroundColor: type === t ? '#5B8DEF' : colors.inputBg,
                color: type === t ? '#fff' : colors.textSecondary, cursor: 'pointer',
              }}>
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
            <button type="button" onClick={() => setCategoryId('')} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${!categoryId ? '#5B8DEF' : colors.border}`,
              backgroundColor: !categoryId ? '#5B8DEF1A' : colors.pillBg,
              color: !categoryId ? '#5B8DEF' : colors.textMuted, cursor: 'pointer',
            }}>无</button>
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${categoryId === cat.id ? cat.color : colors.border}`,
                backgroundColor: categoryId === cat.id ? cat.color + '1A' : colors.pillBg,
                color: categoryId === cat.id ? cat.color : colors.textMuted,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color, display: 'inline-block' }} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme color */}
        <div style={sectionStyle}>
          <label style={labelStyle}>主题颜色（卡片配色）</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {THEME_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setThemeColor(c)} style={{
                width: 36, height: 36, borderRadius: '50%', backgroundColor: c,
                border: themeColor === c ? `3px solid ${colors.text}` : '3px solid transparent',
                cursor: 'pointer', padding: 0,
                boxShadow: themeColor === c
                  ? `0 0 0 2px ${colors.background}, 0 0 0 4px ${c}`
                  : '0 2px 4px rgba(0,0,0,0.15)',
              }} />
            ))}
          </div>
        </div>

        {/* Background (gradients + photo) */}
        <div style={sectionStyle}>
          <label style={labelStyle}>详情页背景</label>

          {/* Gradient category tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {GRADIENT_CATEGORIES.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setGradCat(key)} style={chip(gradCat === key)}>
                {label}
              </button>
            ))}
          </div>

          {/* Gradient swatches */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {GRADIENT_PRESETS.filter((g) => g.category === gradCat).map((preset) => {
              const isSelected = selectedGradId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => setCoverImage(isSelected ? '' : `gradient:${preset.id}`)}
                  style={{
                    width: 44, height: 44, borderRadius: 12, padding: 0, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                    border: isSelected ? `3px solid ${colors.text}` : '3px solid transparent',
                    boxShadow: isSelected
                      ? `0 0 0 2px ${colors.background}, 0 0 0 4px ${preset.colors[0]}`
                      : '0 2px 6px rgba(0,0,0,0.18)',
                    position: 'relative',
                  }}
                >
                  {isSelected && (
                    <span style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, color: preset.dark ? '#fff' : '#333',
                    }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Photo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${colors.border}`, backgroundColor: colors.inputBg,
              color: colors.textSecondary, cursor: 'pointer',
            }}>
              🖼️ 从相册上传
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </label>
            {coverImage && (
              <button type="button" onClick={() => setCoverImage('')} style={{
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: '1.5px solid #F87171', backgroundColor: 'transparent',
                color: '#F87171', cursor: 'pointer',
              }}>✕ 清除背景</button>
            )}
          </div>

          {/* Preview */}
          {coverImage.startsWith('data:') && (
            <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', height: 90 }}>
              <img src={coverImage} alt="背景预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {selectedGradId && (
            <div style={{
              marginTop: 10, borderRadius: 12, height: 48,
              background: `linear-gradient(135deg, ${GRADIENT_PRESETS.find(g => g.id === selectedGradId)?.colors.join(', ')})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: GRADIENT_PRESETS.find(g => g.id === selectedGradId)?.dark ? '#fff' : '#333',
              }}>
                {GRADIENT_PRESETS.find(g => g.id === selectedGradId)?.label}
              </span>
            </div>
          )}
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

        {/* Delete */}
        {onDelete && (
          <button type="button" onClick={() => { if (window.confirm('确定删除这个活动？')) onDelete(); }} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            border: '1.5px solid #F87171', backgroundColor: 'transparent',
            color: '#F87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
          }}>🗑️ 删除活动</button>
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
