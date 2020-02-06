import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  FlatList
} from "react-native";
import {
  getMonthDays,
  WEEK_SHORT,
  getColors,
  getWeekDaysShorts,
  getWidth,
  getHeight,
  getMonths,
  getAllMonths
} from "./utils";
import PropTypes from "prop-types";
import moment from "./dateMoment";
let ITEM_WIDTH = getWidth() / 7;
let colors = getColors();

class MonthView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: moment(props.selectedDate),
      currentDays: getMonthDays(props.selectedDate, props.startDayIndex),
      flatListStartIndex: 0,
      monthArray: getAllMonths(props.selectedDate, 2, 2),
      currentMonthEvent: {}
    };
    this.isCalendarShrink = new Animated.Value(0);
    this.currentDateString = "";
    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 50
    };
    colors = props.colors ? { ...getColors(), ...props.colors } : getColors();
  }

  getDateString = (selectedDate = this.state.selectedDate) => {
    const dateString = selectedDate.format("MMMM YYYY");
    if (this.currentDateString != dateString && this.props.onDateStringUpdate) {
      this.props.onDateStringUpdate(dateString);
    }
    this.currentDateString = dateString;
    return dateString;
  };
  _renderMarkedEvent = event => {
    if (event && event.length > 0) {
      return (
        <View style={styles.eventContainer}>
          {event.map(item => (
            <View
              style={[
                styles.markedEvent,
                { backgroundColor: colors.SECONDARY }
              ]}
            />
          ))}
        </View>
      );
    }
  };

  _onDateSelect = date => {
    const { markedEvents, format } = this.props;
    const { currentMonthEvent } = this.state;

    if (currentMonthEvent) {
      debugger;
      let dateString = date.format(format);
      let startIndex = Object.keys(currentMonthEvent).findIndex(
        newItem => newItem == dateString
      );
      if (startIndex == -1) {
        return;
      }
      if (this._eventList) {
        this._eventList.scrollToIndex({
          index: startIndex
        });
      } else {
        this.setState({
          flatListStartIndex: startIndex
        });
        this._shrinkCalendar(true);
        setTimeout(() => {
          this._eventList.scrollToIndex({
            index: startIndex
          });
        }, 1500);
      }
    }
    this.setState({
      selectedDate: date
    });

    if (this.props.onDateSelect) {
      this.props.onDateSelect(date);
    }
  };

  _onSwipeDown = () => {
    this._shrinkCalendar(false);
  };

  componentWillMount() {
    const touchThreshold = 50;
    const speedThreshold = 0.2;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dy, vy } = gestureState;
        if (dy > touchThreshold && vy > speedThreshold) {
          const { onSwipeDown } = this.props;
          this._onSwipeDown();
        }
        return false;
      },
      onPanResponderRelease: () => {}
    });
  }

  _shrinkCalendar = isShrink => {
    try {
      const toValue = isShrink ? 1 : 0;

      Animated.timing(this.isCalendarShrink, {
        toValue: toValue,
        duration: 500
      }).start(() => {
        this.isCalendarShrink.setValue(toValue);
        this.forceUpdate();
      });
    } catch (e) {
      alert(e);
    }
  };

  _renderDayComponent = (day, dayHeight) => {
    const height = this.isCalendarShrink.interpolate({
      inputRange: [0, 1],
      outputRange: [dayHeight, 35]
    });

    const heightStyle = { height };
    ITEM_WIDTH = getWidth() / 7;

    if (this.props.renderDayComponent) {
      if (day == null) {
        return <View style={{ width: ITEM_WIDTH }} />;
      }

      return (
        <View style={{ width: ITEM_WIDTH }}>
          {this.props.renderDayComponent(day)}
        </View>
      );
    }
    const { selectedDate } = this.state;
    const { markedEvents, format } = this.props;

    const isSame = day != null ? day.isSame(selectedDate, "day") : false;
    const style =
      day != null
        ? { ...styles.dayContainer, borderColor: "#e1e1e1" }
        : styles.dayContainer;
    const DayContainer = day == null ? View : TouchableOpacity;

    return (
      <DayContainer onPress={() => this._onDateSelect(day)} activeOpacity={0.7}>
        <Animated.View style={[style, heightStyle]}>
          <Text
            style={[
              { ...styles.dateStyle, color: colors.SECONDARY_TEXT },
              isSame
                ? {
                    ...styles.selectedDateStyle,
                    backgroundColor: colors.PRIMARY,
                    color: colors.PRIMARY_TEXT
                  }
                : {}
            ]}
          >
            {day != null ? day.format("D") : ""}
          </Text>
          {day != null &&
            markedEvents &&
            this._renderMarkedEvent(markedEvents[day.format(format)])}
        </Animated.View>
      </DayContainer>
    );
  };

  _orientationDidChange = dims => {
    this.forceUpdate();
  };

  _renderEventItem = ({ item }) => {
    const { renderMonthEvent, markedEvents } = this.props;
    const events = markedEvents[item];
    if (renderMonthEvent) {
      return renderMonthEvent({ [item]: events });
    }

    return (
      <View style={{ marginVertical: 3, padding: 8 }}>
        <Text style={{ color: colors.PRIMARY, textAlign: "center" }}>
          {item}
        </Text>
        {events.map((item, index) => {
          return (
            <View>
              <Text style={{ color: colors.SECONDARY }}>{item.type}</Text>
              <Text>{item.title}</Text>
              {index != events.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    );
  };

  _onViewableItemsChanged = ({ viewableItems, changed }) => {
    const { format } = this.props;
    const firstItem = viewableItems[0].item;
    this.setState({
      selectedDate: moment(firstItem, format)
    });
  };

  _renderMonth = ({ item }) => {
    const { showCalendarDropdown } = this.props;
    const weeks = [];
    for (var i = 0; i < item.length; i += 7) {
      weeks.push(item.slice(i, i + 7));
    }

    let dayHeight =
      (getHeight() - (showCalendarDropdown ? 135 : 95)) / weeks.length;
    return (
      <View style={styles.calendarContainer}>
        {weeks.map(week => {
          return (
            <View style={styles.weekContainer}>
              {week.map(day => {
                return this._renderDayComponent(day, dayHeight);
              })}
            </View>
          );
        })}
      </View>
    );
  };
  _onMonthChanged = ({ viewableItems }) => {
    const { markedEvents, format } = this.props;
    const monthDate = viewableItems[0].item[10];
    const allEventsArray = markedEvents ? Object.keys(markedEvents) : [];
    const eventsArray = allEventsArray.filter(item =>
      moment(item, format).isSame(monthDate, "month")
    );
    var currentMonthEvent = {};
    for (var i of eventsArray) {
      currentMonthEvent[i] = markedEvents[i];
    }

    this.setState({
      currentMonthEvent: currentMonthEvent
    });
    this.getDateString(monthDate);
  };
  _onMonthEndReached = () => {
    const { monthArray } = this.state;
    const lastMonth = monthArray[monthArray.length - 1];
    const lastDate = lastMonth[10];
    const newDate = moment(lastDate).add(1, "month");
    const dates = getMonthDays(newDate);
    monthArray.push(dates);
    this.setState({
      monthArray
    });
  };
  _onMonthMomentumEnd = event => {
    if (event.nativeEvent.contentOffset.x < getWidth()) {
      this._loadPreviousMonth();
    }
  };

  _loadPreviousMonth = () => {
    const { monthArray } = this.state;
    const firstMonth = monthArray[0];
    const firstDate = firstMonth[10];
    const newDate = moment(firstDate).subtract(1, "month");
    const dates = getMonthDays(newDate);
    let array = [];
    array.push(dates);
    array = array.concat(monthArray);

    this.setState(
      {
        monthArray: array
      },
      () => {
        this.monthList.scrollToIndex({
          animated: false,
          index: 2
        });
      }
    );
  };
  render() {
    const isCalendarShrink = this.isCalendarShrink._value == 1;
    ITEM_WIDTH = getWidth() / 7;
    const {
      selectedDate,
      flatListStartIndex,
      monthArray,
      currentMonthEvent
    } = this.state;

    const { startDayIndex, showDateHeader, markedEvents, format } = this.props;
    const eventsArray = currentMonthEvent ? Object.keys(currentMonthEvent) : [];

    return (
      <View style={styles.container}>
        {showDateHeader && (
          <TouchableOpacity activeOpacity={0.9}>
            <View
              style={[
                {
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.PRIMARY
                }
              ]}
            >
              <Text
                style={[
                  { fontSize: 16, fontFamily: "Roboto" },
                  { color: colors.PRIMARY_TEXT }
                ]}
              >
                {this.currentDateString}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.weekHeader}>
            {getWeekDaysShorts(startDayIndex).map(day => (
              <Text style={{ textAlign: "center", width: ITEM_WIDTH }}>
                {day}
              </Text>
            ))}
          </View>
          <View>
            <FlatList
              ref={monthList => (this.monthList = monthList)}
              horizontal
              pagingEnabled={true}
              data={monthArray}
              scrollEventThrottle={500}
              extraData={selectedDate}
              pageSize={1}
              onEndReachedThreshold={0.01}
              initialScrollIndex={2}
              onEndReached={this._onMonthEndReached}
              onMomentumScrollEnd={this._onMonthMomentumEnd}
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={this._onMonthChanged}
              viewabilityConfig={this.viewabilityConfig}
              renderItem={this._renderMonth}
            />
          </View>

          {isCalendarShrink && (
            <View style={{ flex: 1 }}>
              <View
                style={{ alignItems: "center" }}
                {...this._panResponder.panHandlers}
              >
                <View
                  style={{
                    height: 5,
                    borderRadius: 15,
                    width: "30%",
                    backgroundColor: "#fff",
                    marginVertical: 3
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <FlatList
                  bounces={false}
                  ref={list => (this._eventList = list)}
                  data={eventsArray}
                  initialScrollIndex={flatListStartIndex}
                  scrollEventThrottle={500}
                  renderItem={this._renderEventItem}
                  onViewableItemsChanged={this._onViewableItemsChanged}
                  viewabilityConfig={this.viewabilityConfig}
                  initialNumToRender={eventsArray.length}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // height: Dimensions.get('window').height,
    flex: 1
  },
  monthHeader: {
    backgroundColor: colors.SECONDARY,
    height: 40,
    justifyContent: "center"
  },
  monthName: {
    paddingHorizontal: 5,
    paddingLeft: 20,
    color: colors.PRIMARY_TEXT,
    fontSize: 18
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-evenly",

    alignItems: "center"
  },
  calendarContainer: {},
  weekContainer: {
    flexDirection: "row"
  },
  dayContainer: {
    width: ITEM_WIDTH
  },
  divider: {
    height: 1,
    backgroundColor: "#EBF1F8",
    marginVertical: 6,
    marginHorizontal: 8
  },
  selectedDateStyle: {
    borderRadius: 50,
    backgroundColor: colors.PRIMARY,
    color: colors.PRIMARY_TEXT,
    marginHorizontal: 15
  },
  dateStyle: {
    color: colors.SECONDARY_TEXT,
    textAlign: "center",
    paddingVertical: 4
  },
  markedEvent: {
    height: 5,
    width: 5,
    borderRadius: 3,
    marginLeft: 2,
    backgroundColor: colors.SECONDARY
  },
  eventContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start"
  }
});

MonthView.propTypes = {
  startDayIndex: PropTypes.number,
  selectedDate: PropTypes.oneOfType([Date, moment, PropTypes.string]),
  renderDayComponent: PropTypes.func,
  showCalendarDropdown: PropTypes.bool,
  format: PropTypes.string,
  markedEvents: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string
      })
    )
  )
};
MonthView.defaultProps = {
  startDayIndex: 0,
  selectedDate: new Date(),
  showCalendarDropdown: false,
  markedEvents: {},
  format: "DD-MM-YYYY"
};

export default MonthView;
