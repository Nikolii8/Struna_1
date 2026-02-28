import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfilePage({ route, navigation }) {
  const { userId } = route.params;

  const [avatar, setAvatar] = useState(require('../assets/avatar.png'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`http://192.168.1.2:5000/users/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Failed to load user");
        return;
      }

      setName(data.name);
      setEmail(data.email);

      if (data.profile_pic) {
        setAvatar({ uri: `http://192.168.1.2:5000/uploads/${data.profile_pic}?t=${new Date().getTime()}` });
      }
    } catch (err) {
      console.log('Fetch user error:', err);
      Alert.alert('Error', 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  const changeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;

      setAvatar({ uri: `${localUri}?t=${new Date().getTime()}` });

      const formData = new FormData();
      formData.append('profile_pic', {
        uri: localUri,
        name: localUri.split('/').pop(),
        type: 'image/jpeg'
      });

      try {
        const res = await fetch(`http://192.168.1.2:5000/users/${userId}/avatar`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!data.success) {
          Alert.alert('Error', 'Failed to upload avatar.');
        } else {
          setAvatar({ uri: `http://192.168.1.2:5000/uploads/${data.filename}?t=${new Date().getTime()}` });
        }

      } catch (err) {
        console.log('Upload error:', err);
        Alert.alert('Error', 'Failed to upload avatar.');
      }
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#33ce7d" />;
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Image source={avatar} style={styles.avatar} />
          <TouchableOpacity style={styles.changeButton} onPress={changeAvatar}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{name}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION MENU */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Angle', { userId })}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Posture</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile', { userId })}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fafbfc'
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 120
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#33ce7d'
  },

  changeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#33ce7d',
    borderRadius: 30
  },

  changeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14
  },

  infoContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20
  },

  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 20
  },

  value: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    color: '#111'
  },

  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    paddingBottom: 24
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12
  },

  navIcon: {
    fontSize: 32,
    marginBottom: 8
  },

  navLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    letterSpacing: -0.2
  }
});