import { useOutputDevicesState } from "../../output_devices";

export function useEnabledMpdDevice() {
  const outputDevices = useOutputDevicesState();

  return outputDevices?.filter((device) => device.isEnabled)[0];
}
