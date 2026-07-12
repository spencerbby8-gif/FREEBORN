import { useEffect, useRef, useState, type RefObject } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEM = 44;
const COLUMN_H = 220;
const PAD = (COLUMN_H - ITEM) / 2;

type PickerProps = {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onClose: () => void;
  onChange: (value: string) => void;
};

export function DateOfBirthPicker({ visible, value, onClose, onChange }: PickerProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const yearRef = useRef<ScrollView>(null);
  const monthRef = useRef<ScrollView>(null);
  const dayRef = useRef<ScrollView>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = (() => {
    const list: string[] = [];
    for (let y = currentYear - 18; y >= currentYear - 100; y--) list.push(String(y));
    return list;
  })();
  const dayOptions = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const monthOptions = months.map((_, i) => String(i + 1).padStart(2, "0"));

  useEffect(() => {
    if (!visible) return;
    const [y, m, d] = /^(\d{4})-(\d{2})-(\d{2})$/.test(value) ? value.split("-") : ["", "", ""];
    setYear(y);
    setMonth(m);
    setDay(d);
  }, [visible, value]);

  useEffect(() => {
    if (!visible) return;
    const scrollTo = (ref: RefObject<ScrollView | null>, index: number) => {
      if (index >= 0) ref.current?.scrollTo({ y: index * ITEM, animated: false });
    };
    const yIdx = year ? yearOptions.indexOf(year) : -1;
    const mIdx = month ? monthOptions.indexOf(month) : -1;
    const dIdx = day ? dayOptions.indexOf(day) : -1;
    requestAnimationFrame(() => {
      scrollTo(yearRef, yIdx);
      scrollTo(monthRef, mIdx);
      scrollTo(dayRef, dIdx);
    });
  }, [visible, yearOptions, monthOptions, dayOptions, year, month, day]);

  const complete = Boolean(year && month && day);

  const handleDone = () => {
    if (!complete) return;
    onChange(`${year}-${month}-${day}`);
    onClose();
  };

  const renderColumn = (
    label: string,
    options: string[],
    selected: string,
    onSelect: (v: string) => void,
    ref: RefObject<ScrollView | null>,
    display?: (v: string) => string,
  ) => (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <View style={styles.columnBody}>
        <View style={styles.selectionBand} pointerEvents="none" />
        <ScrollView
          ref={ref}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: PAD }}
          snapToInterval={ITEM}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {options.map((option) => {
            const active = option === selected;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  const idx = options.indexOf(option);
                  if (idx >= 0) ref.current?.scrollTo({ y: idx * ITEM, animated: true });
                }}
                style={[styles.item, active && styles.itemActive]}
              >
                <Text style={[styles.itemText, active && styles.itemTextActive]}>
                  {display ? display(option) : option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text style={styles.title}>Date of birth</Text>
            <Pressable
              onPress={handleDone}
              disabled={!complete}
              style={[styles.done, !complete && styles.doneDisabled]}
            >
              <Text style={[styles.doneLabel, !complete && styles.doneLabelDisabled]}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.columns}>
            {renderColumn(
              "Month",
              monthOptions,
              month,
              (v) => setMonth(v),
              monthRef,
              (v) => months[Number(v) - 1],
            )}
            {renderColumn("Day", dayOptions, day, (v) => setDay(v), dayRef)}
            {renderColumn("Year", yearOptions, year, (v) => setYear(v), yearRef)}
          </View>

          <Text style={styles.note}>
            We use this to confirm you're 18 or older. It stays private.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(5,7,13,0.70)",
  },
  sheet: {
    backgroundColor: colors.midnight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 10,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { color: colors.pearl, fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },
  done: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.pearl,
  },
  doneDisabled: { backgroundColor: "rgba(255,255,255,0.08)" },
  doneLabel: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  doneLabelDisabled: { color: colors.mist },
  columns: { flexDirection: "row", gap: 10 },
  column: { flex: 1 },
  columnLabel: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
  },
  columnBody: { height: COLUMN_H, position: "relative" },
  selectionBand: {
    position: "absolute",
    top: PAD,
    left: 0,
    right: 0,
    height: ITEM,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(241,201,122,0.32)",
    backgroundColor: "rgba(241,201,122,0.10)",
  },
  scroll: { flex: 1 },
  item: { height: ITEM, alignItems: "center", justifyContent: "center" },
  itemActive: {},
  itemText: { color: colors.mist, fontSize: 16, fontWeight: "600" },
  itemTextActive: { color: colors.pearl, fontSize: 17, fontWeight: "900" },
  note: {
    marginTop: 14,
    color: colors.mist,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
