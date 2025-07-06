import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import storageManager from '../services/storageManager';
import vtopScraper from '../services/vtopScraper';

const SyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    checkCredentials();
    loadSavedFiles();
  }, []);

  const checkCredentials = async () => {
    const savedCredentials = await storageManager.getCredentials();
    if (savedCredentials) {
      setHasCredentials(true);
      setCredentials(savedCredentials);
    }
  };

  const loadSavedFiles = async () => {
    const files = await storageManager.listSavedFiles();
    setSavedFiles(files);
  };

  const saveCredentials = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      await storageManager.saveCredentials(credentials.username, credentials.password);
      setHasCredentials(true);
      Alert.alert('Success', 'Credentials saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save credentials');
    }
  };

  const handleSync = async () => {
    if (!hasCredentials) {
      Alert.alert('Error', 'Please save your VTOP credentials first');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Starting sync process...');
      
      // Step 1: Scrape data from VTOP
      const scrapedData = await vtopScraper.scrapeAllData();
      
      // Step 2: Save to JSON files
      await storageManager.saveVTOPData(scrapedData);
      
      // Step 3: Update file list
      await loadSavedFiles();
      
      // Step 4: Show file paths for manual inspection
      const filePaths = await storageManager.getFilePaths();
      
      let pathsMessage = 'Data saved to:\n\n';
      Object.entries(filePaths).forEach(([key, path]) => {
        pathsMessage += `${key}: ${path}\n`;
      });
      
      Alert.alert(
        'Sync Successful! 🎉',
        `${pathsMessage}\n\nYou can now manually inspect these JSON files.`,
        [{ text: 'OK' }]
      );
      
      console.log('✅ Sync completed successfully');
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      Alert.alert(
        'Sync Failed',
        `Error: ${error.message}\n\nPlease check your credentials and internet connection.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>VTOP Data Sync</Text>
      
      {/* Credentials Section */}
      {!hasCredentials && (
        <View style={styles.credentialsSection}>
          <Text style={styles.sectionTitle}>Enter VTOP Credentials</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={credentials.username}
            onChangeText={(text) => setCredentials({...credentials, username: text})}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={credentials.password}
            onChangeText={(text) => setCredentials({...credentials, password: text})}
            secureTextEntry
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveCredentials}>
            <Text style={styles.saveButtonText}>Save Credentials</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sync Button */}
      <TouchableOpacity
        style={[styles.syncButton, isLoading && styles.syncButtonDisabled]}
        onPress={handleSync}
        disabled={isLoading || !hasCredentials}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.syncButtonText}>Syncing...</Text>
          </View>
        ) : (
          <Text style={styles.syncButtonText}>
            {hasCredentials ? 'Sync VTOP Data' : 'Save Credentials First'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Saved Files Section */}
      {savedFiles.length > 0 && (
        <View style={styles.filesSection}>
          <Text style={styles.sectionTitle}>Saved JSON Files</Text>
          {savedFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileDetails}>
                Size: {formatFileSize(file.size)} | 
                Modified: {file.lastModified.toLocaleString()}
              </Text>
              <Text style={styles.filePath} numberOfLines={2}>
                Path: {file.path}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionText}>
          1. Enter your VTOP credentials and save them{'\n'}
          2. Tap "Sync VTOP Data" to scrape and save data{'\n'}
          3. Check the file paths shown above to manually inspect JSON files{'\n'}
          4. Files are saved in your app's document directory
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  credentialsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filesSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  fileItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filePath: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  instructionsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SyncButton;
