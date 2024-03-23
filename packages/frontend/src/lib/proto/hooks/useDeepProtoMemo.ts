import { Message } from "@bufbuild/protobuf";
import { useMemo, useRef } from "react";

export function useDeepProtoMemo<T extends Message>(value?: T) {
  const prevValueRef = useRef<T | undefined>(undefined);

  const isValueChanged = !value?.equals(prevValueRef.current);

  const memorized = useMemo(() => {
    if (isValueChanged) {
      prevValueRef.current = value;
      return value;
    } else {
      return prevValueRef.current;
    }
  }, [isValueChanged, value]);

  return memorized;
}
