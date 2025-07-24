// const { JWT_SECRET = process.env.JWT_SECRET || '256-bit-secret-key' } = process.env;

const { JWT_SECRET = '256-bit-secret-key' } = process.env;

module.exports = { JWT_SECRET };