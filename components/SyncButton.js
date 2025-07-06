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
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:3000');
  const [serverStatus, setServerStatus] = useState(null);
  const [storageStats, setStorageStats] = useState(null);

  useEffect(() => {
    checkCredentials();
    loadSavedFiles();
    loadStorageStats();
  }, []);

  const checkCredentials = async () => {
    try {
      const savedCredentials = await storageManager.getCredentials();
      if (savedCredentials) {
        setHasCredentials(true);
        setCredentials(savedCredentials);
      }
    } catch (error) {
      console.error('Error checking credentials:', error);
    }
  };

  const loadSavedFiles = async () => {
    try {
      const files = await storageManager.listSavedFiles();
      setSavedFiles(files);
    } catch (error) {
      console.error('Error loading saved files:', error);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await storageManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
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

  const testConnection = async () => {
    try {
      setIsLoading(true);
      const result = await storageManager.testServerConnection(serverUrl);
      setServerStatus(result);
      
      if (result.success) {
        Alert.alert('Connection Success', `Server is reachable!\nStatus: ${result.status}`);
      } else {
        Alert.alert('Connection Failed', `Cannot reach server: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Connection Error', error.message);
    } finally {
      setIsLoading(false);
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
      
      // Step 3: Update file list and stats
      await loadSavedFiles();
      await loadStorageStats();
      
      // Step 4: Show success message with file paths
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

  const uploadToServer = async () => {
    try {
      setIsLoading(true);
      
      // First test connection
      const connectionTest = await storageManager.testServerConnection(serverUrl);
      if (!connectionTest.success) {
        throw new Error(`Cannot connect to server: ${connectionTest.error}`);
      }

      Alert.alert(
        'Upload to Server',
        `Upload all VTOP files to ${serverUrl}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: async () => {
              try {
                const results = await storageManager.uploadAllFilesToServer(serverUrl);
                
                let successCount = 0;
                let failCount = 0;
                let successFiles = [];
                let failedFiles = [];
                
                results.forEach(result => {
                  if (result.success) {
                    successCount++;
                    successFiles.push(result.filename);
                  } else {
                    failCount++;
                    failedFiles.push(`${result.filename}: ${result.error}`);
                  }
                });

                let message = `✅ ${successCount} files uploaded successfully`;
                if (successFiles.length > 0) {
                  message += `\n\nUploaded:\n${successFiles.join('\n')}`;
                }
                
                if (failCount > 0) {
                  message += `\n\n❌ ${failCount} files failed:\n${failedFiles.join('\n')}`;
                }

                Alert.alert('Upload Complete', message);
              } catch (error) {
                Alert.alert('Upload Error', error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to prepare upload: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncAndUpload = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Sync data from VTOP
      console.log('🔄 Syncing VTOP data...');
      const scrapedData = await vtopScraper.scrapeAllData();
      await storageManager.saveVTOPData(scrapedData);
      
      // Step 2: Update file list
      await loadSavedFiles();
      await loadStorageStats();
      
      // Step 3: Upload to server
      console.log('📤 Uploading to server...');
      const uploadResults = await storageManager.uploadAllFilesToServer(serverUrl);
      
      let successCount = uploadResults.filter(r => r.success).length;
      let failCount = uploadResults.filter(r => !r.success).length;
      
      Alert.alert(
        'Sync & Upload Complete! 🎉',
        `Data synced from VTOP and uploaded to server.\n\n✅ ${successCount} files uploaded\n❌ ${failCount} files failed`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Error', `Sync and upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all stored VTOP data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageManager.clearAllData();
              setSavedFiles([]);
              setStorageStats(null);
              Alert.alert('Success', 'All data cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastModified = (date) => {
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    return date.toLocaleDateString();
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

      {/* Server Configuration Section */}
      <View style={styles.serverSection}>
        <Text style={styles.sectionTitle}>Server Configuration</Text>
        <TextInput
          style={styles.input}
          placeholder="Server URL (e.g., http://192.168.1.100:3000)"
          value={serverUrl}
          onChangeText={setServerUrl}
        />
        
        <TouchableOpacity style={styles.testButton} onPress={testConnection}>
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity>
        
        {serverStatus && (
          <Text style={[styles.statusText, { color: serverStatus.success ? 'green' : 'red' }]}>
            {serverStatus.success ? '✅ Server Connected' : '❌ Server Unreachable'}
          </Text>
        )}
      </View>

      {/* Main Action Buttons */}
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

      <TouchableOpacity 
        style={styles.uploadButton} 
        onPress={uploadToServer}
        disabled={isLoading || savedFiles.length === 0}
      >
        <Text style={styles.uploadButtonText}>📤 Upload Files to Server</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.syncUploadButton} 
        onPress={syncAndUpload}
        disabled={isLoading || !hasCredentials}
      >
        <Text style={styles.syncUploadButtonText}>🔄📤 Sync & Upload</Text>
      </TouchableOpacity>

      {/* Storage Statistics */}
      {storageStats && (
        <View style={styles.storageContainer}>
          <Text style={styles.storageTitle}>Storage Usage</Text>
          <Text style={styles.storageText}>
            Total size: {storageStats.totalSizeFormatted}
          </Text>
          <Text style={styles.storageText}>
            Files: {storageStats.fileCount}
          </Text>
        </View>
      )}

      {/* Saved Files Section */}
      {savedFiles.length > 0 && (
        <View style={styles.filesSection}>
          <Text style={styles.sectionTitle}>Saved JSON Files</Text>
          {savedFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileDetails}>
                Size: {formatFileSize(file.size)} | 
                Modified: {formatLastModified(file.lastModified)}
              </Text>
              <Text style={styles.filePath} numberOfLines={2}>
                Path: {file.path}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Clear Data Button */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearData}
      >
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionText}>
          1. Enter your VTOP credentials and save them{'\n'}
          2. Configure your server URL (laptop IP address){'\n'}
          3. Test server connection before uploading{'\n'}
          4. Use "Sync VTOP Data" to scrape and save locally{'\n'}
          5. Use "Upload Files" to send to your server{'\n'}
          6. Use "Sync & Upload" for both actions together
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serverSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#fff',
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
  testButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  syncButtonDisabled: {
    backgroundColor: '#ccc',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#fd7e14',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncUploadButton: {
    backgroundColor: '#6f42c1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  syncUploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  storageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
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
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SyncButton;
