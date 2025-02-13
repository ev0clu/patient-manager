import {
  type Control,
  Controller,
  type FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { View, Text } from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import ErrorText from "./ErrorText";
import FormInput from "./FormInput";
import type { createAppointmentType } from "../schemas/appointmentSchema";
import CustomButton from "./CustomButton";

interface AppointmentFormProps {
  errors: FieldErrors<createAppointmentType>;
  control: Control<createAppointmentType, any>;
  handleSubmit: UseFormHandleSubmit<createAppointmentType, undefined>;
  onSubmit: (data: createAppointmentType) => Promise<void>;
  submitting: boolean;
  doctors: Doctor[];
  error: Error | null;
}

const AppointmentForm = ({
  errors,
  control,
  handleSubmit,
  onSubmit,
  submitting,
  doctors,
  error,
}: AppointmentFormProps) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  return (
    <>
      <View className="mb-5 w-full">
        <View>
          <Text className="text-base font-medium text-white">Doctor</Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="border rounded-md border-stone-700 font-semibold text-base text-white">
                <Picker
                  style={{
                    color: "#FFFFFF",
                  }}
                  selectedValue={value}
                  onValueChange={(selectedValue) => {
                    onChange(selectedValue);
                    setSelectedDoctorId(selectedValue);
                  }}
                >
                  <Picker.Item value="" label="Choose doctor" />
                  {doctors
                    ?.filter((doctor) =>
                      doctor.slots.some((slot) => slot.booked)
                    )
                    .map((doctor) => (
                      <Picker.Item
                        key={doctor.id}
                        label={doctor.name}
                        value={doctor.id}
                      />
                    ))}
                </Picker>
              </View>
            )}
            name="doctorId"
            rules={{ required: true }}
          />
          {errors.doctorId && <ErrorText title={errors.doctorId.message} />}
        </View>

        <View>
          <Text className="text-base font-medium text-white">Description</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ""}
                placeholder="description"
                multiline
                numberOfLines={4}
              />
            )}
            name="description"
            rules={{ required: false }}
          />
          {errors.description && (
            <ErrorText title={errors.description.message} />
          )}
        </View>

        <View>
          <Text className="text-base font-medium text-white">Time Slot</Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="border rounded-md border-stone-700 font-semibold text-base text-white">
                <Picker
                  style={{
                    color: "#FFFFFF",
                  }}
                  selectedValue={value}
                  onValueChange={onChange}
                >
                  <Picker.Item value="" label="Choose date" />
                  {doctors
                    .find((doctor) => doctor.id.toString() === selectedDoctorId)
                    ?.slots.filter((slot) => !slot.booked)
                    .map((slot) => (
                      <Picker.Item
                        key={slot.id}
                        label={format(new Date(slot.date), "dd-MM-yyyy HH:mm")}
                        value={slot.id}
                      />
                    ))}
                </Picker>
              </View>
            )}
            name="slotId"
            rules={{ required: true }}
          />
          {errors.slotId && <ErrorText title={errors.slotId.message} />}
        </View>

        <View className="mx-auto mt-3">
          <CustomButton
            title="CREATE"
            onPress={handleSubmit(onSubmit)}
            isLoading={submitting}
          />
        </View>
      </View>

      {error && (
        <View className="flex items-center">
          <ErrorText title={error.message} />
        </View>
      )}
    </>
  );
};

export default AppointmentForm;
