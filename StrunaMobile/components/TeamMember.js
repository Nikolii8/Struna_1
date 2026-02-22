import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// I use this in the AboutScreen to display the team members in a nice way. It takes in a name, role, and image and displays them in a circle with the name and role below it. It's a simple component but it adds a nice touch to the AboutScreen and makes it look more professional. I also use it to display the team members in the ContactScreen as well. It's a reusable component that I can use throughout the app whenever I need to display a team member.

export default function TeamMember({ name, role, image }) {
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 15, width: 100 },
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 5 },
  name: { fontWeight: 'bold', textAlign: 'center' },
  role: { textAlign: 'center' }
});
