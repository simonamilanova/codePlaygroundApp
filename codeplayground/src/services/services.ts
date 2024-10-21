export const makeRequest = async (
  body: object,
  requestType: string,
  pathParameter: string
) => {
  const response = await fetch(`http://localhost:3001/${pathParameter}`, {
    method: requestType,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response;
};
