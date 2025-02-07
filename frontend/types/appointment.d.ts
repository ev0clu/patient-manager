type Status = "PENDING" | "SCHEDULED" | "CANCELLED";

type Appointment = {
  id: number;
  doctor: string;
  description?: string;
  status: Status;
  appointmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
};
