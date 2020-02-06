import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList
} from "react-native";
import {
  getWidth,
  getCurrentWeekData,
  getWeekDaysInitials,
  getColors,
  getDatesBetween
} from "./utils";
import PropTypes from "prop-types";
import moment from "./dateMoment";
let colors = getColors();
const MONTH_FORMAT = "MMM";
const YEAR_FORMAT_LONG = "YYYY";
const YEAR_FORMAT_SHORT = "YY";
const ITEM_WIDTH = getWidth() / 7;

class DayView extends Component {
  constructor(props) {
    super(props);
    let currentWeekData = getCurrentWeekData(props.selectedDate);
    let currentPage = 2;
    this.currentDateString = "";
    // this.state = {
    //   selectedDate: moment(props.selectedDate),
    //   today: moment(),
    //   currentWeekData,
    //   currentPage,
    //   weekStartDate: moment(props.selectedDate),
    //   weekEndDate: moment().add(7, 'days'),
    //   selectedPage: 2,
    // };

    let currentWeek = currentWeekData.slice(
      7 * currentPage,
      7 * (currentPage + 1)
    );
    let weekStartDate = currentWeek[0];
    let weekEndDate = currentWeek[currentWeek.length - 1];
    this.state = {
      selectedDate: moment(props.selectedDate),
      today: moment(),
      currentWeekData,
      currentPage,
      weekStartDate,
      weekEndDate,
      selectedPage: 2
    };
    if(props.onWeekChange) {
      props.onWeekChange(currentWeek)
    }
  }

  _onDateSelect = date => {
   
    this.setState(prevState => ({
      selectedDate: date,
      selectedPage: prevState.currentPage
    }));
    if (this.props.onDateSelect) {
      this.props.onDateSelect(date);
    }
  };

  _renderMarkedEvent = event => {
    if (event && event.length > 0) {
      return (
        <View style={styles.eventContainer}>
            <View
              style={[styles.markedEvent, { backgroundColor: colors.PRIMARY }]}
            />
        </View>
      );
    } else {
      return (<View style={styles.eventContainer}>
        <View style={styles.markedEvent}></View>
      </View>)
    }
  };

  getCurrentWeekDays = () => {
    debugger;
    const {currentWeekData,currentPage} = this.state;
    let currentWeek = currentWeekData.slice(
      7 * currentPage,
      7 * (currentPage + 1)
    );
    return currentWeek;
  }

  _renderDay = ({ item }) => {
    const { today, selectedDate, selectedPage, currentPage } = this.state;
    const { format, markedEvents } = this.props;
    const day = item;
    let dateStyle = { ...styles.dateStyle, paddingTop: 8 };
    let isSame = today.isSame(day, "day");
    let color = colors.SECONDARY_TEXT;
    let bgColor = "transparent";
    let isCurrentDate = selectedDate.isSame(day, "day");
    let weekDay = styles.weekDay;
    if (false && isSame && isCurrentDate) {
      color = colors.PRIMARY_TEXT;
      bgColor = colors.PRIMARY;
      dateStyle = {
        ...dateStyle,
        ...styles.selectedDate,
        borderBottomWidth: 0
      };
    } else if (isSame) {
      //  dateStyle = { ...dateStyle, backgroundColor: colors.PRIMARY,height:25,marginTop: 4,justifyContent: 'center', };
      color = colors.PRIMARY_TEXT;
      bgColor = colors.PRIMARY;
    } else if (isCurrentDate && currentPage == selectedPage) {
      dateStyle = {
        ...dateStyle,
        borderBottomColor: colors.PRIMARY,
        ...styles.selectedDate
      };
    }
    const enabled = this._isDateEnabled(day);

    const opacity = enabled ? 1 : 0.4;

    return (
      <TouchableOpacity
        disabled={true}
        onPress={() => this._onDateSelect(day)}
        activeOpacity={0.7}
      >
        <View style={[weekDay]}>
          <View style={[dateStyle, { opacity }]}>
            {markedEvents &&
              this._renderMarkedEvent(markedEvents[day.format(format)])}

            <Text
              style={{
                textAlign: "center",
                borderRadius: 50,
                color,
                width: 25,
                backgroundColor: bgColor,
                paddingVertical: 2,
                marginBottom: 2
              }}
            >
              {day.format("D")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _isDateEnabled = day => {
    
    let isEnabled = true;
    const { minDate = undefined, maxDate = undefined } = this.props;
    if (minDate && maxDate) {
      isEnabled = moment(day).isBetween(
        moment(minDate).subtract(1, "day"),
        moment(maxDate).add(1, "day"),
        "day"
      );
    } else {
      if (minDate) {
        isEnabled = !day.isBefore(minDate, "day");
        //isEnabled = moment(day).isBetween(minDate, maxDate,"day","[]")
      }
      if (maxDate) {
        isEnabled = !day.isAfter(maxDate, "day");
      }
    }

    return isEnabled;
  };

  _momentumEnd = event => {
    const { currentWeekData,weekStartDate } = this.state;
    const screenWidth = event.nativeEvent.layoutMeasurement.width;
    let currentPage = event.nativeEvent.contentOffset.x / screenWidth;

    let currentWeek = currentWeekData.slice(
      7 * currentPage,
      7 * (currentPage + 1)
    );
    
    if(!weekStartDate.isSame(currentWeek[0],'day')) {
      this.setState({
        currentPage,
        weekStartDate: currentWeek[0],
        weekEndDate: currentWeek[currentWeek.length - 1]
      });
      if(this.props.onWeekChange) {
        this.props.onWeekChange(currentWeek)
      }
    }
    if (event.nativeEvent.contentOffset.x < getWidth()) {
      this._loadPreviousTwoWeek();
    }
  };

  _onEndReached() {
    this._loadNextTwoWeek();
  }

  _loadNextTwoWeek = () => {
    const { maxDate } = this.props;
    const { currentWeekData } = this.state;
    let lastDay = currentWeekData[currentWeekData.length - 1];
    if (maxDate && moment(lastDay).isAfter(maxDate)) {
      return;
    }
    const dates = getDatesBetween(moment(lastDay).add(1, "day"), 14);
    this.setState({
      currentWeekData: currentWeekData.concat(dates)
    });
  };
  scrollToPage = (page, animated = true) => {
    this._calendar.scrollToIndex({ animated, index: 7 * page });
  };
  _loadPreviousTwoWeek = () => {
    const { minDate } = this.props;
    const { currentWeekData } = this.state;
    let firstDay = currentWeekData[0];
    if (minDate && moment(firstDay).isBefore(minDate)) {
      return;
    }

    const dates = getDatesBetween(moment(firstDay).subtract(14, "day"), 14);
    this.setState(
      prevState => ({
        currentWeekData: dates.concat(currentWeekData),
        currentPage: prevState.currentPage + 2,
        selectedPage: prevState.selectedPage + 2
      }),
      () => {
        this.scrollToPage(3, false);
      }
    );
  };

  _renderDayAndDate = ({ item }) => {
    
    const day = item;
    const { today, selectedDate, selectedPage, currentPage } = this.state;
    const { format, markedEvents } = this.props;
   
    
    let dateStyle = { ...styles.dateStyle, paddingTop: 8 };
    let isSame = today.isSame(day, "day");
    let color = colors.SECONDARY_TEXT;
    let bgColor = "transparent";
    let isCurrentDate = selectedDate.isSame(day, "day");
    let weekDay = styles.weekDay;
    let dayColor = colors.SECONDARY_TEXT;
    if(day.weekday()==0 || day.weekday()==6) {
      color = "#909090";
      dayColor = '#909090'
    }
    if (isSame && isCurrentDate) {
      color = colors.PRIMARY_TEXT;
      bgColor = colors.PRIMARY;
      dateStyle = {
        ...dateStyle,
        ...styles.selectedDate,
        borderBottomWidth: 2,
        borderBottomColor: colors.PRIMARY,
        backgroundColor:'transparent'
      };
    } else if (isSame) {
      color = colors.PRIMARY_TEXT;
      bgColor = colors.PRIMARY;
    } else if (isCurrentDate && currentPage == selectedPage) {
      dateStyle = {
        ...dateStyle,
        borderBottomColor: colors.PRIMARY,
        ...styles.selectedDate
      };
    }
    const enabled = this._isDateEnabled(day);

    const opacity = enabled ? 1 : 0.4;
    return (
      <TouchableOpacity
        disabled={!enabled}
        onPress={() => this._onDateSelect(day)}
        activeOpacity={0.7}
      >
        <View style={[weekDay]}>
          <View style={[dateStyle, { opacity }]}>
            <Text style={{color:dayColor}}>{day.format("dd")[0]}</Text>
            {markedEvents &&
              this._renderMarkedEvent(markedEvents[day.format(format)])}

            <Text
              style={{
                textAlign: "center",
                borderRadius: 50,
                color,
                width: 25,
                backgroundColor: bgColor,
                paddingVertical: 2,
                marginBottom: 2
              }}
            >
              {day.format("DD")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  getDateString = () => {
    const {
      weekStartDate,
      weekEndDate,
    } = this.state;
    const {pagingEnabled} = this.props;
  
    let isMonthSame = weekStartDate.isSame(weekEndDate, "month");
    let isYearSame = weekStartDate.isSame(weekEndDate, "year");
    let startMonth = weekStartDate.format(MONTH_FORMAT);
    let endMonth = weekEndDate.format(MONTH_FORMAT);
    let monthText = isMonthSame ? startMonth : startMonth + "/" + endMonth;
    let yearText = isYearSame
      ? weekStartDate.format(YEAR_FORMAT_LONG)
      : weekStartDate.format(YEAR_FORMAT_SHORT) +
        "/" +
        weekEndDate.format(YEAR_FORMAT_SHORT);
    let dateString = isYearSame
      ? monthText + " " + yearText
      : startMonth +
        " " +
        weekStartDate.format(YEAR_FORMAT_SHORT) +
        "/" +
        endMonth +
        " " +
        weekEndDate.format(YEAR_FORMAT_SHORT);
        dateString = pagingEnabled ? dateString+" Week "+weekStartDate.week():dateString;
        if(this.currentDateString!=dateString && this.props.onDateStringUpdate) {
          this.props.onDateStringUpdate(dateString)
        }
        this.currentDateString = dateString;
        return dateString;
  }
  render() {
    colors = getColors();
    const {
      startDayIndex,
      showCalendarDropdown,
      onHeaderTap,
      pagingEnabled,
      markedEvents,
      showDateHeader
    } = this.props;

    const weeks = getWeekDaysInitials(startDayIndex);
    const {
      selectedDate,
      currentWeekData,
      currentPage,
      selectedPage,
      weekStartDate,
      weekEndDate
    } = this.state;
   
   
   return (
      <View style={styles.container}>
      {showDateHeader && (<TouchableOpacity activeOpacity={0.7} onPress={onHeaderTap}>
          <View style={styles.monthHeader}>
            <Text style={[styles.monthText, { color: colors.PRIMARY }]}>
              {this.getDateString()}
            </Text>
          </View>
        </TouchableOpacity>)}
        
        {pagingEnabled ? (
          <View style={{flex:1}}>
            <View style={styles.weekContainer}>
              {weeks.map((day, i) => {
                let style = styles.weekDay;
               

                return (
                  <View style={styles.weekDay}>
                    <View style={style}>
                      <Text style={styles.dayStyle}>{day}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View>
              <FlatList
                ref={_calendar => (this._calendar = _calendar)}
                bounces={false}
                data={currentWeekData}
                horizontal
                onMomentumScrollEnd={this._momentumEnd}
                onEndReached={() => {
                  this._onEndReached();
                }}
                getItemLayout={(data, index) => ({
                  length: ITEM_WIDTH,
                  offset: ITEM_WIDTH * index,
                  index
                })}
                keyExtractor={(item, index) => index.toString()}
                scrollEventThrottle={500}
                pagingEnabled={pagingEnabled}
                onEndReachedThreshold={0.01}
                initialScrollIndex={14}
                showsHorizontalScrollIndicator={false}
                renderItem={this._renderDay}
              />
            </View>
            {this.props.renderWeekEvent && <View style={{flex:1}}>{this.props.renderWeekEvent()}</View>}
          </View>
        ) : (
          <View style={{flex:1}}>
           <View>
           <FlatList
              ref={_calendar => (this._calendar = _calendar)}
              bounces={false}
              data={currentWeekData}
              horizontal
              onMomentumScrollEnd={this._momentumEnd}
              onEndReached={() => {
                this._onEndReached();
              }}
              getItemLayout={(data, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index
              })}
              keyExtractor={(item, index) => index.toString()}
              scrollEventThrottle={500}
              pagingEnabled={pagingEnabled}
              onEndReachedThreshold={0.01}
              initialScrollIndex={14}
              showsHorizontalScrollIndicator={false}
              renderItem={this._renderDayAndDate}
            />
           </View>
           {this.props.renderDayEvent && <View style={{flex:1}}>{this.props.renderDayEvent()}</View>}

          </View>
          
        )}

      
      </View>
    );
  }
}

const dateProps = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.instanceOf(moment),
  PropTypes.instanceOf(Date),
  PropTypes.object
]);
DayView.propTypes = {
  showCalendarDropdown: PropTypes.bool,
  startDayIndex: PropTypes.number,
  format: PropTypes.string,
  minDate: dateProps,
  maxDate: dateProps,
  selectedDate: dateProps,
  pagingEnabled: PropTypes.bool,
  markedEvents: PropTypes.shape({
    [PropTypes.string]: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string
      })
    )
  })
};

DayView.defaultProps = {
  showCalendarDropdown: false,
  startDayIndex: 0,
  selectedDate: new Date(),
  markedEvents: {},
  format: "DD-MM-YYYY",
  pagingEnabled: true
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex:1
  },
  weekContainer: {
    flexDirection: "row"
  },
  weekDay: {
    width: ITEM_WIDTH,
    alignItems: "center"
  },
  dayStyle: {
    textAlign: "center"
  },
  dateStyle: {
    textAlign: "center",
    width: 25,
    borderRadius: 15,
    alignItems: "center"
  },
  monthText: {
    fontSize: 16,
    textTransform: "uppercase",
    fontFamily: "Roboto"
  },
  monthHeader: {
    paddingHorizontal: 16,
    marginVertical: 8
  },
  selectedDateCircle: {
    // padding : 5
  },
  selectedDate: {
    backgroundColor: "#00000033",
    borderBottomWidth: 3,
    borderRadius: 0,
    width: 40
  },
  markedEvent: {
    height: 5,
    width: 5,
    borderRadius: 3,
    marginLeft: 2
  },
  eventContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start"
  }
});

export default DayView;
