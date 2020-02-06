import { Dimensions } from 'react-native';
import moment from './dateMoment';
import defaultColors from './colors'

let colors = defaultColors;

export const getHeight = (height = 100) => (height / 100) * Dimensions.get("window").height;

export const getWidth = (width = 100) => (width / 100) * Dimensions.get('window').width;

export const WEEK_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getMonthDays = (date) => {

  const newDate = moment(date);
  let noOfDaysInMonth = newDate.daysInMonth();
  let startDate = newDate.startOf("month");
  let days = getDatesBetween(startDate, noOfDaysInMonth);
  const dayIndex = moment().localeData().firstDayOfWeek();
  // let prevDate = startDate;
  // days.push(prevDate);
  // for (let i = 1; i < noOfDaysInMonth; i++) {
  //   let newDate = moment(prevDate).add(1, "day");
  //   days.push(newDate);
  //   prevDate = newDate;
  // }

  // debugger;
  let before = [], after = [];

  let newStartDate = days[0].clone();
  let day = newStartDate.format("d");
  if (dayIndex != day) {
    let diff = day - dayIndex;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        before.push(null)
      }
    } else {
      for (let i = 0; i < 7 + diff; i++) {
        before.push(null)
      }
    }
  }

  let daysArray = before.concat(days);
  const lessDays = daysArray.length % 7;
  if (lessDays != 0) {
    for (let i = 0; i < 7 - lessDays; i++) {
      after.push(null)
    }
  }


  daysArray = daysArray.concat(after);
  return daysArray
}

export const getAllMonths = (selectedDate, prevMonths, nextMonths) => {
  const currentMonth = getMonthDays(selectedDate);
  const date = moment(selectedDate).startOf('month');
  let prevMonthsArray = [];
  let nextMonthsArray = [];
  for (let i = 0; i < prevMonths; i++) {
    const newDate = moment(date).subtract(prevMonths - i, 'month');
    let currentMonth = getMonthDays(newDate);
    prevMonthsArray.push(currentMonth);
  }
  for (var i = 0; i < nextMonths; i++) {
    const newDate = moment(date).add(i + 1, 'month');
    let currentMonth = getMonthDays(newDate);
    nextMonthsArray.push(currentMonth);
  }

  let monthArray = [];
  monthArray = monthArray.concat(prevMonthsArray);
  monthArray.push(currentMonth);
  monthArray = monthArray.concat(nextMonthsArray)
  return monthArray
}
function isGTE(a, b) {
  return b.diffDays(a) > -1;
}

function isLTE(a, b) {
  return a.diffDays(b) > -1;
}
export const getMonthsName = () => moment.months();

export const getMonthsShort = () => moment.monthsShort();

export const getWeekDays = (indexOfDay) => moment.weekdays(true);

export const getWeekDaysShorts = (indexOfDay) => moment.weekdaysShort(true);

export const getCurrentWeekData = (currentDate, indexOfDay) => {

  let date = moment(currentDate);
  //date.locale("en")

  let startDate = date.startOf("week");
  let endDate = moment(date).endOf("week");

  const currentWeek = getDatesBetween(startDate, 7)
  const lastTwoWeeks = getDatesBetween(moment(startDate).subtract(14, 'days'), 14);
  const futureTwoWeeks = getDatesBetween(moment(endDate).add(1, 'days'), 14);
  return lastTwoWeeks.concat(currentWeek).concat(futureTwoWeeks);
}

const getYearDates = (startDate) => {
  const date = moment(startDate);
  let newDate = date.clone().startOf("year");
  const yearArray = [];
  for (var month = 0; month < 12; month++) {
    const monthArray = [];
    var noOfDaysInMonth = newDate.daysInMonth();
    monthArray = getMonthDays(newDate);
    newDate.add(1, 'month')
    // for(var i=0;i<noOfDaysInMonth;i++) {
    //   const calDate = oldDate.add(1,'day');
    //   monthArray.push(calDate);
    // }
    yearArray.push(monthArray)
  }
  return yearArray;

}
export const getCurrentYearData = (currentDate, prevYear = 0, nextYear = 0) => {
  let yearData = {};
  let date = moment(currentDate);
  // const currentYear = getDatesBetween(date.startOf("year"),daysInYear)

  for (var i = 0; i < prevYear; i++) {
    const newDate = moment(date).subtract(prevYear - i, 'year');
    yearData[newDate.format("DD-MM-YYYY")] = getYearDates(newDate)
  }
  yearData[date.format("DD-MM-YYYY")] = getYearDates(currentDate);
  for (var i = 0; i < nextYear; i++) {
    const newDate = moment(date).add(i + 1, 'year');
    yearData[newDate.format("DD-MM-YYYY")] = getYearDates(newDate)
  }
 
  return yearData;
}
export const getDatesBetween = (startDate, count) => {
  let dateArray = []
  let prevDate = moment(startDate);
  dateArray.push(prevDate);
  for (let i = 0; i < count - 1; i++) {
    let newDate = moment(prevDate).add(1, "day");
    dateArray.push(newDate);
    prevDate = newDate;
  }
  return dateArray;
}
export const getWeekDaysInitials = (indexOfDay) => {
  const weeks = moment.weekdaysShort(true);
  return weeks.map(day => day[0]);
}

const getWeekDaysInOrder = (week, indexOfDay = 0) => {

  const dayShift = indexOfDay % 7;
  let weekdays = week;
  if (dayShift) {
    weekdays = weekdays.slice(dayShift).concat(weekdays.slice(0, dayShift))
  }
  return weekdays;
}

export const setColors = colorsObj => {
  colors = colorsObj
}

export const getColors = () => colors;