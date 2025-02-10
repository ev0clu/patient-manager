type Doctor = {
  id: number;
  name: string;
  image: string;
  slots: Slot[];
  appointments: Appointment[];
  createdAt: Date;
  updatedAt: Date;
};
