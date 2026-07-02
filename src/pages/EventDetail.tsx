import { useEffect, useRef, useState } from 'react';
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
  const heroRef = useRef<HTMLDivElement>(null);

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

  // Background style
  let heroBgStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${color}CC, ${color}66)`,
  };
  let gradientColors: string[] = [color + 'CC', color + '66'];

  if (event.coverImage?.startsWith('gradient:')) {
    const gid = event.coverImage.replace('gradient:', '');
    const preset = GRADIENT_PRESETS.find((g) => g.id === gid);
    if (preset) {
      gradientColors = preset.colors;
      heroBgStyle = { background: `linear-gradient(135deg, ${preset.colors.join(', ')})` };
    }
  } else if (event.coverImage?.startsWith('data:') || event.coverImage?.startsWith('http')) {
    heroBgStyle = {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${event.coverImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
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

  async function handleDownloadImage() {
    if (!event) return;
    const W = 800, H = 460;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Rounded rect clip
    const r = 32;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(W - r, 0);
    ctx.quadraticCurveTo(W, 0, W, r);
    ctx.lineTo(W, H - r);
    ctx.quadraticCurveTo(W, H, W - r, H);
    ctx.lineTo(r, H);
    ctx.quadraticCurveTo(0, H, 0, H - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    // Background
    if (event.coverImage?.startsWith('data:') || event.coverImage?.startsWith('http')) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, W, H);
          ctx.fillStyle = 'rgba(0,0,0,0.42)';
          ctx.fillRect(0, 0, W, H);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = event.coverImage!;
      });
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      gradientColors.forEach((c, i) => {
        grad.addColorStop(i / Math.max(gradientColors.length - 1, 1), c);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Icon
    if (event.icon) {
      ctx.font = '64px serif';
      ctx.fillText(event.icon, 52, 110);
    }

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `bold 38px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif`;
    ctx.fillText(event.icon ? event.title : event.title, 52, event.icon ? 165 : 120);

    // Date line
    ctx.fillStyle = 'rgba(255,255,255,0.68)';
    ctx.font = `22px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillText(formatDisplayDate(event.targetDate), 52, event.icon ? 205 : 160);

    // Type label
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = `20px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillText(typeLabel, 52, H - 130);

    // Big number
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 130px -apple-system, "PingFang SC", sans-serif`;
    const numStr = isToday ? '🎉' : String(absDiff);
    ctx.fillText(numStr, 46, H - 56);

    if (!isToday) {
      const numW = ctx.measureText(numStr).width;
      ctx.font = `bold 32px -apple-system, "PingFang SC", sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fillText('天', 52 + numW + 8, H - 72);
    }

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = `18px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillText('倒数日', W - 96, H - 28);

    // Download
    const link = document.createElement('a');
    link.download = `${event.title}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function handleShare() {
    if (!event) return;
    const text = `${event.title} — ${isToday ? '就是今天！' : `还有 ${absDiff} 天`}`;
    if (navigator.share) {
      await navigator.share({ title: event.title, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
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
        <div
          ref={heroRef}
          style={{
            borderRadius: 24, overflow: 'hidden',
            ...heroBgStyle, marginBottom: 16,
            padding: '32px 24px',
          }}
        >
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
                {category && (
                  <span style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>
                    {category.label}
                  </span>
                )}
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
            {/* Live hours / minutes / seconds with labels */}
            {!isToday && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
                {[
                  { value: hours,   label: '时' },
                  { value: minutes, label: '分' },
                  { value: seconds, label: '秒' },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: 'center', minWidth: 36 }}>
                    <div style={{
                      fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {String(value).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                      {label}
                    </div>
                  </div>
                ))}
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

        {/* Action buttons — 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => togglePin(id!)}
            style={{
              padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${event.pinned ? color : colors.border}`,
              backgroundColor: event.pinned ? color + '1A' : colors.surface,
              color: event.pinned ? color : colors.textSecondary, cursor: 'pointer',
            }}
          >{event.pinned ? '📌 已置顶' : '📍 置顶'}</button>

          <button
            onClick={handleShare}
            style={{
              padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.surface, color: colors.textSecondary, cursor: 'pointer',
            }}
          >📤 分享文字</button>

          <button
            onClick={handleDownloadImage}
            style={{
              padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
              border: `1.5px solid #5B8DEF`,
              backgroundColor: '#5B8DEF1A', color: '#5B8DEF', cursor: 'pointer',
            }}
          >💾 保存图片</button>

          <button
            onClick={handleDelete}
            style={{
              padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 600,
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
