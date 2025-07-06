import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

const FILE_PATHS = {
  COMPLETE_DATA: 'vtop_complete_data.json',
  TIMETABLE: 'vtop_timetable.json',
  ATTENDANCE: 'vtop_attendance.json',
  MARKS: 'vtop_marks.json',
  PROFILE: 'vtop_profile.json'
};

class StorageManager {
  constructor() {
    this.dataDirectory = FileSystem.documentDirectory + 'vtop_data/';
    this.ensureDirectoryExists();
  }

  // Ensure data directory exists
  async ensureDirectoryExists() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.dataDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.dataDirectory, { 
          intermediates: true 
        });
        console.log('✅ Data directory created:', this.dataDirectory);
      }
    } catch (error) {
      console.error('❌ Error creating directory:', error);
    }
  }

  // Save complete VTOP data as JSON file
  async saveVTOPData(data) {
    try {
      const filePath = this.dataDirectory + FILE_PATHS.COMPLETE_DATA;
      const jsonString = JSON.stringify(data, null, 2);
      
      await FileSystem.writeAsStringAsync(filePath, jsonString);
      console.log('✅ Complete VTOP data saved to:', filePath);
      
      // Save individual sections
      await this.saveIndividualSections(data);
      
      return { success: true, filePath };
    } catch (error) {
      console.error('❌ Error saving VTOP data:', error);
      throw error;
    }
  }

  // Save individual data sections
  async saveIndividualSections(data) {
    const sections = [
      { key: 'timetable', filename: FILE_PATHS.TIMETABLE },
      { key: 'attendance', filename: FILE_PATHS.ATTENDANCE },
      { key: 'marks', filename: FILE_PATHS.MARKS },
      { key: 'studentProfile', filename: FILE_PATHS.PROFILE }
    ];

    for (const section of sections) {
      try {
        const filePath = this.dataDirectory + section.filename;
        const sectionData = data[section.key] || [];
        const jsonString = JSON.stringify(sectionData, null, 2);
        
        await FileSystem.writeAsStringAsync(filePath, jsonString);
        console.log(`✅ ${section.key} saved to: ${filePath}`);
      } catch (error) {
        console.error(`❌ Error saving ${section.key}:`, error);
      }
    }
  }

  // Load complete VTOP data
  async loadVTOPData() {
    try {
      const filePath = this.dataDirectory + FILE_PATHS.COMPLETE_DATA;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        return null;
      }
      
      const jsonString = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('❌ Error loading VTOP data:', error);
      return null;
    }
  }

  // Load individual data sections
  async loadDataSection(sectionName) {
    try {
      const filePath = this.dataDirectory + FILE_PATHS[sectionName.toUpperCase()];
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        return null;
      }
      
      const jsonString = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`❌ Error loading ${sectionName} data:`, error);
      return null;
    }
  }

  // Get file paths for manual inspection
  async getFilePaths() {
    const paths = {};
    for (const [key, filename] of Object.entries(FILE_PATHS)) {
      paths[key] = this.dataDirectory + filename;
    }
    return paths;
  }

  // Save credentials securely
  async saveCredentials(username, password) {
    try {
      await SecureStore.setItemAsync('vtop_username', username);
      await SecureStore.setItemAsync('vtop_password', password);
      console.log('✅ Credentials saved securely');
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving credentials:', error);
      throw error;
    }
  }

  // Get credentials
  async getCredentials() {
    try {
      const username = await SecureStore.getItemAsync('vtop_username');
      const password = await SecureStore.getItemAsync('vtop_password');
      
      if (username && password) {
        return { username, password };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting credentials:', error);
      return null;
    }
  }

  // Direct HTTPS upload using FileSystem.uploadAsync
  async uploadFileToServer(filename, serverUrl = 'http://192.168.1.100:3000') {
    try {
      const filePath = this.dataDirectory + filename;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        throw new Error(`File ${filename} not found`);
      }

      console.log(`📤 Uploading ${filename} to ${serverUrl}...`);

      const uploadResult = await FileSystem.uploadAsync(
        `${serverUrl}/upload-vtop`,
        filePath,
        {
          fieldName: 'vtopFile',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      console.log('✅ Upload successful:', uploadResult);
      
      // Parse the response
      const response = JSON.parse(uploadResult.body);
      return { 
        success: true, 
        response,
        status: uploadResult.status 
      };
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  // Upload all VTOP files sequentially
  async uploadAllFilesToServer(serverUrl = 'http://192.168.1.100:3000') {
    const filesToUpload = [
      'vtop_complete_data.json',
      'vtop_timetable.json',
      'vtop_attendance.json',
      'vtop_marks.json',
      'vtop_profile.json'
    ];

    const results = [];
    
    for (const filename of filesToUpload) {
      try {
        const result = await this.uploadFileToServer(filename, serverUrl);
        results.push({ 
          filename, 
          success: true, 
          result: result.response,
          status: result.status 
        });
        
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({ 
          filename, 
          success: false, 
          error: error.message 
        });
      }
    }

    return results;
  }

  // Test server connection
  async testServerConnection(serverUrl = 'http://192.168.1.100:3000') {
    try {
      const response = await fetch(`${serverUrl}/health`);
      const data = await response.json();
      return { 
        success: true, 
        status: response.status,
        data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // List all saved files
  async listSavedFiles() {
    try {
      const files = await FileSystem.readDirectoryAsync(this.dataDirectory);
      const fileDetails = [];
      
      for (const file of files) {
        const filePath = this.dataDirectory + file;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        fileDetails.push({
          name: file,
          path: filePath,
          size: fileInfo.size,
          lastModified: new Date(fileInfo.modificationTime * 1000)
        });
      }
      
      return fileDetails;
    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }

  // Data validation and integrity checks
  async validateStoredData() {
    try {
      const data = await this.loadVTOPData();
      if (!data) return { valid: false, reason: 'No data found' };
      
      // Check required fields
      const requiredFields = ['metadata', 'studentProfile', 'timetable', 'attendance', 'marks'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return { valid: false, reason: `Missing ${field}` };
        }
      }
      
      // Check data freshness (older than 7 days)
      const lastSync = new Date(data.metadata.syncTimestamp);
      const daysSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceSync > 7) {
        return { valid: true, stale: true, daysSinceSync };
      }
      
      return { valid: true, stale: false };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  // Clear all stored data
  async clearAllData() {
    try {
      // Remove file system data
      const dirInfo = await FileSystem.getInfoAsync(this.dataDirectory);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.dataDirectory);
      }
      
      console.log('✅ All data cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  // Get storage usage statistics
  async getStorageStats() {
    try {
      const files = await FileSystem.readDirectoryAsync(this.dataDirectory);
      let totalSize = 0;
      const fileStats = {};
      
      for (const file of files) {
        const filePath = this.dataDirectory + file;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          fileStats[file] = {
            size: fileInfo.size,
            lastModified: new Date(fileInfo.modificationTime * 1000)
          };
          totalSize += fileInfo.size;
        }
      }
      
      return {
        totalSize,
        fileCount: files.length,
        files: fileStats,
        totalSizeFormatted: this.formatBytes(totalSize)
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return null;
    }
  }

  // Format bytes utility
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new StorageManager();
