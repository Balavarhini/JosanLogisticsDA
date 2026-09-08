import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { TripStatus, TRIP_STATUS_FLOW } from "@/types/trip";
import { getTripStatusPresentation, getTripStatusStepIndex } from "@utils/tripStatus";

interface TripProgressTrackerProps {
  status: TripStatus;
}

/** Horizontal step tracker for the 8-stage trip workflow, used on Trip Details / Active Shipment. */
export function TripProgressTracker({ status }: TripProgressTrackerProps) {
  const currentIndex = getTripStatusStepIndex(status);

  if (currentIndex === -1) {
    const { label, color, softColor } = getTripStatusPresentation(status);
    return (
      <View style={[styles.terminalWrap, { backgroundColor: softColor }]}>
        <Text style={[styles.terminalText, { color }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {TRIP_STATUS_FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === TRIP_STATUS_FLOW.length - 1;
        const { label } = getTripStatusPresentation(step);
        return (
          <View key={step} style={styles.stepWrap}>
            <View style={styles.stepColumn}>
              <View style={[styles.node, done && styles.nodeDone]} />
              {!isLast ? <View style={[styles.connector, index < currentIndex && styles.connectorDone]} /> : null}
            </View>
            {index === currentIndex ? (
              <Text style={styles.currentLabel} numberOfLines={1}>
                {label}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepWrap: {
    flex: 1,
    alignItems: "center",
  },
  stepColumn: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginLeft: -6,
  },
  nodeDone: {
    backgroundColor: colors.primary,
  },
  connector: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
  },
  connectorDone: {
    backgroundColor: colors.primary,
  },
  currentLabel: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  terminalWrap: {
    borderRadius: 12,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  terminalText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "700",
  },
});

export default TripProgressTracker;
