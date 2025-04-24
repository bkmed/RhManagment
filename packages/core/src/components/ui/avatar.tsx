import { View, Text, StyleSheet, Image } from "react-native"

interface AvatarProps {
  src?: string
  initials?: string
  size?: "sm" | "md" | "lg"
  style?: any
}

export const Avatar = ({ src, initials, size = "md", style }: AvatarProps) => {
  const avatarSize = size === "sm" ? 32 : size === "lg" ? 64 : 40
  const fontSize = size === "sm" ? 12 : size === "lg" ? 20 : 16

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }, style]}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={[styles.image, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
          <Text style={[styles.placeholderText, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: "#0070f3",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontWeight: "bold",
  },
})
