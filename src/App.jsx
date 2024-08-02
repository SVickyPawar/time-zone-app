import { useState, useEffect } from 'react';
import './App.css';
import { PiCalendarPlusLight } from "react-icons/pi";
import { GrLink } from "react-icons/gr";
import { LuArrowUpDown } from "react-icons/lu";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import moment from 'moment';
import TimeSlider from './components/TimeSlider';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableItem = ({ item, index, moveItem, children }) => {
  const [, ref] = useDrag({
    type: 'ITEM',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'ITEM',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="draggable-item">
      {children}
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [date, setDate] = useState(moment().format('MMM D, YYYY'));

  const [times, setTimes] = useState({
    local: moment().format('hh:mm'),
    utc: moment().utc().format('hh:mm'),
  });

  const [sliderValues, setSliderValues] = useState({
    local: moment().hours() * 60 + moment().minutes(),
    utc: moment().utc().hours() * 60 + moment().utc().minutes(),
  });

  const [timeSettings, setTimeSettings] = useState([
    { id: '1', city: '', country: '', type: 'local' },
    { id: '2', city: '', country: '', type: 'utc' }
  ]);

  const [linkVisible, setLinkVisible] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const setInitialTimes = () => {
      const now = moment();
      const nowUtc = now.clone().utc();

      setTimes({
        local: now.format('hh:mm'),
        utc: nowUtc.format('hh:mm'),
      });
      setSliderValues({
        local: now.hours() * 60 + now.minutes(),
        utc: nowUtc.hours() * 60 + nowUtc.minutes(),
      });
    };

    setInitialTimes();

    const interval = setInterval(() => {
      setInitialTimes();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSliderChange = (type) => (value) => {
    if (type === 'local') {
      const newTime = moment().startOf('day').add(value, 'minutes');
      setTimes({
        ...times,
        local: newTime.format('hh:mm'),
        utc: newTime.clone().utc().format('hh:mm'),
      });
      setSliderValues({
        ...sliderValues,
        local: value,
        utc: newTime.clone().utc().hours() * 60 + newTime.clone().utc().minutes(),
      });
    } else if (type === 'utc') {
      const newTime = moment.utc().startOf('day').add(value, 'minutes');
      setTimes({
        ...times,
        utc: newTime.format('hh:mm'),
        local: newTime.clone().local().format('hh:mm'),
      });
      setSliderValues({
        ...sliderValues,
        utc: value,
        local: newTime.clone().local().hours() * 60 + newTime.clone().local().minutes(),
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDelete = (index) => {
    setTimeSettings((prevSettings) => prevSettings.filter((_, i) => i !== index));
  };

  const handleCityChange = (e) => {
    const [selectedCity, selectedCountry] = e.target.value.split(',');
    if (selectedCity && selectedCountry) {
      setTimeSettings((prevSettings) => [
        ...prevSettings,
        { id: `${prevSettings.length + 1}`, city: selectedCity.trim(), country: selectedCountry.trim(), type: 'local' }
      ]);
      setSelectedCity(e.target.value); // Update selected city value
    }
  };

  const moveItem = (fromIndex, toIndex) => {
    const updatedSettings = Array.from(timeSettings);
    const [movedItem] = updatedSettings.splice(fromIndex, 1);
    updatedSettings.splice(toIndex, 0, movedItem);
    setTimeSettings(updatedSettings);
  };

  const reverseArray = () => {
    setTimeSettings((prevSettings) => [...prevSettings].reverse());
  };

  const generateShareableLink = () => {
    const baseUrl = window.location.origin; 
    const formattedDate = moment(date, 'MMM D, YYYY').format('YYYY-MM-DD');
    const timezoneInfo = timeSettings.map(setting => `${setting.city}, ${setting.country} (${setting.type})`).join('; ');
    const link = `${baseUrl}/share?date=${formattedDate}&timezone=${encodeURIComponent(timezoneInfo)}`;
    setShareableLink(link);
    setLinkVisible(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setLinkVisible(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`outer-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <h2>Time-Zone App</h2>
        <div className='inner-container'>
          <div className='top-box'>
            <select
              name="Select a city"
              className='city-tag'
              value={selectedCity}
              onChange={handleCityChange}
            >
              <option value="" disabled>Add Time-Zone, City or Town</option>
              <option value="Mumbai, India">Mumbai, India</option>
              <option value="Delhi, India">Delhi, India</option>
              <option value="Hyderabad, India">Hyderabad, India</option>
              <option value="Bengaluru, India">Bengaluru, India</option>
              <option value="Chennai, India">Chennai, India</option>
            </select>

            <input
              className='calender'
              type="date"
              value={moment(date, 'MMM D, YYYY').format('YYYY-MM-DD')}
              onChange={(e) => setDate(moment(e.target.value).format('MMM D, YYYY'))}
            />

            <div className='links'>
              <div className='icon'><PiCalendarPlusLight /></div>
              <div className='icon' onClick={reverseArray}><LuArrowUpDown /></div>
              <div className='icon' onClick={generateShareableLink}><GrLink /></div>
              <div className='icon' onClick={toggleTheme}>
                {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
              </div>
            </div>
          </div>

          {linkVisible && (
            <div className='shareable-link'>
              <input
                type="text"
                readOnly
                value={shareableLink}
                className='link-input'
              />
              <button onClick={copyToClipboard} className='copy-button'>
                Copy
              </button>
            </div>
          )}

          <div className='time-box'>
            {timeSettings.map((setting, index) => {
              const { type, city, country } = setting;
              const currentDate = moment().format('ddd, MMM D');
              const longForm = type === 'utc' ? 'Universal Time Coordinated' : 'Indian Standard Time';

              return (
                <DraggableItem key={setting.id} index={index} moveItem={moveItem}>
                  <TimeSlider
                    type={type}
                    value={sliderValues[type]}
                    onChange={handleSliderChange(type)}
                    longForm={city ? '' : longForm}
                    currentDate={currentDate}
                    city={city || ''}
                    country={country || ''}
                    time={times[type]}
                    onDelete={() => handleDelete(index)}
                  />
                </DraggableItem>
              );
            })}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
