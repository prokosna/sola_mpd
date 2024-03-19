export class StringUtils {
  static displayDuration(duration: number): string {
    const days = Math.floor(duration / (60 * 60 * 24));
    let remaining = duration - days * 60 * 60 * 24;
    const hours = Math.floor(remaining / (60 * 60));
    remaining -= hours * 60 * 60;
    const minutes = Math.floor(remaining / 60);
    remaining -= minutes * 60;
    const seconds = Math.floor(remaining);

    const hoursStr = hours < 10 ? `0${hours}` : String(hours);
    const minutesStr = minutes < 10 ? `0${minutes}` : String(minutes);
    const secondsStr = seconds < 10 ? `0${seconds}` : String(seconds);

    return (
      (days ? `${days}:` : "") +
      (hours ? `${hoursStr}:` : "") +
      (minutesStr ? `${minutesStr}:` : "00:") +
      (secondsStr ? `${secondsStr}` : "00")
    );
  }
}
