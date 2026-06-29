import { useNavigate, useParams } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import EventForm from './EventForm';
import { CountdownEvent } from '../types';
import { useTheme } from '../theme/ThemeContext';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, update, remove } = useEventStore();
  const { colors } = useTheme();
  const event = events.find((e) => e.id === id);

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

  function handleSubmit(data: FormData) {
    update(id!, data);
    navigate(`/event/${id}`);
  }

  function handleDelete() {
    remove(id!);
    navigate('/');
  }

  return <EventForm title="编辑活动" initialData={event} onSubmit={handleSubmit} onDelete={handleDelete} />;
}
