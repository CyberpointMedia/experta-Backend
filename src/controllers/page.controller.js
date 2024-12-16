const Page = require('../models/page.model');
const createResponse = require('../utils/response');  // Utility for consistent response
const errorMessageConstants = require('../constants/error.messages');

// Create a new page
exports.createPage = async (req, res) => {
  const { title, slug, description, seoTitle, metaDescription, allowInSearchResults, followLinks, metaRobots, breadcrumbs, canonicalURL, status } = req.body;
  try {
    if (status === 'published') {
      const existingPage = await Page.findOne({ slug, status: 'published', isDeleted: false });
      if (existingPage) {
        return res.json(createResponse.invalid('A published page with this slug already exists.'));
      }
    }
    const author = req.body.user._id;
    if (!author) {
      return res.json(createResponse.invalid('Author information is missing.'));
    }

    const newPage = new Page({
      author,
      title,
      slug,
      description,
      seoTitle,
      metaDescription,
      allowInSearchResults,
      followLinks,
      metaRobots,
      breadcrumbs,
      canonicalURL,
      status
    });

    const savedPage = await newPage.save();
    res.json({
      status: 'success',
      message: 'Page created successfully',
      data: savedPage,
    });
    } catch (error) {
    console.error(error);
    res.json(createResponse.error({
        errorCode: 500,
        errorMessage: errorMessageConstants.INTERNAL_SERVER_ERROR,
      }));
  }
};

// Get all pages
exports.getAllPages = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { status ,search } = req.query;

    const filter = { isDeleted: false };
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: new RegExp(search, "i") };
    }

    const pages = await Page.find(filter)
    .populate({
      path: 'author',
      populate: {
        path: 'roles',
        select: 'name'
      }
    })
    .skip(skip)  
      .limit(limit) 
      .exec();

      const totalItems = await Page.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit);

      const statusCounts = await Page.aggregate([
        { $match: { isDeleted: false } }, 
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const defaultStatuses = ['draft', 'published', 'trash'];
      const statusSummary = defaultStatuses.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    statusCounts.forEach(item => {
      statusSummary[item._id] = item.count;
    });
  
    if (!pages || pages.length === 0) {
      return res.json({
        status: 'success',
        message: 'No pages found',
        data: [],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
        },
        statusSummary,
      });
    }

    res.json({
      status: 'success',
      message: 'Page fetched successfully',
      data: pages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
      statusSummary,
    });
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
      errorCode: errorMessageConstants.INTERNAL_SERVER_ERROR_CODE,
      errorMessage: error.message,
    }));
  }
};

// Get a page by its slug
exports.getPageBySlug = async (req, res) => {
  const { slug } = req.params;
  const { status } = req.query;

  try {
    const filter = { slug, isDeleted: false , status: 'published' };
    if (status) {
      filter.status = status;
    }

    const page = await Page.findOne(filter)
    .populate({
      path: 'author',
      populate: {
        path: 'roles',
        select: 'name'
      }
    });
        if (!page) {
      return res.json(createResponse.invalid('Page not found.'));
    }

    res.json({
      status: 'success',
      message: 'Page fetch successfully',
      data: page,
    });  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
        errorCode: 500,
        errorMessage: errorMessageConstants.INTERNAL_SERVER_ERROR,
      }));
  }
};

// Update a page
exports.updatePage = async (req, res) => {
  const { pageId } = req.params;
  const { title, slug, description, seoTitle, metaDescription, allowInSearchResults, followLinks, metaRobots, breadcrumbs, canonicalURL , status } = req.body;

  try {
    const page = await Page.findOne({ _id: pageId , isDeleted:false });
    if (!page) {
      return res.json(createResponse.invalid('Page not found.'));
    }

    // Update the fields with the new values
    page.title = title || page.title;
    page.slug = slug || page.slug;
    page.description = description || page.description;
    page.seoTitle = seoTitle || page.seoTitle;
    page.metaDescription = metaDescription || page.metaDescription;
    page.allowInSearchResults = allowInSearchResults || page.allowInSearchResults;
    page.followLinks = followLinks || page.followLinks;
    page.metaRobots = metaRobots || page.metaRobots;
    page.breadcrumbs = breadcrumbs || page.breadcrumbs;
    page.canonicalURL = canonicalURL || page.canonicalURL;
    page.status = status ?? page.status;

    const updatedPage = await page.save();
    res.json({
      status: 'success',
      message: 'Page updated successfully',
      updatedPage
  });
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
        errorCode: 500,
        errorMessage: errorMessageConstants.INTERNAL_SERVER_ERROR,
      }));
  }
};

// Delete a page
exports.deletePage = async (req, res) => {
  const { pageId } = req.params;

  try {
    const page = await Page.findOne({ _id: pageId , isDeleted:false });
    if (!page) {
      return res.json(createResponse.invalid('Page not found.'));
    }
    page.status = "trash";
    await page.save();
    res.json(createResponse.success('Page deleted successfully.'));
  } catch (error) {
    console.error(error);
    res.json(createResponse.error({
        errorCode: 500,
        errorMessage: errorMessageConstants.INTERNAL_SERVER_ERROR,
      }));
  }
};
