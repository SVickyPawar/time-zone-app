import React from 'react';
import ReactSlider from 'react-slider';
import '../App.css'; 
import moment from 'moment';
import { AiOutlineClose } from 'react-icons/ai';

const TimeSlider = ({ type, value, onChange, longForm, currentDate, city, country, time, onDelete }) => {
  const generateMarks = () => {
    const times = [180, 360, 540, 720, 900, 1080, 1260]; // Minutes corresponding to times excluding 12:00 AM
    return times.map((minute) => {
      const time = moment().startOf('day').add(minute, 'minutes').format('ha');
      const leftPosition = `${(minute / 1440) * 100}%`;

      const style = {
        left: leftPosition,
        transform: 'translateX(-50%)',
      };

      return (
        <div key={minute} className="mark" style={style}>
          <span className="mark-text">{time}</span>
        </div>
      );
    });
  };

  return (
    <div className='slider-box'>
      <div className='header'>
        <p className='title'>{city ? `${city}` :(type.toUpperCase() === 'LOCAL' ? 'IST' : 'UTC')}</p>
        <div className='time-div'><p className='title'>{moment(time, 'HH:mm').format('h:mm a')}</p></div>
        <div className='delete-icon' onClick={onDelete}><AiOutlineClose /></div>
      </div>
      <div className='sub-header'>
        <p className=''>{country !== '' ? country : longForm}</p>
        <p className='gmt'>{type === 'utc' ? 'GMT +0' : 'GMT +5:30'}</p>  
        <p className='date-prop'>{currentDate}</p>    
      </div>
      <div className='slider'>
        <ReactSlider
          className="horizontal-slider"
          thumbClassName="example-thumb"
          trackClassName="example-track"
          value={value}
          onChange={onChange}
          ariaLabel={[`${type} Time`]}
          renderThumb={(props) => <div {...props}></div>}
          pearling
          min={0}
          max={1439}
          step={1}
        />
        <div className="slider-marks">{generateMarks()}</div>
      </div>
    </div>
  );
};

export default TimeSlider;
