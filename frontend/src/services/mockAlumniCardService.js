import mockData from '../mockdata.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAlumniCardService = {
  // Get user's alumni card
  getMyCard: async (userId) => {
    await delay(300);
    
    const card = mockData.alumni_cards.find(c => c.user_id === userId);
    
    if (!card) {
      return {
        success: false,
        error: 'Alumni card not found. Please contact admin.'
      };
    }
    
    // Get user and profile info
    const user = mockData.users.find(u => u.id === userId);
    const profile = mockData.alumni_profiles.find(p => p.user_id === userId);
    
    return {
      success: true,
      data: {
        ...card,
        user,
        profile
      }
    };
  },

  // Generate new card (mock)
  generateCard: async (userId) => {
    await delay(600);
    
    // Create a mock card
    const user = mockData.users.find(u => u.id === userId);
    const profile = mockData.alumni_profiles.find(p => p.user_id === userId);
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const newCard = {
      id: `card-${Date.now()}`,
      user_id: userId,
      card_number: `ALM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      qr_code_data: `mock_qr_${Date.now()}`,
      issue_date: new Date().toISOString(),
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
      is_active: true,
      verification_count: 0,
      ai_validation_status: 'verified',
      ai_confidence_score: 95,
      duplicate_check_passed: true,
      signature_verified: true,
      holder_name: profile ? profile.name : user.email.split('@')[0],
      holder_email: user.email,
      role: user.role,
      profile: profile || { name: user.email.split('@')[0] }
    };
    
    // In a real mock implementation, we should add this to mockData.alumni_cards
    // But since we can't persist to the JSON file easily here, we just return it.
    // The UI will update state with this data.
    
    return {
      success: true,
      message: 'Alumni card generated successfully',
      data: newCard
    };
  },

  // Verify card by QR code or card number
  verifyCard: async (identifier) => {
    await delay(400);
    
    // Find card by card_number or qr_code_data
    const card = mockData.alumni_cards.find(c => 
      c.card_number === identifier || c.qr_code_data === identifier
    );
    
    if (!card) {
      return {
        success: false,
        error: 'Card not found or invalid',
        data: {
          verified: false,
          aiValidation: {
            duplicate_check: 'failed',
            signature_check: 'invalid',
            expiry_check: 'unknown',
            confidence_score: 0,
            validation_status: 'invalid'
          }
        }
      };
    }
    
    if (!card.is_active) {
      return {
        success: false,
        error: 'Card is not active',
        data: {
          verified: false,
          card,
          aiValidation: {
            duplicate_check: 'passed',
            signature_check: 'valid',
            expiry_check: 'inactive',
            confidence_score: card.ai_confidence_score || 0,
            validation_status: 'inactive'
          }
        }
      };
    }
    
    // Check if expired
    const expiryDate = new Date(card.expiry_date);
    const isExpired = expiryDate < new Date();
    
    if (isExpired) {
      return {
        success: false,
        error: 'Card has expired',
        data: {
          verified: false,
          card,
          aiValidation: {
            duplicate_check: card.duplicate_check_passed ? 'passed' : 'failed',
            signature_check: card.signature_verified ? 'valid' : 'invalid',
            expiry_check: 'expired',
            confidence_score: card.ai_confidence_score || 0,
            validation_status: 'expired'
          }
        }
      };
    }
    
    // Get user and profile info
    const user = mockData.users.find(u => u.id === card.user_id);
    const profile = mockData.alumni_profiles.find(p => p.user_id === card.user_id);
    
    // Create AI validation data
    const aiValidation = {
      duplicate_check: card.duplicate_check_passed ? 'passed' : 'failed',
      signature_check: card.signature_verified ? 'valid' : 'invalid',
      expiry_check: 'active',
      confidence_score: card.ai_confidence_score || 0,
      validation_status: card.ai_validation_status || 'verified',
      verification_timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      data: {
        verified: true,
        card,
        user,
        profile,
        aiValidation,
        verificationHistory: {
          total_verifications: card.verification_count || 0,
          last_verified: card.last_verified
        }
      }
    };
  },

  // Download card as image (returns URL in real app)
  downloadCard: async (cardId) => {
    await delay(500);
    
    return {
      success: true,
      message: 'Card download started',
      // In real app, this would return a blob URL or trigger download
    };
  },

  // Get verification history (admin)
  getVerificationHistory: async (filters = {}) => {
    await delay(300);
    
    let verifications = [...mockData.card_verifications];
    
    // Apply filters
    if (filters.status) {
      verifications = verifications.filter(v => v.verification_status === filters.status);
    }
    
    if (filters.method) {
      verifications = verifications.filter(v => v.verification_method === filters.method);
    }
    
    if (filters.suspicious) {
      verifications = verifications.filter(v => v.suspicious === true);
    }
    
    // Sort by timestamp descending
    verifications.sort((a, b) => new Date(b.verification_timestamp) - new Date(a.verification_timestamp));
    
    // Calculate stats
    const totalVerifications = verifications.length;
    const validVerifications = verifications.filter(v => v.verification_status === 'valid').length;
    const invalidVerifications = verifications.filter(v => v.verification_status === 'invalid').length;
    const suspiciousVerifications = verifications.filter(v => v.suspicious === true).length;
    const successRate = totalVerifications > 0 ? ((validVerifications / totalVerifications) * 100).toFixed(1) : 0;
    
    return {
      success: true,
      data: {
        verifications,
        stats: {
          total: totalVerifications,
          valid: validVerifications,
          invalid: invalidVerifications,
          suspicious: suspiciousVerifications,
          successRate: parseFloat(successRate)
        }
      }
    };
  },

  // Get verification history for a specific card
  getCardVerificationHistory: async (cardId) => {
    await delay(300);
    
    const verifications = mockData.card_verifications.filter(v => v.card_id === cardId);
    verifications.sort((a, b) => new Date(b.verification_timestamp) - new Date(a.verification_timestamp));
    
    return {
      success: true,
      data: verifications
    };
  }
};
