import axios from "../api/axios";

export const permissionApi = {
  listPermissions: async (params = {}) => {
    try {
      const response = await axios.get("/permission", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  },

  listRoles: async () => {
    try {
      const response = await axios.get("/roles");
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  updatePermission: async (permissionId, data) => {
    try {
      const response = await axios.put(`/permission/${permissionId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating permission ${permissionId}:`, error);
      throw error;
    }
  },

  bulkUpdatePermission: async (updates) => {
    try {
      const response = await axios.put("/permission/bulk-update-roles", {
        updates,
      });
      return response;
    } catch (error) {
      console.error("Error updating role permissions:", error);
      throw error;
    }
  },
};
