import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';

import {getWidth, getColors} from './utils';

const CalendarDropdown = props => {
  const {options, calendarType,onViewChange} = props;

  let optionsArray = Object.keys(options);
  let width = getWidth() / optionsArray.length;
  let colors = getColors();
  
  return (
    <View style={[styles.container, {backgroundColor: colors.PRIMARY}]}>
      {optionsArray.map(item => {
        let typeViewStyle =
          calendarType.id === options[item].id
            ? {
                ...styles.selectedTypeView,
                backgroundColor: colors.SECONDARY,
                width,
              }
            : {width};
        return (
          <TouchableOpacity activeOpacity={0.7} onPress={()=>onViewChange(options[item])}>
            <View style={typeViewStyle}>
              <Text style={[styles.typeViewText, {color: colors.PRIMARY_TEXT}]}>
                {options[item].title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: getWidth(),
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  typeViewText: {
    padding: 10,
    textAlign: 'center',
  },
  selectedTypeView: {
    borderBottomWidth : 2,
    borderColor : "#fff"
  },
});
export default CalendarDropdown;
