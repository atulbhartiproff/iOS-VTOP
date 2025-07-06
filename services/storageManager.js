import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { FILE_PATHS } from '../utils/constants';

class StorageManager {
  constructor() {
    this.dataDirectory = FileSystem.documentDirectory + 'vtop_data/';
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    const dirInfo = await FileSystem.getInfoAsync(this.dataDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.dataDirectory, { 
        intermediates: true 
      });
    }
  }

  // Save complete VTOP data
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
}

export default new StorageManager();
