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
import type { appointmentType } from "../schemas/appointmentSchema";
import CustomButton from "./CustomButton";
import { STATUS } from "@/constants/status";

interface AppointmentFormProps {
  errors: FieldErrors<appointmentType>;
  control: Control<appointmentType, any>;
  handleSubmit: UseFormHandleSubmit<appointmentType, undefined>;
  onSubmit: (data: appointmentType) => Promise<void>;
  submitting: boolean;
  type: "UPDATE" | "CREATE";
  userInfo: UserInfo;
  doctors: Doctor[];
  error: Error | null;
}

const AppointmentForm = ({
  errors,
  control,
  handleSubmit,
  onSubmit,
  submitting,
  type,
  userInfo,
  doctors,
  error,
}: AppointmentFormProps) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors[0].id.toString()
  );

  return (
    <>
      <View className="mb-5 w-full">
        {error && <ErrorText title={error.message} />}
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
                  {doctors?.map((doctor) => (
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
        {userInfo.role === "ADMIN" && (
          <View>
            <Text className="text-base font-medium text-white">Status</Text>
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
                    {STATUS.map((item, index) => (
                      <Picker.Item
                        key={item + index}
                        label={item}
                        value={item}
                      />
                    ))}
                  </Picker>
                </View>
              )}
              name="status"
              rules={{ required: true }}
            />
            {errors.status && <ErrorText title={errors.status.message} />}
          </View>
        )}

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
                  {doctors
                    .find((doctor) => doctor.id.toString() === selectedDoctorId)
                    ?.slots.map((slot) => (
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
            title={type}
            onPress={handleSubmit(onSubmit)}
            isLoading={submitting}
          />
        </View>
      </View>
    </>
  );
};

export default AppointmentForm;
