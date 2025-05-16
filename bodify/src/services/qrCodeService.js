import { getMembershipById } from './membershipService';

/**
 * Service to handle QR code related functionality
 * Note: Operates entirely on client-side
 */
class QRCodeService {
  /**
   * Create data for a membership QR code
   * @param {Object} membershipData - Membership information
   * @returns {String} - Encoded data string for QR code
   */
  static generateMembershipQRData(membershipData) {
    if (!membershipData || !membershipData.membership_id) {
      throw new Error('Invalid membership data');
    }

    // Validate membership type - only type 1 can have QR codes
    if (membershipData.membership_type !== 1) {
      throw new Error('This membership type does not support QR codes');
    }

    // Create data to encode in QR code
    const qrData = {
      type: 'membership',
      membership_id: membershipData.membership_id,
      gym_name: membershipData.gym_name,
      membership_name: membershipData.membership_name,
      membership_type: membershipData.membership_type,
      user_id: membershipData.user_id || localStorage.getItem('userId'),
      timestamp: new Date().getTime(),
      remaining_days: membershipData.remaining_days || 0
    };

    // Encode data as JSON string
    return JSON.stringify(qrData);
  }

  /**
   * Create string content for QR code
   * @param {Object} membershipData - Membership information
   * @returns {String} - Simple string to display in QR code
   */
  static generateQRString(membershipData) {
    if (!membershipData || !membershipData.membership_id) {
      return '';
    }
    
    // Validate membership type - only type 1 can have QR codes
    if (membershipData.membership_type !== 1) {
      console.error('This membership type does not support QR codes');
      return '';
    }
    
    // Format: membership:ID:REMAINING_DAYS:MEMBERSHIP_TYPE:TIMESTAMP
    return `membership:${membershipData.membership_id}:${membershipData.remaining_days}:${membershipData.membership_type}:${new Date().getTime()}`;
  }

  /**
   * Verify scanned QR code (client-side simulation)
   * @param {String} qrData - QR code data scanned
   * @returns {Promise<Object>} - Verification result
   */
  static verifyQRCode(qrData) {
    try {
      // Parse QR data
      let decodedData;
      try {
        // If qrData is JSON string
        decodedData = JSON.parse(qrData);
      } catch (e) {
        // If qrData is other format (e.g., membership:123:30:1)
        const parts = qrData.split(':');
        if (parts.length >= 4 && parts[0] === 'membership') {
          decodedData = {
            type: 'membership',
            membership_id: parts[1],
            remaining_days: parseInt(parts[2]) || 0,
            membership_type: parseInt(parts[3]) || 0,
            timestamp: parts[4] || new Date().getTime()
          };
        } else {
          throw new Error('Invalid QR code format');
        }
      }

      // Check if not a membership QR code
      if (decodedData.type !== 'membership') {
        throw new Error('QR code is not a membership');
      }

      // Check membership type - only type 1 is valid
      if (decodedData.membership_type !== 1) {
        throw new Error('This membership type does not support QR codes');
      }

      // Check remaining days
      if (decodedData.remaining_days <= 0) {
        throw new Error('Membership has expired');
      }

      // Save check-in history
      this.saveCheckInHistory(decodedData);

      // Return verification result
      return {
        success: true,
        message: 'QR code verification successful',
        membershipData: decodedData
      };
    } catch (error) {
      console.error('Error verifying QR code:', error);
      return {
        success: false,
        message: error.message || 'QR code verification failed',
        error: error
      };
    }
  }

  /**
   * Save check-in history to localStorage
   * @param {Object} membershipData - Membership data from QR code
   */
  static saveCheckInHistory(membershipData) {
    try {
      // Additional validation for membership type
      if (membershipData.membership_type !== 1) {
        console.error('This membership type does not support QR codes');
        return false;
      }
      
      // Get current check-in history from localStorage
      let checkInHistory = JSON.parse(localStorage.getItem('checkInHistory') || '[]');
      
      // Add new check-in
      checkInHistory.push({
        membership_id: membershipData.membership_id,
        timestamp: new Date().getTime(),
        membership_name: membershipData.membership_name || 'Unknown Membership',
        gym_name: membershipData.gym_name || 'Unknown Gym',
        membership_type: membershipData.membership_type,
        remaining_days: membershipData.remaining_days
      });
      
      // Limit history storage if needed
      if (checkInHistory.length > 100) {
        checkInHistory = checkInHistory.slice(-100);
      }
      
      // Save back to localStorage
      localStorage.setItem('checkInHistory', JSON.stringify(checkInHistory));
      
      return true;
    } catch (error) {
      console.error('Error saving check-in history:', error);
      return false;
    }
  }

  /**
   * Get check-in history from localStorage
   * @returns {Array} - List of check-ins
   */
  static getCheckInHistory() {
    try {
      return JSON.parse(localStorage.getItem('checkInHistory') || '[]');
    } catch (error) {
      console.error('Error reading check-in history:', error);
      return [];
    }
  }
}

export default QRCodeService; 