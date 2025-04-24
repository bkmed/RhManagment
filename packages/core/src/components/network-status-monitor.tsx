"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Animated, Platform } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { useDispatch, useSelector } from "react-redux"
import { setNetworkStatus } from "../redux/slices/networkSlice"
import type { RootState } from "../redux/store"
import { Wifi, WifiOff } from "lucide-react-native"

export const NetworkStatusMonitor = () => {
  const dispatch = useDispatch()
  const { isConnected } = useSelector((state: RootState) => state.network)
  const opacity = new Animated.Value(0)

  useEffect(() => {
    // Initial check
    NetInfo.fetch().then((state) => {
      dispatch(
        setNetworkStatus({
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable ?? false,
          connectionType: state.type,
          details: state.details,
        }),
      )
    })

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(
        setNetworkStatus({
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable ?? false,
          connectionType: state.type,
          details: state.details,
        }),
      )
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch])

  useEffect(() => {
    if (!isConnected) {
      // Show the banner when offline
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(5000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Hide the banner when back online
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isConnected, opacity])

  if (Platform.OS === "web") {
    // For web, we'll use a different approach since NetInfo might not work well
    return null
  }

  return (
    <Animated.View style={[styles.container, { opacity }, isConnected ? styles.online : styles.offline]}>
      <View style={styles.content}>
        {isConnected ? <Wifi size={20} color="#fff" /> : <WifiOff size={20} color="#fff" />}
        <Text style={styles.text}>{isConnected ? "Back Online" : "No Internet Connection"}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  offline: {
    backgroundColor: "#e53e3e",
  },
  online: {
    backgroundColor: "#38a169",
  },
  text: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
})
