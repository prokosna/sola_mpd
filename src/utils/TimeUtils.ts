import dayjs from "dayjs";

export class TimeUtils {
  static sleep(msec: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }

  static convertDateToString(date: Date | undefined): string {
    if (date === undefined) {
      return "";
    }
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  }
}
