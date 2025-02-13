type Status = "PENDING" | "SCHEDULED" | "CANCELLED";

type Appointment = {
  id: number;
  doctorId: string;
  doctor: Doctor;
  description?: string;
  status: Status;
  slotId: string;
  slot: Slot;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
