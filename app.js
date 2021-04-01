const express = require("express");
const cors = require("cors");
const DB = require("./services/DB");

const { contactsRouter } = require("./api/contacts");
const { authRouter } = require("./api/register");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/", authRouter);
require("./config/config-passport");

const port = process.env.PORT || 3000;

DB.then(() => {
  app.listen(port, () => {
    console.log(`Server running. Use our API on port: ${port}`);
  });
}).catch((err) => {
  console.log(`Server not running. Error message: ${err.message}`);
  process.exit(1);
});
