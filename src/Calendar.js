import React, { Component } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import moment from './dateMoment';
import CalendarDropdown from './CalendarDropdown';
import Colors from './colors';
import DayView from './DayView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import YearView from './YearView';
import { setColors, getHeight, getColors } from './utils';
let colors = getColors();

const CALENDAR_VIEW = {
  DAY_VIEW: {
    title: 'Day',
    id: 3,
  },
  WEEK_VIEW: {
    title: 'Week',
    id: 4,
  },
  MONTH_VIEW: {
    title: 'Month',
    id: 1,
  },
  YEAR_VIEW: {
    title: 'Year',
    id: 2,
  }
};

class Calendar extends Component {
  constructor(props) {
    super(props);
    const { colors: propColors } = this.props;
    const newColors = { ...Colors, ...propColors };
    colors = newColors
    setColors(newColors);
    this.state = {
      calendarType: props.calendarType,
      showDropdown: false,
      selectedDate: props.selectedDate,
      dateString: ""
    };
    this.animValue = new Animated.Value(0)
    moment.updateLocale('en', {
      week: {
        dow: props.startDayIndex,
      },
    })
  }

  static CALENDAR_VIEW = CALENDAR_VIEW;

  _onViewChange = selectedView => {
    this.setState({
      calendarType: selectedView,
    }, () => {
      this.setState({
        dateString: this.calenderView ? this.calenderView.getDateString() : ""
      })
      if (this.props.onViewChange) {
        this.props.onViewChange(selectedView);
      }
    });
  };

  _onHeaderTap = () => {
    const { showDropdown } = this.state;
    let value = 42;
    if (showDropdown) {
      value = 0;
    }
    Animated.timing(this.animValue, {
      toValue: value,
      duration: 500
    }).start();
    this.setState(prevState => ({
      showDropdown: !prevState.showDropdown
    }))
  }

  componentDidMount() {
    const dateString = this.calenderView.getDateString();
    this.setState({
      dateString
    })
  }

  _onDateSelect = date => {
    this.setState({
      selectedDate: date
    });
    this.props.onDateSelect(date)
  }
  _renderCalendarView = () => {

    const { calendarType } = this.state;
    const {
      startDayIndex,
      currentMonth,
      showCalendarDropdown,
      renderDayComponent,
      markedEvents,
      format,
      onDateSelect,
      selectedDate,
      minDate,
      maxDate,
      pagingEnabled,
      showDateHeader,
      onWeekChange,
      renderMonthEvent,
      renderDayEvent,
      renderWeekEvent
    } = this.props;

    switch (calendarType.id) {
      case CALENDAR_VIEW.DAY_VIEW.id:
        return <DayView
          ref={dayView => this.calenderView = dayView}
          startDayIndex={startDayIndex}
          markedEvents={markedEvents}
          onDateSelect={onDateSelect}
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          onHeaderTap={this._onHeaderTap}
          pagingEnabled={false}
          format={format}
          showDateHeader={showDateHeader}
          onDateStringUpdate={this.onDateStringUpdate}
          renderDayEvent={renderDayEvent}
        />;
      case CALENDAR_VIEW.MONTH_VIEW.id:
        return (
          <MonthView
            ref={dayView => this.calenderView = dayView}
            startDayIndex={startDayIndex}
            currentMonth={currentMonth}
            showCalendarDropdown={showCalendarDropdown}
            renderDayComponent={renderDayComponent}
            markedEvents={markedEvents}
            format={format}
            onDateSelect={onDateSelect}
            selectedDate={selectedDate}
            renderMonthEvent={renderMonthEvent}
            showDateHeader={showDateHeader}
            onDateStringUpdate={this.onDateStringUpdate}
          />
        );
      case CALENDAR_VIEW.WEEK_VIEW.id:
        return <DayView
          ref={dayView => this.calenderView = dayView}
          onWeekChange={onWeekChange}
          startDayIndex={startDayIndex}
          markedEvents={markedEvents}
          onDateSelect={this.onDateSelect}
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          onHeaderTap={this._onHeaderTap}
          pagingEnabled={true}
          format={format}
          renderWeekEvent={renderWeekEvent}
          showDateHeader={showDateHeader}
          onDateStringUpdate={this.onDateStringUpdate}
        />;
      case CALENDAR_VIEW.YEAR_VIEW.id:
        return <YearView
          selectedDate={selectedDate}
        />;
      default:
        return <Text style={{ textAlign: 'center' }}>Invalid Calendar Type</Text>;
    }
  };

  onDateStringUpdate = (dateString) => {
    this.setState({ dateString })
  }
  getCurrentWeekData = () => {
    return this.calenderView.getCurrentWeekDays ? this.calenderView.getCurrentWeekDays() : [];
  }
  render() {


    const { showCalendarDropdown, calendarTypes, format } = this.props;
    const { calendarType, showDropdown, dateString } = this.state;

    moment().format(format)
    let calenderView = calendarTypes ? calendarTypes : CALENDAR_VIEW;
    // const dateString = this.calenderView ? this.calenderView.getDateString() : dateStringState;

    return (
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.9} onPress={this._onHeaderTap}>
          <View style={[styles.monthHeader, { backgroundColor: colors.PRIMARY }]}>
            <Text style={[styles.monthText, { color: colors.PRIMARY_TEXT }]}>
              {dateString}
            </Text>
          </View>
        </TouchableOpacity>
        <Animated.View style={{ height: this.animValue }}>
          {showCalendarDropdown && this.animValue && (
            <CalendarDropdown
              options={calenderView}
              calendarType={calendarType}
              onViewChange={this._onViewChange}
            />
          )}
        </Animated.View>

        <View style={{ flex: 1 }}>
          {this._renderCalendarView()}

        </View>


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
Calendar.propTypes = {
  selectedDate: dateProps,
  minDate: dateProps,
  maxDate: dateProps,
  onDayPress: PropTypes.func,
  colors: PropTypes.object,
  dayComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  format: PropTypes.string,
  calendarType: PropTypes.shape({
    [PropTypes.oneOf(Object.keys(CALENDAR_VIEW))]: {
      title: PropTypes.string,
    },
  }),
  calendarTypes: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(CALENDAR_VIEW))),
  showCalendarDropdown: PropTypes.bool,
  onViewChange: PropTypes.func,
  startDayIndex: PropTypes.number,
  currentMonth: dateProps,
  renderDayComponent: PropTypes.func,
};

Calendar.defaultProps = {
  format: 'DD-MM-YYYY',
  calendarType: CALENDAR_VIEW.MONTH_VIEW,
  showCalendarDropdown: true,
  calendarTypes: null,
  startDayIndex: 0,
  currentMonth: new Date(),
  showDateHeader: true,
  selectedDate: moment()
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  monthText: {
    fontSize: 16,
    fontFamily: "Roboto"
  },
  monthHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.PRIMARY
  },
});
export default Calendar;
