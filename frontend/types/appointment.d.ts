type Status = "PENDING" | "SCHEDULED" | "CANCELLED";

type Appointment = {
  id: number;
  doctorID: string;
  description?: string;
  status: Status;
  slotId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
