function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  //Loging
  console.error(`[Error] Status: ${statusCode} | Message: ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: "error",
    message: statusCode === 500 ? "Server error." : err.message,

    //In dev env send stack to client
    //TODO: In case of diffrent env name change (A).
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

export default errorHandler;
