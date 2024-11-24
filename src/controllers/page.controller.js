const Page = require('../models/page.model');
const createResponse = require('../utils/response');  // Utility for consistent response
const errorMessageConstants = require('../constants/error.messages');

// Create a new page
exports.createPage = async (req, res) => {
  const { title, slug, description, seoTitle, metaDescription, allowInSearchResults, followLinks, metaRobots, breadcrumbs, canonicalURL } = req.body;

  try {
    const existingPage = await Page.findOne({ slug , isDeleted:false });
    if (existingPage) {
      return res.json(createResponse.invalid('Page with this slug already exists.'));
    }

    const newPage = new Page({
      title,
      slug,
      description,
      seoTitle,
      metaDescription,
      allowInSearchResults,
      followLinks,
      metaRobots,
      breadcrumbs,
      canonicalURL
    });

    const savedPage = await newPage.save();
    res.json(createResponse.success('Page created successfully', savedPage));
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

    const pages = await Page.find({ isDeleted: false })
      .skip(skip)  
      .limit(limit) 
      .exec();

    const totalPages = Math.ceil(await Page.countDocuments({ isDeleted: false }) / limit);

    if (!pages || pages.length === 0) {
      return res.json(createResponse.success([], "No pages found"));
    }

    res.json(createResponse.success('Pages fetched successfully', {
      pages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: await Page.countDocuments({ isDeleted: false }),
      }
    }));
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

  try {
    const page = await Page.findOne({ slug , isDeleted:false });
    if (!page) {
      return res.json(createResponse.invalid('Page not found.'));
    }
    res.json(createResponse.success('Page fetched successfully', page));
  } catch (error) {
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
  const { title, slug, description, seoTitle, metaDescription, allowInSearchResults, followLinks, metaRobots, breadcrumbs, canonicalURL } = req.body;

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

    const updatedPage = await page.save();
    res.json(createResponse.success('Page updated successfully', updatedPage));
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
    page.isDeleted = true;
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
