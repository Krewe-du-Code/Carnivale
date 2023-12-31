import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import EventCreateModal from "./EventCreateModal";
import { Button, Container } from "react-bootstrap";
import { FaRoute } from "react-icons/fa6";

interface ParadeInfo {
  title: string;
  startDate: string;
  location: string;
  imageSrc: string;
  imageParade: string;
  paradeInfo: string;
  directionsText: string;
  otherParades: string;
  mapLink: string;
}

interface ParadeProps {
  lng: number;
  lat: number;
  userId: number;
}

interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

interface WeatherDay {
  date: string;
  day: {
    maxtemp_f: number;
    mintemp_f: number;
    daily_chance_of_rain: number;
    condition: WeatherCondition;
  };
}

interface WeatherForecast {
  forecast: {
    forecastday: WeatherDay[];
  };
}

const Parade: React.FC<ParadeProps> = ({ userId, lng, lat }) => {
  const [paradeInfo, setParadeInfo] = useState<ParadeInfo | null>(null);
  const [selectedParade, setSelectedParade] = useState<string | null>(null);
  const [paradeList, setParadeList] = useState<string[]>([]);
  const [weatherForecast, setWeatherForecast] =
    useState<WeatherForecast | null>(null);

  // state needed for create event modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  // determines whether creating or updating
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState({
    latitude: 0,
    longitude: 0,
    startTime: null,
    endTime: null,
  });

  // need to get friends in order to know
  // who we can invite to the event being created
  const getFriends = async () => {
    try {
      const friends = await axios.get(`/api/friends/getFriends/${userId}`);
      // console.log('here', friends.data);
      setFriends(friends.data);
    } catch (err) {
      console.error("CLIENT ERROR: failed to GET user friends", err);
    }
  };

  const fetchParadeInfo = async (paradeName: string) => {
    try {
      const response = await axios.get<ParadeInfo>(
        `/api/parades/parade-info/${paradeName}`
      );
      console.log("parade response", response.data);
      setParadeInfo(response.data);
    } catch (error) {
      console.error("Error fetching parade information:", error.message);
    }
  };

  const fetchParadeList = async () => {
    try {
      const response = await axios.get<{ parades: string[] }>(
        "/api/parades/parade-list"
      );
      setParadeList(response.data.parades);
    } catch (error) {
      console.error("Error fetching parade list:", error.message);
    }
  };

  const handleParadeChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedParadeName = event.target.value;
    const formattedParadeName = encodeURIComponent(
      selectedParadeName.replace(/\s+/g, "-").toLowerCase()
    );

    try {
      // Fetch parade information
      const paradeResponse = await axios.get<ParadeInfo>(
        `/api/parades/parade-info/${formattedParadeName}`
      );

      setParadeInfo(paradeResponse.data);
      setSelectedParade(selectedParadeName);

      // Format the date to "YYYY-MM-DD"
      const formattedDate = dayjs(paradeResponse.data.startDate).format(
        "YYYY-MM-DD"
      );
      console.log("date", formattedDate);

      // Fetch weather data for the selected date
      const weatherResponse = await axios.get(
        `/api/weather/forecast/${formattedDate}`
      );
      console.log("weather", weatherResponse);
      setWeatherForecast(weatherResponse.data);
    } catch (error) {
      console.error(
        "Error fetching parade or weather information:",
        error.message
      );
    }
  };

  useEffect(() => {
    fetchParadeList();
    getFriends();
  }, []);

  return (
    <Container className="body">
      <div className="card">
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <label htmlFor="paradeSelect">Select a Parade: </label>
          <select
            id="paradeSelect"
            onChange={handleParadeChange}
            value={selectedParade || ""}
          >
            <option value="" disabled>
              Select a parade
            </option>
            {paradeList.map((paradeName) => (
              <option key={paradeName} value={paradeName}>
                {paradeName}
              </option>
            ))}
          </select>

          {selectedParade && (
            <Button
              onClick={async () => {
                await setIsNewEvent(true);
                await setShowCreateModal(true);
                await setSelectedEvent({
                  ...paradeInfo,
                  latitude: 0,
                  longitude: 0,
                  endTime: null,
                  startTime: null,
                });
              }}
              style={{ marginRight: "10px" }}
            >
              Create Event
            </Button>
          )}
        </div>

        {paradeInfo && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            {/* <Button
              onClick={async () => {
                await setIsNewEvent(true);
                await setShowCreateModal(true);
                await setSelectedEvent({
                  ...paradeInfo,
                  latitude: 0,
                  longitude: 0,
                  endTime: null,
                  startTime: null,
                });
              }}
            >
              Create Event
            </Button> */}
            <h2>{paradeInfo.title}</h2>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <img
                src={`https://www.mardigrasneworleans.com${paradeInfo.imageParade}`}
                alt="Parade Logo"
                style={{
                  height: "150px",
                  width: "150px",
                  marginRight: "10px",
                }}
              />
              <div>
                <p>
                  Start Time:{" "}
                  {dayjs(paradeInfo.startDate).format("MMMM D YYYY, h:mm:ss A")}
                </p>
                <p>Parade Location: {paradeInfo.location}</p>
              </div>
            </div>

            <img
              src={`https://www.mardigrasneworleans.com${paradeInfo.imageSrc}`}
              alt="Parade Map"
              style={{
                maxWidth: "100%",
                height: "auto",
                marginTop: "10px",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />

            {weatherForecast &&
            weatherForecast.forecast &&
            weatherForecast.forecast.forecastday.length > 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                  marginBottom: "20px",
                }}
              >
                <h3>Weather Forecast</h3>
                {weatherForecast?.forecast?.forecastday.map(
                  (forecastDay: WeatherDay) => (
                    <div
                      key={forecastDay.date}
                      style={{ textAlign: "center", marginBottom: "5px" }}
                    >
                      <div
                        style={{
                          margin: "3px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={`https:${forecastDay.day.condition.icon}`}
                          alt={`Weather Icon for ${forecastDay.date}`}
                          style={{ marginRight: "5px" }}
                        />
                        {forecastDay.day.condition.text}
                      </div>
                      <div
                        style={{
                          margin: "1px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ marginRight: "5px" }}>
                          High: {forecastDay.day.maxtemp_f} °F
                        </span>
                        <span>Low: {forecastDay.day.mintemp_f} °F</span>
                      </div>
                      <p style={{ margin: "1px 0", fontSize: "1rem" }}>
                        Chance of Rain: {forecastDay.day.daily_chance_of_rain}%
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div>
                <h3>Weather Forecast</h3>
                <p>No Weather Data Available</p>
              </div>
            )}

            <h3>Parade History</h3>
            <p>
              {paradeInfo.paradeInfo
                .replace(/(Year founded:)/g, ", $1")
                .replace(/(Membership:)/g, ", $1")
                .replace(/(Number of floats:)/g, ", $1")
                .replace(/(Floats by Kern Studios »)/g, ", $1")}
            </p>
            <h3>Parade Directions</h3>
            <p>{paradeInfo.directionsText}</p>
            <h3>
              Other Parades on{" "}
              {dayjs(paradeInfo.startDate).format("MMMM D YYYY")}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {paradeInfo.otherParades
                .split("\n")
                .filter(
                  (parade) =>
                    !parade.includes(
                      `Parades On ${dayjs(paradeInfo.startDate).format(
                        "MMM D"
                      )}`
                    )
                )
                .map((parade) => (
                  <Button
                    key={parade}
                    onClick={() =>
                      fetchParadeInfo(parade.replace(/\s+/g, "-").toLowerCase())
                    }
                    style={{ marginRight: "10px", marginBottom: "10px" }}
                  >
                    {parade}
                  </Button>
                ))}
            </div>

            <p>
              <FaRoute />
              <a
                href={paradeInfo.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "5px", marginRight: "5px" }}
              >
                View Parade Route
              </a>
              <FaRoute style={{ transform: "scaleX(-1)" }} />
            </p>
          </div>
        )}

        <EventCreateModal
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setShowCreateModal={setShowCreateModal}
          showCreateModal={showCreateModal}
          friends={friends}
          userId={userId}
          // isUserAttending={isUserAttending}
          // setIsUserAttending={setIsUserAttending}
          // getEventsInvited={getEventsInvited}
          // getEventsParticipating={getEventsParticipating}
          isNewEvent={isNewEvent}
          setIsNewEvent={setIsNewEvent}
          lat={lat}
          lng={lng}
          //getLocation={getLocation}
          eventType={"parade"}
          getEventsOwned={null} // not needed for parades
        />
      </div>
    </Container>
  );
};

export default Parade;
