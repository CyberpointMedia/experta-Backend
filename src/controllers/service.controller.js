const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
const serviceService = require("../services/service.service");

exports.createService = async (req, res) => {
  try {
    const { name, parent, level, icon } = req.body;
    console.log("req.body", req.body);
    
    if (!name || !level || !icon) {
      return res.json(createResponse.invalid("Name, level and icon are required"));
    }

    if (![1, 2, 3].includes(level)) {
      return res.json(createResponse.invalid("Level must be 1, 2 or 3"));
    }

    if (level > 1 && !parent) {
      return res.json(createResponse.invalid(`Parent service is required for level ${level} service`));
    }

    const result = await serviceService.create_Service({
      name,
      parent,
      level,
      icon
    });

    res.json(result);
  } catch (error) {
    console.error("Error creating service:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.getServicesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { parentId } = req.query;

    if (!level || ![1, 2, 3].includes(parseInt(level))) {
      return res.json(createResponse.invalid("Valid level (1, 2, or 3) is required"));
    }

    const result = await serviceService.getServicesByLevel(parseInt(level), parentId);
    res.json(result);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id in controller", id);
    const result = await serviceService.getServiceById(id);
    res.json(result);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    if (!name && !icon) {
      return res.json(createResponse.invalid("At least one field to update is required"));
    }

    const result = await serviceService.updateService(id, { name, icon });
    res.json(result);
  } catch (error) {
    console.error("Error updating service:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await serviceService.deleteService(id);
    res.json(result);
  } catch (error) {
    console.error("Error deleting service:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};