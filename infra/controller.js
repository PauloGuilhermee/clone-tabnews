import { InternalServerError, MethodNotAllowedError, ValidationError } from "infra/errors";

function onErrorHandler(error, request, response) {
  console.log("\nErro capturado pelo onErrorHandler:");
  console.log(error);

  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

  if (error.statusCode) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
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
