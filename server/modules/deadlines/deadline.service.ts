import Deadline from '../../models/Deadline';
import { getIO } from '../../sockets';

export const getDeadlines = async (filter: any) => {
  return await Deadline.find(filter).sort({ dueDate: 1 });
};

export const createDeadline = async (data: any) => {
  const deadline = await Deadline.create(data);
  const io = getIO();
  io.emit('deadlineCreated', deadline);
  return deadline;
};

export const updateDeadline = async (id: string, data: any) => {
  const deadline = await Deadline.findByIdAndUpdate(id, data, { new: true });
  if (deadline) {
    const io = getIO();
    io.emit('deadlineUpdated', deadline);
  }
  return deadline;
};

export const deleteDeadline = async (id: string) => {
  const deadline = await Deadline.findByIdAndDelete(id);
  if (deadline) {
    const io = getIO();
    io.emit('deadlineDeleted', id);
  }
  return deadline;
};
