type Slot = {
  id: number;
  date: Date;
  booked: boolean;
  doctorId: string;
  appointments: Appointment[];
  createdAt: Date;
  updatedAt: Date;
};
