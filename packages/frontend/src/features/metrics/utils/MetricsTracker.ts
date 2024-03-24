import { Metric } from "../types/metric";

type MetricDatePair = {
  metric: Metric;
  appendedAt: Date;
};

export class MetricsTracker {
  private metricPairs: MetricDatePair[];
  private static readonly RESET_AFTER_MILLISECOND = 2000;

  constructor() {
    this.metricPairs = [];
  }

  appendMetric(metric: Metric) {
    this.metricPairs.push({
      metric,
      appendedAt: new Date(),
    });
  }

  getMetrics(): Metric[] {
    this.truncExpiredMetrics();
    return this.metricPairs.map((pair) => pair.metric);
  }

  private truncExpiredMetrics() {
    const now = new Date();
    this.metricPairs = this.metricPairs.filter(
      (pair) =>
        now.getTime() - pair.appendedAt.getTime() <=
        MetricsTracker.RESET_AFTER_MILLISECOND,
    );
  }
}
