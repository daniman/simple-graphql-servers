export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      artificialDelay: parseInt(process.env.ARTIFICIAL_DELAY)
    })
  };
};
