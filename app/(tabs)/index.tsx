import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import axios from 'axios';

// Ρύθμιση Ειδοποιήσεων
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Ουδέτερα & Ζεστά Χρώματα 
const NEUTRAL_COLORS = {
  bg: '#F9FAFB',           // Πολύ απαλό γκρι (κοντά στο λευκό)
  cardBg: '#FFFFFF',       // Καθαρό λευκό για τις κάρτες
  textPrimary: '#1F2937',  // Σκούρο γκρι (πολύ πιο ξεκούραστο από το καθαρό μαύρο)
  textSecondary: '#6B7280',// Απαλό γκρι
  accent: '#4B5563',       // Slate/Gray accent
  border: '#F3F4F6',       // Πολύ διακριτικό περίγραμμα
};

export default function AnnouncementsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ΕΠΙΣΗΜΗ CLOUD ΚΛΗΣΗ! Σύνδεση με τον ζωντανό Server μας στο Render 🚀
      const BACKEND_URL = 'https://gov-server-3yp8.onrender.com';
      const response = await axios.get(`${BACKEND_URL}/api/announcements`);
      
      const realData = response.data.map((item: any) => {
        const dateObj = new Date(item.date);
        const formattedDate = dateObj.toLocaleDateString('el-GR') + ' ' + dateObj.toLocaleTimeString('el-GR', { hour: '2-digit', minute:'2-digit' });

        return {
           id: item.link, 
           title: item.title, 
           source: item.source, 
           date: formattedDate 
        };
      });
      setData(realData);
    } catch (error) {
      console.error("Σφάλμα δικτύου:", error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    
    // Εδώ κανονικά ζητάμε το ExpoPushToken και το στέλνουμε στο Server:
    // token = (await Notifications.getExpoPushTokenAsync()).data;
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 1500);
  };

  const getIconForSource = (source: string) => {
    if (source === 'ΔΥΠΑ') return 'briefcase-outline';
    if (source === 'ΑΑΔΕ') return 'cash-outline';
    if (source === 'ΕΦΚΑ') return 'document-text-outline';
    return 'information-circle-outline';
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIconForSource(item.source) as any} size={24} color={NEUTRAL_COLORS.accent} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSource}>{item.source}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <View>
            <Text style={styles.headerSubtitle}>Επίσημες Ιστοσελίδες</Text>
            <Text style={styles.headerTitle}>Ανακοινώσεις</Text>
         </View>
         <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={24} color={NEUTRAL_COLORS.textPrimary} />
            <View style={styles.bellBadge} />
         </TouchableOpacity>
      </View>
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NEUTRAL_COLORS.accent} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.bg,
  },
  header: {
    backgroundColor: NEUTRAL_COLORS.cardBg,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.border,
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    color: NEUTRAL_COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    color: NEUTRAL_COLORS.textPrimary,
    fontSize: 28,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NEUTRAL_COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.border,
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: NEUTRAL_COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.border,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardSource: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: NEUTRAL_COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: NEUTRAL_COLORS.textSecondary,
  },
  cardTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: NEUTRAL_COLORS.textPrimary,
    lineHeight: 22,
  }
});
