import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import TranslatedText from './TranslatedText';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CourseCardProps {
  title: string;
  progress?: number;
  onPress?: () => void;
  onResume?: () => void;
  type?: 'ai' | 'ml' | 'coding';
  imageUrl?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  progress = 0, 
  onPress, 
  onResume,
  type = 'ai',
  imageUrl
}) => {
  const { isDark } = useTheme();
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

  const getIcon = () => {
    switch (type) {
      case 'ai':
        return 'computer';
      case 'ml':
        return 'lock';
      case 'coding':
        return 'laptop-code';
      default:
        return 'brain';
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
            <Text style={[styles.title, isDark ? { color: '#fff' } : {}]}>{title}</Text>
            {progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
            <LinearGradient
              colors={['#FF9800', '#FF6D00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
            />
            <TranslatedText style={styles.resumeButtonText}>Resume</TranslatedText>
          </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    alignItems: 'center',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E67012',
    borderRadius: 2,
  },
  progressText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#E67012',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CourseCard; 