export default {
  jwt: {
    secret: process.env.JWT_SECRET || "secret-dev",
    expiresIn: process.env.JWT_EXPIRES || "1d",
  },
};
