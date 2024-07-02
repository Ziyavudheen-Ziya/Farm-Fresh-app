const { format } = require("path");

const formatDate = (date, format = "MonDDYYYY") => {
  const dateObject = new Date(date);

  let options;
  if (format === "MonDDYYYY") {
    options = { day: "2-digit", month: "short", year: "numeric" };
  } else if (format === "yyyy-MM-dd") {
    options = { year: "numeric", month: "2-digit", day: "2-digit" };
  } else if (format === "YYYY-MM-DD") {
    return dateObject.toISOString().split("T")[0];
  }

  return dateObject.toLocaleDateString("en-US", options);
};

module.exports = formatDate;
