import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import EventForm from './EventForm';
import { CountdownEvent } from '../types';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

export default function AddEvent() {
  const navigate = useNavigate();
  const { add } = useEventStore();

  function handleSubmit(data: FormData) {
    add(data);
    navigate('/');
  }

  return <EventForm title="新建活动" onSubmit={handleSubmit} />;
}
