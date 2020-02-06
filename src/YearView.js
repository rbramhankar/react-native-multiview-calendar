import React, {Component} from 'react';
import {View, Text, StyleSheet,FlatList, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {getCurrentYearData, getWidth, getWeekDaysInitials} from './utils';

import colors from './colors';
import moment from 'moment';

class YearView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: props.selectedDate,
      monthsArray: getCurrentYearData(props.selectedDate,props.prevYear,props.nextYear),
    };
  }


getDateString = () => {
  return "Year"
}
  _renderYear = ({item}) => {
    const {monthsArray} = this.state;
    const yearData = monthsArray[item];
    const weekInitials = getWeekDaysInitials();
    return (
      <View style={{flex:1}}>
        <Text style={{color:colors.PRIMARY,paddingHorizontal:8,fontSize : 18,fontWeight:'bold'}}>{yearData[8][8].format('YYYY')}</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {yearData.map(month => {
            return (
              <View style={{width: getWidth() / 3}}>
                <Text style={{textAlign:'center'}}>{month[8].format('MMM')}</Text>
                <View>

                
                <View style={{flexDirection: 'row', flexWrap: 'wrap',marginLeft:3}}>
                  {weekInitials.map(week=><Text style={{width:getWidth()/23,color:colors.SECONDARY}}>{week}</Text>)}
                  {month.map((day,index) => {
                    const isToday = moment().isSame(day,"day")
                    let style=isToday?{borderRadius: 10,backgroundColor: colors.PRIMARY,color:colors.PRIMARY_TEXT} : {}
                    style={...style,fontSize : 12}
                    return (
                      <TouchableOpacity
                        onPress={() => {}}
                        activeOpacity={0.7}>
                        <View style={{width : getWidth()/23,height:35}}>
                        <Text style={style}>{day!=null?day.format('D'):" "}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  render() {
    const {monthsArray} = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={Object.keys(monthsArray)}
          renderItem={this._renderYear}
        />
      </View>
    );
  }
}

YearView.defaultProps = {
  selectedDate: new Date(),
  prevYear : 1,
  nextYear : 1
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default YearView;
