import {
  type Control,
  Controller,
  type FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import ErrorText from "./ErrorText";
import FormInput from "./FormInput";
import type { updateAppointmentType } from "../schemas/appointmentSchema";
import CustomButton from "./CustomButton";
import { STATUS } from "@/constants/status";

interface UpdateAppointmentFormProps {
  errors: FieldErrors<updateAppointmentType>;
  control: Control<updateAppointmentType, any>;
  handleSubmit: UseFormHandleSubmit<updateAppointmentType, undefined>;
  onSubmit: (data: updateAppointmentType) => Promise<void>;
  submitting: boolean;
  userInfo: UserInfo | null;
  appointment: Appointment;
  error: Error | null;
}

const UpdateAppointmentForm = ({
  errors,
  control,
  handleSubmit,
  onSubmit,
  submitting,
  userInfo,
  appointment,
  error,
}: UpdateAppointmentFormProps) => {
  return (
    <>
      <View className="mb-5 w-full">
        <View>
          <Text className="text-base font-medium text-white">Doctor</Text>
          <Text className="border rounded-md px-5 py-4 border-stone-700 font-semibold text-lg text-white/50">
            {appointment.doctor.name}
          </Text>
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
        {userInfo && userInfo.role === "ADMIN" && (
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
                    <Picker.Item value="" label="Choose status" />
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
          <Text className="border rounded-md px-5 py-4 border-stone-700 font-semibold text-lg text-white/50">
            {format(new Date(appointment.slot.date), "dd-MM-yyyy HH:mm")}
          </Text>
        </View>

        <View className="mx-auto mt-3">
          <CustomButton
            title="UPDATE"
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

export default UpdateAppointmentForm;
