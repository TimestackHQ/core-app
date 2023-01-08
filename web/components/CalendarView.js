import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'


const localizer = momentLocalizer(moment)

const MyCalendar = (props) => (
	<div>
		<Calendar
			localizer={localizer}
			// startAccessor="start"
			// endAccessor="end"
			defaultView={"week"}
			// toolbar={false}
			style={{ height: 500 }}
		/>
	</div>
)

export default MyCalendar