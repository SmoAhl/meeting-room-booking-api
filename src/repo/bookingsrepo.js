const rooms = new Map();

const getRoomStore = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  return rooms.get(roomId);
};

export const addBooking = (roomId, booking) => {
  const roomStore = getRoomStore(roomId);
  roomStore.set(booking.id, booking);
  return booking;
};

export const listBookings = (roomId) => {
  const roomStore = rooms.get(roomId);
  if (!roomStore) {
    return [];
  }
  return Array.from(roomStore.values());
};

export const removeBooking = (roomId, bookingId) => {
  const roomStore = rooms.get(roomId);
  if (!roomStore) {
    return false;
  }
  const removed = roomStore.delete(bookingId);
  if (roomStore.size === 0) {
    rooms.delete(roomId);
  }
  return removed;
};
