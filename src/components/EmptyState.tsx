import { useTheme } from '../theme/ThemeContext';

export default function EmptyState() {
  const { colors } = useTheme();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 32px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🗓️</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: colors.text, marginBottom: 8 }}>还没有倒数日</div>
      <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.5 }}>
        点击右上角 + 添加第一个活动吧
      </div>
    </div>
  );
}
