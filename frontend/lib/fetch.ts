import { appointmentType } from "@/schemas/appointmentSchema";
import { env } from "./env";

export const fetchGetAllAppointments = async (
  accessToken: string,
  refreshToken: string
): Promise<Appointment[]> => {
  const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/appointments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
      "X-Refresh-Token": `${refreshToken}`,
    },
    credentials: "include",
    mode: "cors",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${body.error}`);
  }

  return body.appointments;
};

export const fetchGetAppointment = async (
  accessToken: string,
  refreshToken: string,
  id: number
): Promise<Appointment> => {
  const response = await fetch(
    `${env.EXPO_PUBLIC_API_URL}/appointments/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${accessToken}`,
        "X-Refresh-Token": `${refreshToken}`,
      },
      credentials: "include",
      mode: "cors",
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${body.error}`);
  }

  return body.appointment;
};

export const fetchDeleteAppointment = async (
  accessToken: string,
  refreshToken: string,
  id: number
): Promise<Appointment> => {
  const response = await fetch(
    `${env.EXPO_PUBLIC_API_URL}/appointments/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${accessToken}`,
        "X-Refresh-Token": `${refreshToken}`,
      },
      credentials: "include",
      mode: "cors",
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${body.error}`);
  }

  return body.appointment;
};

export const fetchGetAllDoctors = async (
  accessToken: string,
  refreshToken: string
): Promise<Doctor[]> => {
  const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/doctors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
      "X-Refresh-Token": `${refreshToken}`,
    },
    credentials: "include",
    mode: "cors",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${body.error}`);
  }

  return body.doctors;
};

export const fetchPostCreateAppointment = async (
  accessToken: string,
  refreshToken: string,
  data: appointmentType
): Promise<Appointment> => {
  const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
      "X-Refresh-Token": `${refreshToken}`,
    },
    credentials: "include",
    body: JSON.stringify({
      doctorId: data.doctorId,
      description: data.description,
      slotId: data.slotId,
    }),
    mode: "cors",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${body.error}`);
  }

  return body.appointment as Appointment;
};

export const fetchPutUpdateAppointment = async (
  accessToken: string,
  refreshToken: string,
  data: appointmentType
): Promise<Appointment> => {
  const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/appointments`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
      "X-Refresh-Token": `${refreshToken}`,
    },
    credentials: "include",
    body: JSON.stringify({
      doctorId: data.doctorId,
      description: data.description,
      status: data.status,
      slotId: data.slotId,
    }),
    mode: "cors",
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${body.error}`);
  }

  return body.appointment as Appointment;
};

export const fetchRefreshAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const response = await fetch(`${env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Refresh-Token": `${refreshToken}`,
    },
    credentials: "include",
    mode: "cors",
  });

  const body = await response.json();
  const accessToken = response.headers.get("Authorization");

  if (!response.ok || !accessToken) {
    throw new Error(`${body.error}`);
  }

  return accessToken as string;
};
