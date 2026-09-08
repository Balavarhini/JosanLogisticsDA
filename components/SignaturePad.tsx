import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import { colors, radius, spacing, typography } from "@constants/theme";

export interface SignaturePadHandle {
  /** Renders the drawn signature to a local PNG file and returns its URI, or null if nothing was drawn. */
  captureAsync: () => Promise<string | null>;
  clear: () => void;
}

interface SignaturePadProps {
  onChange?: (hasSignature: boolean) => void;
  height?: number;
}

/**
 * Lightweight signature capture using PanResponder + react-native-svg — no
 * native dependency beyond svg/view-shot, so it works in Expo Go.
 * `captureAsync()` (via ref) rasterizes the strokes to a PNG for upload.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  { onChange, height = 160 },
  ref
) {
  const padRef = useRef<View>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef<string>("");
  const [, forceRender] = useState(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          forceRender((n) => n + 1);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          forceRender((n) => n + 1);
        },
        onPanResponderRelease: () => {
          setPaths((prev) => {
            const next = [...prev, currentPath.current];
            onChange?.(next.length > 0);
            return next;
          });
          currentPath.current = "";
        },
      }),
    [onChange]
  );

  const clear = () => {
    setPaths([]);
    currentPath.current = "";
    onChange?.(false);
  };

  useImperativeHandle(ref, () => ({
    clear,
    captureAsync: async () => {
      if (paths.length === 0 || !padRef.current) return null;
      try {
        return await captureRef(padRef, { format: "png", quality: 0.9 });
      } catch (e) {
        console.warn("[SignaturePad] capture failed", e);
        return null;
      }
    },
  }));

  const hasSignature = paths.length > 0;

  return (
    <View>
      <View ref={padRef} collapsable={false} style={[styles.pad, { height }]} {...panResponder.panHandlers}>
        {!hasSignature && !currentPath.current ? <Text style={styles.placeholder}>Sign here</Text> : null}
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={colors.info} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ))}
          {currentPath.current ? (
            <Path d={currentPath.current} stroke={colors.info} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ) : null}
        </Svg>
      </View>
      {hasSignature ? (
        <Text onPress={clear} style={styles.clear} accessibilityRole="button">
          Clear signature
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  pad: {
    borderRadius: radius.card - 2,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeholder: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: "600",
    color: colors.textMuted,
  },
  clear: {
    marginTop: spacing.xs,
    alignSelf: "flex-end",
    color: colors.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
});

export default SignaturePad;
