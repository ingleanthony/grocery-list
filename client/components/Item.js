import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  I18nManager,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Swipeable } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { colors } from "../other/colors.js";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../hooks/useAuth.js";

export default function Item({
  id,
  name,
  member,
  purchased,
  onPress,
  onTriggerLeftSwipe,
  onTriggerRightSwipe,
}) {
  const checkboxRef = React.useRef();
  const swipeableRef = React.useRef();
  const { authData } = useAuth();

  const onTriggerRight = () => {
    onTriggerRightSwipe(id);
  };

  const onTriggerLeft = () => {
    swipeableRef?.current.close();
    onTriggerLeftSwipe(id, member);
  };

  const renderLeftActions = (dragX) => {
    if (purchased) return;
    const trans = dragX.interpolate({
      inputRange: [-101, -100, -50, 0],
      outputRange: [1, 0, 0, -20],
    });
    return (
      <View style={styles.leftAction}>
        <Animated.Text style={[styles.actionText]}>
          {member == authData.screen_name ? "Unclaim" : "Claim"}
        </Animated.Text>
      </View>
    );
  };

  const renderRightActions = (dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-101, -100, -50, 0],
      outputRange: [1, 0, 0, -20],
    });
    return (
      <View style={styles.rightAction}>
        <Ionicons
          name="trash"
          size={24}
          color={colors.text}
          style={styles.actionIcon}
        />
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      containerStyle={styles.swipeable}
      overshootLeft={false}
      leftThreshold={100}
      onSwipeableRightWillOpen={onTriggerRight}
      friction={1.7}
      overshootFriction={4}
      onSwipeableLeftOpen={onTriggerLeft}
      useNativeAnimations={true}
    >
      <TouchableHighlight
        style={styles.touchable}
        underlayColor={colors.primary}
        activeOpacity={0.6}
        onPress={() => onPress(id, purchased)}
      >
        <View style={styles.card}>
          <BouncyCheckbox
            text={name}
            textStyle={styles.cardText}
            fillColor={colors.primary}
            iconStyle={{ borderColor: colors.primary }}
            isChecked={purchased}
            disabled={true}
            ref={checkboxRef}
          />
          {purchased ? (
            <Text style={styles.caption}>Bought by {member}</Text>
          ) : (
            member && <Text style={styles.caption}>{member} is getting...</Text>
          )}
        </View>
      </TouchableHighlight>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
    width: 340,
    borderRadius: 24,
    paddingLeft: 20,
    backgroundColor: colors.foreground,
  },
  touchable: {
    borderRadius: 24,
  },
  swipeable: {
    borderRadius: 24,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text,
  },
  leftAction: {
    flex: 1,
    backgroundColor: "#fcd703",
    justifyContent: "center",
  },
  rightAction: {
    alignItems: "center",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    backgroundColor: "#dd2c00",
    flex: 1,
    justifyContent: "flex-end",
  },
  actionText: {
    color: colors.text,
    fontSize: 16,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  actionIcon: {
    marginHorizontal: 20,
  },
  caption: {
    marginRight: 20,
    color: colors.caption,
  },
});
