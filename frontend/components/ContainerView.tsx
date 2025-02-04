import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

type ContainerViewProps = ViewProps & {
  className?: string;
};

const ContainerView = ({ className, ...otherProps }: ContainerViewProps) => {
  return (
    <View
      className={cn(
        "w-full flex gap-3 flex-col justify-between items-center h-full p-10",
        className
      )}
      {...otherProps}
    />
  );
};

export default ContainerView;
