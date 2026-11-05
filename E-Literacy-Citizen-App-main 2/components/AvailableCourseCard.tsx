import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from './TranslatedText';

interface AvailableCourseCardProps {
  title: string;
  duration: string;
  level: string;
  tags?: string;
  icon?: string;
  imageUrl?: string;
  onPress?: () => void;
  onEnroll?: () => void;
  type?: 'ai' | 'ml' | 'coding';
}

const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ 
  title, 
  duration, 
  level, 
  tags,
  icon,
  imageUrl,
  onPress, 
  onEnroll,
  type = 'ai' 
}) => {
  const { isDark } = useTheme();
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'ai':
        return 'brain';
      case 'ml':
        return 'code';
      case 'coding':
        return 'laptop-code';
      default:
        return 'brain';
    }
  };

  const getImageSource = () => {
    // If custom image URL is provided, use it
    if (imageUrl) {
      return { uri: imageUrl };
    }
    
    // Fallback to placeholder based on type
    switch (type) {
      case 'ai':
        return { uri: 'https://via.placeholder.com/120x80/667eea/ffffff?text=AI' };
      case 'ml':
        return { uri: 'https://via.placeholder.com/120x80/4facfe/ffffff?text=ML' };
      case 'coding':
        return { uri: 'https://via.placeholder.com/120x80/fa709a/ffffff?text=Code' };
      default:
        return { uri: 'https://via.placeholder.com/120x80/667eea/ffffff?text=Course' };
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.cardContainer, { backgroundColor: isDark ? '#313131ff' : '#fff' }]}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={getImageSource()} 
            style={styles.courseImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text>
              <FontAwesome6 name={getIcon()} size={20} color="#fff" />
            </Text>
          </View>
        </View>
        
        {/* Content Section */}
          <View style={styles.contentContainer}>
          <View style={styles.leftContent}>
            <TranslatedText style={[styles.title, isDark ? { color: '#fff' } : {}]}>{title}</TranslatedText>
            <View style={styles.courseInfo}>
                             <View style={styles.infoItem}>
                 <Text>
                   <FontAwesome6 name="clock" size={12} color="#666" />
                 </Text>
                 <TranslatedText style={styles.infoText}>{duration}</TranslatedText>
               </View>
               <View style={styles.infoItem}>
                 <Text>
                   <FontAwesome6 name="signal" size={12} color="#666" />
                 </Text>
                 <Text style={styles.infoText}>{level}</Text>
               </View>
            </View>
            {Boolean(tags) && (
              <View style={styles.tagsContainer}>
                <TranslatedText style={styles.tagsText}>{tags}</TranslatedText>
              </View>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
              <LinearGradient
                colors={['#1DACFF', '#1E90FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
              />
              <TranslatedText style={styles.viewDetailsButtonText}>View Details</TranslatedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.enrollButton} onPress={onEnroll}>
              <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
              />
              <TranslatedText style={styles.enrollButtonText}>Enroll</TranslatedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 15,
    // overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  courseImage: {
    width: '100%',
    height: '100%',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  courseInfo: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    marginTop: 4,
  },
  tagsText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '400',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  viewDetailsButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
   
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  enrollButton: {
    backgroundColor: '#E67012',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AvailableCourseCard; 