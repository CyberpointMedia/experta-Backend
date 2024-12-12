const Service = require("../models/service.model");

exports.createService = async (serviceData) => {
  const service = new Service(serviceData);
  return await service.save();
};

exports.getServicesByLevel = async (level, parentId) => {
  const query = { 
    level, 
    isDeleted: false 
  };
  
  if (level === 1) {
    query.parent = null;
  } else if (parentId) {
    query.parent = parentId;
  }
  
  return await Service.find(query)
    .populate('parent')
    .sort({ createdAt: -1 });
};

exports.getServiceById = async (id) => {
  return await Service.findOne({ 
    _id: id,
    isDeleted: false 
  }).populate('parent');
};

exports.updateService = async (id, updateData) => {
  return await Service.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updateData },
    { new: true }
  );
};

exports.deleteService = async (id) => {
  return await Service.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
};

exports.hasChildren = async (id) => {
  const childrenCount = await Service.countDocuments({
    parent: id,
    isDeleted: false
  });
  return childrenCount > 0;
};