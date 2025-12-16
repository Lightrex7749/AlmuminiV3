import axios from './axiosConfig';

// Real Knowledge Service API
class ApiKnowledgeService {
  // Get all knowledge capsules
  async getCapsules(filters = {}) {
    try {
      // Map frontend filters to backend parameters
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      
      // Skip sort parameter - backend doesn't support it, just filter
      // Frontend sorting can be done on the client side if needed
      
      const response = await axios.get('/api/capsules', {
        params,
      });
      // Backend returns { data: [...], total: number, page: number, limit: number, has_more: boolean }
      // Extract the data array and wrap it to match expected format { success: true, data: [...] }
      const capsules = response.data.data || response.data.items || response.data || [];
      return { success: true, data: Array.isArray(capsules) ? capsules : [] };
    } catch (error) {
      console.error('Error fetching capsules:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get knowledge capsules (alias for getCapsules for compatibility)
  async getKnowledgeCapsules(filters = {}) {
    return this.getCapsules(filters);
  }

  // Get capsule by ID
  async getCapsuleById(capsuleId) {
    try {
      const response = await axios.get(`/api/capsules/${capsuleId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Create knowledge capsule
  async createCapsule(capsuleData) {
    try {
      const response = await axios.post('/api/capsules/create', capsuleData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update capsule
  async updateCapsule(capsuleId, capsuleData) {
    try {
      const response = await axios.put(
        `/api/capsules/${capsuleId}`,
        capsuleData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating capsule:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete capsule
  async deleteCapsule(capsuleId) {
    try {
      const response = await axios.delete(`/api/capsules/${capsuleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting capsule:', error);
      return { success: false, error: error.message };
    }
  }

  // Like capsule
  async likeCapsule(capsuleId) {
    try {
      const response = await axios.post(`/api/capsules/${capsuleId}/like`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Bookmark capsule
  async bookmarkCapsule(capsuleId) {
    try {
      const response = await axios.post(
        `/api/capsules/${capsuleId}/bookmark`
      );
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get bookmarked capsules
  async getBookmarkedCapsules() {
    try {
      const response = await axios.get('/api/capsules/my-bookmarks');
      return response.data;
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }

  // ========== ADMIN METHODS ==========

  // Toggle featured status (Admin only)
  async toggleFeatured(capsuleId) {
    try {
      const response = await axios.put(
        `/api/admin/knowledge/capsules/${capsuleId}/toggle-featured`,
        {}
      );
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all capsules with admin data (Admin only)
  async getAllCapsulesAdmin(filters = {}) {
    try {
      const response = await axios.get('/api/admin/knowledge/capsules', {
        params: filters
      });
      return response.data;
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const response = await axios.get('/api/capsules/categories');
      return response.data;
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }

  // Get all tags
  async getTags() {
    try {
      const response = await axios.get('/api/knowledge/tags');
      return response.data;
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }

  // Get personalized capsules (AI-ranked)
  async getPersonalizedCapsules(userId) {
    try {
      const response = await axios.get(`/api/capsule-ranking/personalized/${userId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }

  // Get AI insights for a specific capsule
  async getCapsuleAIInsights(capsuleId, userId) {
    try {
      const response = await axios.get(`/api/knowledge/capsules/${capsuleId}/ai-insights`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get all learning paths
  async getLearningPaths() {
    // Learning paths endpoint not yet implemented in backend
    // Return empty list without making network call
    console.warn('Learning paths not yet implemented - returning empty list');
    return { success: true, message: 'Learning paths not available', data: [] };
  }

  // Get single learning path
  async getLearningPath(pathId) {
    // Learning paths endpoint not yet implemented in backend
    console.warn('Learning paths not yet implemented');
    return { success: false, message: 'Learning path not available', data: null };
  }

  // Generate learning path based on career goal
  async generateLearningPath(targetRole, currentSkills = []) {
    // Learning paths endpoint not yet implemented in backend
    console.warn('Learning path generation not yet implemented');
    return { success: false, message: 'Learning path generation not available' };
  }

  // Track learning path progress
  async updatePathProgress(userId, pathId, capsuleId, completed) {
    // Learning paths endpoint not yet implemented in backend
    console.warn('Learning path progress tracking not yet implemented');
    return { success: false, message: 'Learning path progress tracking not available' };
  }

  // Get learning path progress
  async getPathProgress(userId, pathId) {
    // Learning paths endpoint not yet implemented in backend
    console.warn('Learning path progress retrieval not yet implemented');
    return { success: true, data: { completed_capsules: [] } };
  }

  // Unlike capsule
  async unlikeCapsule(capsuleId) {
    try {
      const response = await axios.delete(`/api/capsules/${capsuleId}/like`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new ApiKnowledgeService();
