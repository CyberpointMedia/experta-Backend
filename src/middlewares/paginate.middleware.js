// middlewares/pagination.middleware.js

exports.paginate = (model) => {
    return async (req, res, next) => {
      try {
        // Extract pagination parameters from query string
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page if not provided
  
        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;
  
        // Store pagination info on the request object to use later in the controller
        req.pagination = { page, limit, skip };
  
        // Call the next middleware or route handler
        next();
      } catch (error) {
        console.error("Pagination middleware error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error while applying pagination",
        });
      }
    };
  };
  