# react-native-multiview-calendar

Example

import Calendar from 'react-native-multiview-calendar';
const {DAY_VIEW,MONTH_VIEW,WEEK_VIEW} = Calendar.CALENDAR_VIEW;

<Calendar
              ref={calendar => (this.calendar = calendar)}
              calendarType={calendarType}
              pageEnabled={false}
              markedEvents={markedEvents}
              format={'DD/MM/YYYY'}
              selectedDate={selectedDate}
              onDateSelect={this._onDateSelect}
              renderMonthEvent={this._renderMonthEvent}
              showDateHeader={false}
              onViewChange={this._onViewChange}
              onWeekChange={this._onWeekChange}
              renderWeekEvent = {this._renderEvents}
              renderDayEvent = {this._renderEvents}
              calendarTypes={[MONTH_VIEW,WEEK_VIEW,DAY_VIEW]}
              colors={{
                PRIMARY: Colors.PRIMARY,
                SECONDARY: Colors.SECONDARY,
              }}
            />
