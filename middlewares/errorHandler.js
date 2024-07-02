import errorCodes from "../config/errorCodes.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = errorCodes.INTERNAL_SERVER_ERROR;
  let errorMessage = "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = errorCodes.BAD_REQUEST;
    errorMessage = err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = errorCodes.UNAUTHORIZED;
    errorMessage = "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    statusCode = errorCodes.FORBIDDEN;
    errorMessage = "Forbidden";
  } else if (err.name === "NotFound") {
    statusCode = errorCodes.NOT_FOUND;
    errorMessage = "Resource Not Found";
  }

  console.error("Error:", err);

  res.status(statusCode).json({
    message: errorMessage,
    error: err,
  });
};

export default errorHandler;
