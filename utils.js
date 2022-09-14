const toCamel = (s) => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const snakeToCamel = (object) => {
  const newObj = {};
  Object.entries(object).forEach(([key, value]) => {
    newObj[toCamel(key)] =
      value instanceof Array
        ? value.map((item) => snakeToCamel(item))
        : !!value && typeof value === 'object'
        ? snakeToCamel(value)
        : value;
  });
  return newObj;
};

const awaitTimeout = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

exports.awaitTimeout = awaitTimeout;
exports.snakeToCamel = snakeToCamel;
