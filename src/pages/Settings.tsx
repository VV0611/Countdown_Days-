import { useNavigate } from 'react-router-dom';
import { useSettingsStore, ColorSchemeOption } from '../store/settingsStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTheme } from '../theme/ThemeContext';
import { useState } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const { colorScheme, setColorScheme } = useSettingsStore();
  const { categories, addCategory, removeCategory } = useCategoryStore();
  const { colors } = useTheme();

  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatColor, setNewCatColor] = useState('#60A5FA');

  const schemes: { value: ColorSchemeOption; label: string; icon: string }[] = [
    { value: 'light', label: '浅色', icon: '☀️' },
    { value: 'dark', label: '深色', icon: '🌙' },
    { value: 'system', label: '跟随系统', icon: '💻' },
  ];

  const sectionStyle: React.CSSProperties = {
    backgroundColor: colors.surface, borderRadius: 16, padding: '16px', marginBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 10, display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: colors.background }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: colors.header, borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px', height: 56,
      }}>
        <button onClick={() => navigate('/')} style={navBtnStyle}>← 返回</button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: colors.text, margin: 0 }}>设置</h1>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto', padding: '16px' }}>
        {/* Theme */}
        <div style={sectionStyle}>
          <label style={labelStyle}>外观</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {schemes.map((s) => (
              <button
                key={s.value}
                onClick={() => setColorScheme(s.value)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${colorScheme === s.value ? '#5B8DEF' : colors.border}`,
                  backgroundColor: colorScheme === s.value ? '#5B8DEF1A' : colors.inputBg,
                  color: colorScheme === s.value ? '#5B8DEF' : colors.textSecondary,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={sectionStyle}>
          <label style={labelStyle}>分类管理</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', backgroundColor: colors.surfaceSecondary, borderRadius: 10,
              }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ flex: 1, fontSize: 14, color: colors.text }}>{cat.label}</span>
                {!cat.isDefault && (
                  <button
                    onClick={() => {
                      if (window.confirm(`删除分类「${cat.label}」？`)) removeCategory(cat.id);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', fontSize: 16 }}
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Add category */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${colors.border}`, cursor: 'pointer', padding: 2 }}
            />
            <input
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              placeholder="新分类名称"
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                border: `1.5px solid ${colors.border}`, backgroundColor: colors.inputBg,
                color: colors.text, fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={() => {
                if (newCatLabel.trim()) {
                  addCategory(newCatLabel.trim(), newCatColor);
                  setNewCatLabel('');
                }
              }}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', backgroundColor: '#5B8DEF', color: '#fff', cursor: 'pointer',
              }}
            >添加</button>
          </div>
        </div>

        {/* App info */}
        <div style={{ textAlign: 'center', padding: '16px', color: colors.textMuted, fontSize: 12 }}>
          倒数日 v1.0.0
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
