import { InternalServerError, MethodNotAllowedError, NotFoundError, ValidationError, UnauthorizedError } from "infra/errors";

function onErrorHandler(error, request, response) {
  console.log("\n------------------------------------------");
  console.log("\nErro capturado pelo onErrorHandler:");
  console.log({
    url: request.url,
    method: request.method,
    name: error.name,
    message: error.message,
    action: error.action,
    statusCode: error.statusCode,
    cause: error.cause?.message,
    stack: error.stack,
  });

  if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) {
    return response.status(error.statusCode).json(error);
  }

  if (error.statusCode) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
