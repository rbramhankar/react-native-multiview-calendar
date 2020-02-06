import moment from "moment";

// function momentObj() {

//   return moment;

// }

let localeFormat;
moment.locale("en")

locale = locale => moment.locale(locale);

updateLocale = (locale,obj) => {
  moment.updateLocale(locale,obj)
}

format = format => {
  localeFormat = format
  moment(format)
}

export default moment;
