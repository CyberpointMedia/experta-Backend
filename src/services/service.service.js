const createResponse = require("../utils/response");
const errorMessageConstants = require("../constants/error.messages");
// const serviceService = require("../services/service.service");
const Service = require("../models/service.model");

exports.create_Service = async ({ name, parent, level, icon }) => {
  try {
    const newService = new Service({
      name,
      parent,
      level,
      icon
    });

    const savedService = await newService.save();
    return createResponse.success(savedService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message
    }));
  }
};

exports.getServicesByLevel = async (level, parentId) => {
  try {
    if (!level || ![1, 2, 3].includes(parseInt(level))) {
      return createResponse.invalid("Valid level (1, 2, or 3) is required");
    }

    const services = await Service.find({
      level: parseInt(level),
      parent: parentId || null,
      isDeleted: false
    }).select('-__v');

    return createResponse.success(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error(error.message);
  }
};

exports.getServiceById = async (id) => {
  try {
    const result = await Service.findOne({ _id: id, isDeleted: false });
    console.log(result);
    return createResponse.success(result);
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error(error.message);
  }
};

exports.updateService = async (id, { name, icon }) => {
  console.log("id", id , "name", name, "icon", icon);
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (icon) updateData.icon = icon;

    const result = await Service.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    return createResponse.success(result);
  } catch (error) {
    console.error("Error updating service:", error);
    throw new Error(error.message);
  }
};

exports.deleteService = async (id) => {
  try {
    const result = await Service.findOne({ _id: id, isDeleted: false });
    result.isDeleted = true;
    return createResponse.success(result);
  } catch (error) {
    console.error("Error deleting service:", error);
    throw new Error(error.message);
  }
};