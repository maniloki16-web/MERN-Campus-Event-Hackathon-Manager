
import React, { useEffect, useState } from "react";
import "./App.css";

const API = {
  events: "/api/events",
  registrations: "/api/registrations",
  teams: "/api/teams",
};

function getStatus(date) {
  const eventDate = new Date(date);
  const today = new Date();
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return eventDate < today ? "Completed" : "Upcoming";
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    maxParticipants: "100",
  });

  const [registration, setRegistration] = useState({
    eventId: "",
    name: "",
    email: "",
    phone: "",
  });

  const [team, setTeam] = useState({
    eventId: "",
    teamName: "",
    leaderName: "",
    members: [{ name: "", email: "" }],
  });

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API.events);
      const data = await readResponse(response);
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      setError(err.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }

  async function loadParticipants() {
    try {
      const response = await fetch(API.registrations);
      const data = await readResponse(response);
      setParticipants(
        Array.isArray(data) ? data : data.registrations || []
      );
    } catch (err) {
      setError(err.message || "Unable to load participants.");
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function navigate(nextPage) {
    setPage(nextPage);
    setError("");
    if (nextPage === "events" || nextPage === "register" ||
        nextPage === "create-team" || nextPage === "my-events" ||
        nextPage === "admin") {
      await loadEvents();
    }
    if (nextPage === "participants" || nextPage === "admin") {
      await loadParticipants();
    }
  }

  async function createEvent(e) {
    e.preventDefault();
    try {
      const response = await fetch(API.events, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          maxParticipants: Number(eventForm.maxParticipants),
        }),
      });
      await readResponse(response);
      alert("Event created successfully!");
      setEventForm({
        title: "",
        description: "",
        date: "",
        venue: "",
        maxParticipants: "100",
      });
      await loadEvents();
      setPage("events");
    } catch (err) {
      alert(err.message || "Could not create event.");
    }
  }

  async function deleteEvent(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    try {
      const response = await fetch(`${API.events}/${id}`, {
        method: "DELETE",
      });
      await readResponse(response);
      await loadEvents();
      if (page === "admin") await loadParticipants();
      alert("Event deleted successfully!");
    } catch (err) {
      alert(err.message || "Could not delete event.");
    }
  }

  async function registerForEvent(e) {
    e.preventDefault();
    try {
      const response = await fetch(API.registrations, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration),
      });
      await readResponse(response);
      alert("Registration successful!");
      setRegistration({
        eventId: "",
        name: "",
        email: "",
        phone: "",
      });
      await loadParticipants();
      setPage("events");
    } catch (err) {
      alert(err.message || "Registration failed.");
    }
  }

  function updateTeam(field, value) {
    setTeam((previous) => ({ ...previous, [field]: value }));
  }

  function updateMember(index, field, value) {
    setTeam((previous) => ({
      ...previous,
      members: previous.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  }

  async function createTeam(e) {
    e.preventDefault();
    try {
      const response = await fetch(API.teams, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(team),
      });
      await readResponse(response);
      alert("Team created successfully!");
      setTeam({
        eventId: "",
        teamName: "",
        leaderName: "",
        members: [{ name: "", email: "" }],
      });
      setPage("home");
    } catch (err) {
      alert(err.message || "Could not create team.");
    }
  }

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = [
      event.title,
      event.description,
      event.venue,
    ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesFilter =
      filter === "All" || getStatus(event.date) === filter;

    return matchesSearch && matchesFilter;
  });

  const eventName = (participant) => {
    const linked = participant.eventId;
    if (linked && typeof linked === "object") return linked.title || "Event";
    return events.find((event) => event._id === linked)?.title || "Event";
  };

  return (
    <div className="app">
      <header className="navbar">
        <button className="logo" onClick={() => navigate("home")}>
          Campus<span>Event</span>
        </button>

        <nav className="nav-links">
          {[
            ["Home", "home"],
            ["Events", "events"],
            ["Create Event", "create-event"],
            ["Register", "register"],
            ["Create Team", "create-team"],
            ["My Events", "my-events"],
            ["Participants", "participants"],
            ["Admin", "admin"],
          ].map(([label, destination]) => (
            <button
              key={destination}
              className={page === destination ? "nav-active" : ""}
              onClick={() => navigate(destination)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">COLLEGE EVENT MANAGEMENT</span>
              <h1>
                Discover.
                <br /> Participate.
                <br /><span>Achieve.</span>
              </h1>
              <p>
                Manage campus events, hackathons, workshops and
                competitions in one simple platform.
              </p>
              <div className="hero-buttons">
                <button className="primary-btn" onClick={() => navigate("events")}>
                  Explore Events →
                </button>
                <button className="secondary-btn" onClick={() => navigate("create-event")}>
                  + Create Event
                </button>
              </div>
              <div className="hero-stats">
                <div><strong>{events.length}</strong><span>Events</span></div>
                <div><strong>{participants.length}</strong><span>Registrations loaded</span></div>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-orbit orbit-one"></div>
              <div className="art-orbit orbit-two"></div>
              <div className="art-card">
                <span className="art-icon">🚀</span>
                <span className="art-label">IDEAS INTO ACTION</span>
                <strong>Build something<br />brilliant.</strong>
                <div className="art-pills"><i>Hackathons</i><i>Workshops</i></div>
              </div>
              <div className="floating-bubble bubble-one">💡</div>
              <div className="floating-bubble bubble-two">🎯</div>
              <div className="floating-bubble bubble-three">✨</div>
            </div>
          </section>

          <section className="section features-section">
            <div className="section-heading">
              <span className="eyebrow">ALL IN ONE PLACE</span>
              <h2>Everything You Need</h2>
              <p>One platform for managing your campus events.</p>
            </div>
            <div className="features">
              <Feature icon="📅" title="Event Management" text="Create and manage college events easily." />
              <Feature icon="👥" title="Easy Registration" text="Let students register for events in one place." />
              <Feature icon="🚀" title="Team Creation" text="Organise teams for hackathons and competitions." />
              <Feature icon="📊" title="Admin Dashboard" text="Review event and registration statistics." />
            </div>
          </section>

          <section className="cta-section">
            <span className="eyebrow">YOUR NEXT OPPORTUNITY</span>
            <h2>Ready to join an event?</h2>
            <p>Explore campus events and get involved.</p>
            <button className="primary-btn" onClick={() => navigate("events")}>
              Browse Events →
            </button>
          </section>
        </>
      )}

      {page === "create-event" && (
        <Page title="Create New Event" subtitle="Add an event to your campus calendar.">
          <form className="form-card" onSubmit={createEvent}>
            <label>Event title<input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="e.g. Annual Hackathon" /></label>
            <label>Description<textarea required rows="4" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Tell students about this event" /></label>
            <div className="form-row">
              <label>Date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></label>
              <label>Venue<input required value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="e.g. Main Auditorium" /></label>
            </div>
            <label>Maximum participants<input required type="number" min="1" value={eventForm.maxParticipants} onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })} /></label>
            <button className="primary-btn full-btn" type="submit">Create Event</button>
          </form>
        </Page>
      )}

      {page === "events" && (
        <Page title="Browse Events" subtitle="Find the right event for you.">
          <div className="search-filter">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search by title, description or venue" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Events</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
            <button className="secondary-btn" onClick={() => { setSearch(""); setFilter("All"); }}>
              Clear
            </button>
          </div>
          {loading ? <p className="empty-state">Loading events...</p> :
            <div className="event-grid">
              {filteredEvents.length ? filteredEvents.map((event) => (
                <EventCard key={event._id} event={event}
                  onDelete={deleteEvent}
                  onRegister={() => {
                    setRegistration({ ...registration, eventId: event._id });
                    setPage("register");
                  }} />
              )) : <Empty title="No events found" text="Try another search or create a new event." />}
            </div>
          }
        </Page>
      )}

      {page === "register" && (
        <Page title="Event Registration" subtitle="Fill in your details to register.">
          <form className="form-card" onSubmit={registerForEvent}>
            <label>Select event
              <select required value={registration.eventId} onChange={(e) => setRegistration({ ...registration, eventId: e.target.value })}>
                <option value="">Choose an event</option>
                {events.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
              </select>
            </label>
            <label>Full name<input required value={registration.name} onChange={(e) => setRegistration({ ...registration, name: e.target.value })} placeholder="Enter your name" /></label>
            <label>Email address<input required type="email" value={registration.email} onChange={(e) => setRegistration({ ...registration, email: e.target.value })} placeholder="you@example.com" /></label>
            <label>Phone number<input required type="tel" value={registration.phone} onChange={(e) => setRegistration({ ...registration, phone: e.target.value })} placeholder="Enter phone number" /></label>
            <button className="primary-btn full-btn" type="submit">Register Now</button>
          </form>
        </Page>
      )}

      {page === "create-team" && (
        <Page title="Create Your Team" subtitle="Organise your teammates for a hackathon or competition.">
          <form className="form-card" onSubmit={createTeam}>
            <label>Select event
              <select required value={team.eventId} onChange={(e) => updateTeam("eventId", e.target.value)}>
                <option value="">Choose an event</option>
                {events.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
              </select>
            </label>
            <label>Team name<input required value={team.teamName} onChange={(e) => updateTeam("teamName", e.target.value)} placeholder="e.g. Code Champs" /></label>
            <label>Team leader<input required value={team.leaderName} onChange={(e) => updateTeam("leaderName", e.target.value)} placeholder="Leader's name" /></label>
            <h3 className="form-subheading">Team Members</h3>
            {team.members.map((member, index) => (
              <div className="member-box" key={index}>
                <label>Member {index + 1}<input required value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} placeholder="Member name" /></label>
                <label>Email<input required type="email" value={member.email} onChange={(e) => updateMember(index, "email", e.target.value)} placeholder="Member email" /></label>
              </div>
            ))}
            <button type="button" className="secondary-btn" onClick={() => updateTeam("members", [...team.members, { name: "", email: "" }])}>
              + Add Member
            </button>
            <button className="primary-btn full-btn" type="submit">Create Team</button>
          </form>
        </Page>
      )}

      {page === "my-events" && (
        <Page title="My Events" subtitle="Browse and manage the events available in the system.">
          <div className="event-grid">
            {events.length ? events.map((event) => <EventCard key={event._id} event={event} onDelete={deleteEvent} onRegister={() => { setRegistration({ ...registration, eventId: event._id }); setPage("register"); }} />) :
              <Empty title="No events yet" text="Create your first campus event." />}
          </div>
        </Page>
      )}

      {page === "participants" && (
        <Page title="Participants" subtitle="View registered students and their event details.">
          <div className="participant-grid">
            {participants.length ? participants.map((participant) => (
              <div className="participant-card" key={participant._id}>
                <div className="participant-avatar">{(participant.name || "P").charAt(0).toUpperCase()}</div>
                <div><h3>{participant.name}</h3><p>✉ {participant.email}</p><p>☎ {participant.phone || "Not provided"}</p><p>🎯 {eventName(participant)}</p></div>
              </div>
            )) : <Empty title="No participants yet" text="Registrations will appear here." />}
          </div>
        </Page>
      )}

      {page === "admin" && (
        <Page title="Admin Dashboard" subtitle="A quick overview of campus activity.">
          <div className="stats-grid">
            <Stat icon="📅" label="Total Events" value={events.length} />
            <Stat icon="🚀" label="Upcoming Events" value={events.filter((event) => getStatus(event.date) === "Upcoming").length} />
            <Stat icon="✅" label="Completed Events" value={events.filter((event) => getStatus(event.date) === "Completed").length} />
            <Stat icon="👥" label="Registrations" value={participants.length} />
          </div>
          <div className="dashboard-card">
            <h2>Event Summary</h2>
            {events.length ? events.map((event) => {
              const count = participants.filter((person) => {
                const id = person.eventId && typeof person.eventId === "object" ? person.eventId._id : person.eventId;
                return id === event._id;
              }).length;
              const capacity = Number(event.maxParticipants) || 0;
              return (
                <div className="dashboard-row" key={event._id}>
                  <div><h3>{event.title}</h3><p>📍 {event.venue} · {new Date(event.date).toLocaleDateString()}</p></div>
                  <div className="summary-count"><strong>{count}</strong><span>{capacity ? ` / ${capacity} registered` : " registered"}</span></div>
                  <span className={`status ${getStatus(event.date).toLowerCase()}`}>{getStatus(event.date)}</span>
                </div>
              );
            }) : <Empty title="No events available" text="Create an event to see dashboard statistics." />}
          </div>
          <div className="dashboard-card">
            <h2>Manage Events</h2>
            <div className="event-grid">
              {events.map((event) => <EventCard key={event._id} event={event} onDelete={deleteEvent} onRegister={() => { setRegistration({ ...registration, eventId: event._id }); setPage("register"); }} />)}
            </div>
          </div>
        </Page>
      )}

      <footer className="footer">
        <button className="footer-logo" onClick={() => navigate("home")}>Campus<span>Event</span></button>
        <p>Campus Event & Hackathon Manager</p>
        <p>© 2026 CampusEvent · Built for campus communities</p>
      </footer>
    </div>
  );
}

function Page({ title, subtitle, children }) {
  return <main className="page-section">
    <div className="page-heading"><span className="eyebrow">CAMPUSEVENT</span><h1>{title}</h1><p>{subtitle}</p></div>
    {children}
  </main>;
}

function Feature({ icon, title, text }) {
  return <article className="feature-card">
    <div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p>
  </article>;
}

function Stat({ icon, label, value }) {
  return <article className="stat-card">
    <div className="stat-icon">{icon}</div><p>{label}</p><strong>{value}</strong>
  </article>;
}

function Empty({ title, text }) {
  return <div className="empty-state"><div className="empty-icon">✦</div><h3>{title}</h3><p>{text}</p></div>;
}

function EventCard({ event, onDelete, onRegister }) {
  const status = getStatus(event.date);
  return <article className="event-card">
    <div className="event-card-top">
      <span className={`event-symbol ${status === "Upcoming" ? "symbol-blue" : "symbol-purple"}`}>✦</span>
      <span className={`status ${status.toLowerCase()}`}>{status}</span>
    </div>
    <h3>{event.title}</h3>
    <p className="event-description">{event.description}</p>
    <div className="event-info">
      <p><span>📅</span> {new Date(event.date).toLocaleDateString()}</p>
      <p><span>📍</span> {event.venue}</p>
      <p><span>👥</span> Capacity: {event.maxParticipants || "Not specified"}</p>
    </div>
    <div className="event-actions">
      {status === "Upcoming" && <button className="primary-btn" onClick={onRegister}>Register →</button>}
      <button className="delete-btn" onClick={() => onDelete(event._id)}>Delete</button>
    </div>
  </article>;
}