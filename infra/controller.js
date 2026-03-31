import { InternalServerError, MethodNotAllowedError } from "infra/errors";

function onErrorHandler(error, request, response) {
  console.log("\nErro capturado pelo onErrorHandler:");
  console.log(error);

  if (error.statusCode) {
    return response.status(error.statusCode).json(error);
  }
  const internalError = new InternalServerError({
    cause: error,
  });
  return response.status(internalError.statusCode).json(internalError);
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
