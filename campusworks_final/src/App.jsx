import React, { useEffect, useMemo, useState } from "react";

const API = "/api";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("campusworks_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}



const navPublic = ["Home", "Explore", "About"];



function Icon({ children }) {

  return <span className="icon">{children}</span>;

}



function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      className={`btn ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}



function Navbar({ page, setPage, role }) {
  const go = (p) => setPage(p);

  const loggedIn = Boolean(
    localStorage.getItem("campusworks_token") && role
  );

  const profilePage =
    role === "student" ? "student-profile" : `${role}-dashboard`;

  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => go("home")}>
          <span className="brand-mark">CW</span>
          <span>
            Campus<span>Works</span>
          </span>
        </button>

        <nav className="desktop-nav">
          {navPublic.map((item) => (
            <button
              key={item}
              className={
                page === item.toLowerCase()
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() => go(item.toLowerCase())}
            >
              {item}
            </button>
          ))}

          {loggedIn ? (
            <>
              <button
                className={
                  page === profilePage ? "nav-link active" : "nav-link"
                }
                onClick={() => go(profilePage)}
              >
                Profile
              </button>

           
            </>
          ) : (
            <>
              <button
                className="nav-link"
                onClick={() => go("login")}
              >
                Login
              </button>

              <Button
                onClick={() => go("register")}
                className="nav-cta"
              >
                Get Started
              </Button>
            </>
          )}
        </nav>

        <button
          className="mobile-menu"
          onClick={() => go(loggedIn ? profilePage : "explore")}
          aria-label="Open profile or Explore"
        >
          ☰
        </button>
      </div>
    </header>
  );
}



function Footer() {

  return (

    <footer className="footer">

      <div>

        <strong>CampusWorks</strong>

        <p>Connecting campus talent with campus opportunities.</p>

      </div>

      <div className="footer-right">React + Flask + SQLite · College Project</div>

    </footer>

  );

}



function Home({ setPage, opportunities, loading, error }) {

  return (

    <>

      <section className="hero">

        <div>

          <span className="eyebrow">CAMPUS OPPORTUNITY PLATFORM</span>

          <h1>Find opportunities.<br /><em>Build your campus career.</em></h1>

          <p>

            CampusWorks connects students with faculty and clubs for internships,

            projects, research and campus activities.

          </p>



          <div className="hero-actions">

            <Button onClick={() => setPage("explore")}>Explore Opportunities</Button>

            <Button variant="secondary" onClick={() => setPage("register")}>Create Profile</Button>

          </div>



          

        </div>



        <div className="hero-card">

          <div className="hero-card-title">HOW CAMPUSWORKS HELPS</div>

          {[

            ["01", "Discover", "Find work that matches your skills."],

            ["02", "Apply", "Send applications directly from campus."],

            ["03", "Grow", "Complete work and build your reputation."]

          ].map(([n, t, d]) => (

            <div className="hero-step" key={n}>

              <b>{n}</b>

              <div><strong>{t}</strong><p>{d}</p></div>

            </div>

          ))}

        </div>

      </section>



      <section className="section">

        <div className="section-head">

          <div>

            <span className="eyebrow">FEATURED</span>

            <h2>Opportunities students are exploring</h2>

          </div>

          <button className="text-btn" onClick={() => setPage("explore")}>View all →</button>

        </div>



        {loading ? (

          <p>Loading opportunities...</p>

        ) : error ? (

          <p>{error}</p>

        ) : (

          <div className="opportunity-grid">

            {opportunities.slice(0, 3).map((o) => (

              <OpportunityCard key={o.id} opportunity={o} setPage={setPage} />

            ))}

          </div>

        )}

      </section>



      <section className="light-section">

        <div className="section-head center">

          <span className="eyebrow">FOR EVERYONE</span>

          <h2>One platform. Three campus roles.</h2>

        </div>



        <div className="role-cards">

          <RoleCard icon="🎓" title="Students" text="Create a profile, discover opportunities and track applications." onClick={() => setPage("register")} />

          <RoleCard icon="👩‍🏫" title="Faculty" text="Post academic, research and project opportunities and manage applicants." onClick={() => setPage("register")} />

          <RoleCard icon="🏫" title="Clubs" text="Find students for events, volunteering, design and technical work." onClick={() => setPage("register")} />

        </div>

      </section>

    </>

  );

}



function RoleCard({ icon, title, text, onClick }) {

  return (

    <div className="role-card">

      <div className="role-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button className="text-btn" onClick={onClick}>Get started →</button>

    </div>

  );

}



function OpportunityCard({ opportunity, setPage }) {

  return (

    <article className="opportunity-card">

      <div className="card-meta">

        <span className="tag">{opportunity.type}</span>

        <span>{opportunity.location}</span>

      </div>



      <h3>{opportunity.title}</h3>

      <p className="organization">{opportunity.organization}</p>

      <p className="muted">{opportunity.description}</p>



      <div className="chips">

        {(opportunity.skills || []).map((s) => <span key={s}>{s}</span>)}

      </div>



      <Button

        variant="outline"

        className="full"

        onClick={() => setPage(`opportunity-${opportunity.id}`)}

      >

        View opportunity

      </Button>

    </article>

  );

}



function Explore({ setPage, opportunities, loading, error }) {

  const [search, setSearch] = useState("");

  const [type, setType] = useState("All");

  const [location, setLocation] = useState("All");



  const filtered = useMemo(() => opportunities.filter((o) => {

    const q = search.toLowerCase();

    const skills = (o.skills || []).join(" ");

    const matchesText = `${o.title} ${o.organization} ${skills}`.toLowerCase().includes(q);



    return matchesText &&

      (type === "All" || o.type === type) &&

      (location === "All" || o.location === location);

  }), [opportunities, search, type, location]);



  return (

    <section className="page-section">

      <div className="page-header">

        <span className="eyebrow">EXPLORE</span>

        <h1>Find your next opportunity</h1>

        <p>Search campus work, internships, research roles and volunteer activities.</p>

      </div>



      <div className="filter-bar">

        <input

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          placeholder="Search by role, skill or organization..."

        />



        <select value={type} onChange={(e) => setType(e.target.value)}>

          <option>All</option>

          <option>Internship</option>

          <option>Volunteer</option>

          <option>Research</option>

          <option>Part-time</option>

          <option>Project</option>

        </select>



        <select value={location} onChange={(e) => setLocation(e.target.value)}>

          <option>All</option>

          <option>On Campus</option>

          <option>VIT Pune</option>

          <option>Department Lab</option>

          <option>Hybrid</option>

        </select>

      </div>



      {loading ? (

        <p>Loading opportunities...</p>

      ) : error ? (

        <p>{error}</p>

      ) : (

        <>

          <div className="result-line">{filtered.length} opportunities found</div>

          <div className="opportunity-grid">

            {filtered.map((o) => (

              <OpportunityCard key={o.id} opportunity={o} setPage={setPage} />

            ))}

          </div>

          {!filtered.length && <div className="empty">No opportunities match your search.</div>}

        </>

      )}

    </section>

  );

}



function OpportunityDetails({ opportunity, setPage, role }) {
  if (!opportunity) {
    return (
      <section className="page-section">
        <h1>Opportunity not found</h1>
        <Button onClick={() => setPage("explore")}>
          Back to Explore
        </Button>
      </section>
    );
  }

  return (
    <section className="page-section detail-page">
      <button
        className="back-link"
        onClick={() => setPage("explore")}
      >
        ← Back to Explore
      </button>

      <div className="detail-layout">
        <article className="detail-main">
          <span className="tag">{opportunity.type}</span>
          <h1>{opportunity.title}</h1>
          <p className="organization">{opportunity.organization}</p>

          <div className="detail-info">
            <span>📍 {opportunity.location}</span>
            <span>
              📅 Deadline: {opportunity.deadline || "Not specified"}
            </span>
            <span>
              🎓 {opportunity.payment || "Not specified"}
            </span>
          </div>

          <hr />

          <h3>About this opportunity</h3>
          <p>{opportunity.description}</p>

          <h3>Required skills</h3>
          <div className="chips">
            {(opportunity.skills || []).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>

          <hr />

          <h3>Recruiter Contact Details</h3>
          <div className="recruiter-contact">
            <p>
              <strong>Name:</strong>{" "}
              {opportunity.contactName || "Not provided"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {opportunity.contactEmail ? (
                <a href={`mailto:${opportunity.contactEmail}`}>
                  {opportunity.contactEmail}
                </a>
              ) : (
                "Not provided"
              )}
            </p>

            {opportunity.contactPhone && (
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${opportunity.contactPhone}`}>
                  {opportunity.contactPhone}
                </a>
              </p>
            )}
          </div>
        </article>

        <aside className="apply-card">
          <h3>Interested?</h3>
          <p>
            Apply for this campus opportunity and track your
            application from your dashboard.
          </p>

          <Button
            className="full"
            onClick={async () => {
              if (!localStorage.getItem("campusworks_token")) {
                setPage("login");
                return;
              }

              try {
                await apiRequest(
                  `/opportunities/${opportunity.id}/apply`,
                  {
                    method: "POST",
                    body: JSON.stringify({})
                  }
                );

                alert("Application submitted successfully.");
                setPage("student-applications");
              } catch (e) {
                alert(e.message);
              }
            }}
          >
            {localStorage.getItem("campusworks_token")
              ? "Apply now"
              : "Login to apply"}
          </Button>
        </aside>
      </div>
    </section>
  );
}






function Auth({ mode, setPage, setRole }) {

  const login = mode === "login";



  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedRole, setSelectedRole] = useState("student");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  async function submit(e) {

    e.preventDefault();

    setError("");



    if (!email.trim() || !password) {

      setError("Please enter your email and password.");

      return;

    }



    if (!login && !name.trim()) {

      setError("Please enter your full name.");

      return;

    }



    if (!login && password !== confirmPassword) {

      setError("Passwords do not match.");

      return;

    }



    setLoading(true);



    try {

      const endpoint = login

        ? "http://127.0.0.1:5000/api/auth/login"

        : "http://127.0.0.1:5000/api/auth/register";



      const payload = login

        ? { email: email.trim(), password }

        : {

            name: name.trim(),

            email: email.trim(),

            password,

            role: selectedRole

          };



      const response = await fetch(endpoint, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload)

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(data.error || "Authentication failed.");

      }



      localStorage.setItem("campusworks_token", data.accessToken);

      localStorage.setItem("campusworks_user", JSON.stringify(data.user));



      setRole(data.user.role);

      setPage(`${data.user.role}-dashboard`);

    } catch (err) {

      setError(

        err.message === "Failed to fetch"

          ? "Cannot connect to Flask. Check that your backend is running."

          : err.message

      );

    } finally {

      setLoading(false);

    }

  }



  return (

    <section className="auth-page">

      <div className="auth-card">

        <span className="eyebrow">

          {login ? "WELCOME BACK" : "JOIN CAMPUSWORKS"}

        </span>



        <h1>{login ? "Login to your account" : "Create your account"}</h1>



        <p>

          {login

            ? "Sign in with your registered account."

            : "Register to start using CampusWorks."}

        </p>



        <form onSubmit={submit}>

          {!login && (

            <input

              value={name}

              onChange={(e) => setName(e.target.value)}

              placeholder="Full name"

              autoComplete="name"

              required

            />

          )}



          <input

            type="email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            placeholder="Email address"

            autoComplete="email"

            required

          />



          <input

            type="password"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            placeholder="Password (at least 8 characters)"

            autoComplete={login ? "current-password" : "new-password"}

            minLength={8}

            required

          />



          {!login && (

            <>

              <input

                type="password"

                value={confirmPassword}

                onChange={(e) => setConfirmPassword(e.target.value)}

                placeholder="Confirm password"

                autoComplete="new-password"

                required

              />



              <label className="form-label">

                Role

                <select

                  value={selectedRole}

                  onChange={(e) => setSelectedRole(e.target.value)}

                >

                  <option value="student">Student</option>

                  <option value="faculty">Faculty</option>

                  <option value="club">Club</option>

                </select>

              </label>

            </>

          )}



          {error && (

            <p role="alert" style={{ color: "#dc2626" }}>

              {error}

            </p>

          )}



          <button

            type="submit"

            className="btn primary full"

            disabled={loading}

          >

            {loading

              ? "Please wait..."

              : login

                ? "Login"

                : "Create account"}

          </button>

        </form>



        <p className="auth-switch">

          {login

            ? "Don't have an account?"

            : "Already have an account?"}{" "}

          <button

            type="button"

            className="text-btn"

            onClick={() => setPage(login ? "register" : "login")}

          >

            {login ? "Register" : "Login"}

          </button>

        </p>

      </div>

    </section>

  );

}

function SideBar({ page, setPage, role }) {

  const items = role === "student"

    ? [["student-dashboard", "⌂", "Dashboard"], ["student-profile", "◉", "My Profile"], ["student-applications", "▣", "My Applications"], ["explore", "⌕", "Explore"]]

    : role === "faculty"

    ? [["faculty-dashboard", "⌂", "Dashboard"], ["faculty-post", "＋", "Post Opportunity"], ["faculty-applicants", "▣", "Applicants"], ["faculty-opportunities", "◫", "My Opportunities"]]

    : role === "club"

    ? [["club-dashboard", "⌂", "Dashboard"], ["club-post", "＋", "Post Activity"], ["club-applicants", "▣", "Applicants"], ["club-opportunities", "◫", "My Activities"]]

    : [["admin-dashboard", "⌂", "Dashboard"], ["admin-users", "◎", "Users"], ["admin-opportunities", "◫", "Opportunities"], ["admin-reviews", "★", "Reports"]];



  return (

    <aside className="sidebar">

      <div className="sidebar-user">

        <div className="avatar">{role === "student" ? "ST" : role === "faculty" ? "FC" : role === "club" ? "CL" : "AD"}</div>

        <div>

          <strong>{JSON.parse(localStorage.getItem("campusworks_user") || "null")?.name || role || "Guest"}</strong>

          <span>{role}</span>

        </div>

      </div>



      <div className="side-nav">

        {items.map(([p, icon, label]) => (

          <button key={p} className={page === p ? "side-link active" : "side-link"} onClick={() => setPage(p)}>

            <Icon>{icon}</Icon>{label}

          </button>

        ))}

      </div>



      <button
  className="side-link logout"
  onClick={() => {
    localStorage.removeItem("campusworks_token");
    localStorage.removeItem("campusworks_user");
    window.location.reload();
  }}
>
  <Icon>↪</Icon>Logout
</button> 
    </aside>

  );

}





function StudentDashboard({ setPage, opportunities = [] }) {

  const [user, setUser] = useState(

    () => JSON.parse(localStorage.getItem("campusworks_user") || "null")

  );

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    let cancelled = false;

    const token = localStorage.getItem("campusworks_token");



    if (!token) {

      setError("Please log in to view your dashboard.");

      setLoading(false);

      return;

    }



    const headers = {

      Authorization: `Bearer ${token}`

    };



    Promise.all([

      fetch("http://127.0.0.1:5000/api/auth/me", { headers }),

      fetch("http://127.0.0.1:5000/api/applications/me", { headers })

    ])

      .then(async ([userResponse, applicationsResponse]) => {

        const userData = await userResponse.json();

        const applicationsData = await applicationsResponse.json();



        if (!userResponse.ok) {

          throw new Error(userData.error || "Could not load your profile.");

        }



        if (!applicationsResponse.ok) {

          throw new Error(

            applicationsData.error || "Could not load your applications."

          );

        }



        if (cancelled) return;



        const currentUser = userData.user;

        setUser(currentUser);

        localStorage.setItem("campusworks_user", JSON.stringify(currentUser));



        setApplications(

          Array.isArray(applicationsData.applications)

            ? applicationsData.applications

            : []

        );

        setError("");

      })

      .catch((err) => {

        if (!cancelled) setError(err.message || "Could not load dashboard data.");

      })

      .finally(() => {

        if (!cancelled) setLoading(false);

      });



    return () => {

      cancelled = true;

    };

  }, []);



  const shortlisted = applications.filter(

    (a) => a.status === "Shortlisted"

  ).length;



  const completed = applications.filter(

    (a) => a.status === "Completed" || a.status === "Selected"

  ).length;



  const profileFields = user

    ? [user.name, user.email, user.course, user.year, user.bio,

       Array.isArray(user.skills) && user.skills.length > 0]

    : [];



  const profilePercent = profileFields.length

    ? Math.round(

        (profileFields.filter(Boolean).length / profileFields.length) * 100

      )

    : 0;



  const appliedOpportunityIds = new Set(

    applications.map((a) => Number(a.opportunityId))

  );



  const recommendations = opportunities

    .filter((o) => !appliedOpportunityIds.has(Number(o.id)))

    .slice(0, 4);



  return (

    <DashboardShell

      role="student"

      page="student-dashboard"

      setPage={setPage}

    >

      <DashboardHeader

        eyebrow="STUDENT DASHBOARD"

        title={`Welcome back, ${user?.name || "Student"} 👋`}

        text="Here’s what’s happening with your campus opportunities."

        action="Find Opportunities"

        onAction={() => setPage("explore")}

      />



      {error && (

        <p role="alert" style={{ color: "#dc2626" }}>

          {error}

        </p>

      )}



      <StatGrid

        stats={[

          ["Applications", loading ? "…" : String(applications.length),

            "Your submitted applications"],

          ["Shortlisted", loading ? "…" : String(shortlisted),

            "Applications shortlisted"],

          ["Completed", loading ? "…" : String(completed),

            "Selected or completed applications"],

          ["Profile", loading ? "…" : `${profilePercent}%`,

            "Profile information completed"]

        ]}

      />



      <div className="two-col">

        <Panel

          title="Recent applications"

          action="View all →"

          onAction={() => setPage("student-applications")}

        >

          {loading ? (

            <p>Loading applications...</p>

          ) : applications.length === 0 ? (

            <p>You haven't applied to any opportunities yet.</p>

          ) : (

            applications.slice(0, 3).map((a) => (

              <div className="manage-row" key={a.id}>

                <div>

                  <strong>

                    {a.opportunityTitle || a.title || `Application #${a.id}`}

                  </strong>

                  <span>Status: {a.status}</span>

                </div>

              </div>

            ))

          )}

        </Panel>



        <Panel title="Recommended for you">

          {recommendations.length === 0 ? (

            <p>No new opportunities available right now.</p>

          ) : (

            recommendations.map((o) => (

              <div className="recommend" key={o.id}>

                <div>

                  <strong>{o.title}</strong>

                  <span>{o.organization}</span>

                </div>

                <button onClick={() => setPage(`opportunity-${o.id}`)}>

                  →

                </button>

              </div>

            ))

          )}

        </Panel>

      </div>



      <Panel title="Complete your profile">

        <div className="profile-progress-row">

          <div>

            <strong>{profilePercent}% complete</strong>

            <p>

              Add your course, year, skills and bio to improve your profile.

            </p>

          </div>

          <Button

            variant="outline"

            onClick={() => setPage("student-profile")}

          >

            Complete profile

          </Button>

        </div>

        <div className="progress">

          <span style={{ width: `${profilePercent}%` }} />

        </div>

      </Panel>

    </DashboardShell>

  );

}





function StudentProfile({ setPage }) {
  const [profile, setProfile] = useState({ name: "", email: "", course: "", year: "", bio: "", skills: [] });
  const [skillsText, setSkillsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { let active = true; apiRequest("/auth/me").then(d => { if (active) { setProfile(d.user); setSkillsText((d.user.skills || []).join(", ")); } }).catch(e => { if (active) setMessage(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const update = (key, value) => setProfile(p => ({ ...p, [key]: value }));
  async function save() { setSaving(true); setMessage(""); try { const d = await apiRequest("/users/me", { method: "PATCH", body: JSON.stringify({ name: profile.name, course: profile.course, year: profile.year, bio: profile.bio, skills: skillsText.split(",").map(x => x.trim()).filter(Boolean) }) }); setProfile(d.user); setMessage("Profile saved successfully."); localStorage.setItem("campusworks_user", JSON.stringify(d.user)); } catch(e) { setMessage(e.message); } finally { setSaving(false); } }
  return <DashboardShell role="student" page="student-profile" setPage={setPage}><DashboardHeader eyebrow="MY PROFILE" title="My profile" text="Update your profile information." action={saving ? "Saving..." : "Save changes"} onAction={save}/>{loading ? <p>Loading profile...</p> : <div className="form-card"><div className="form-grid"><label className="field"><span>Full name</span><input value={profile.name || ""} onChange={e => update("name", e.target.value)} /></label><label className="field"><span>Email</span><input value={profile.email || ""} disabled /></label><label className="field"><span>Course</span><input value={profile.course || ""} onChange={e => update("course", e.target.value)} /></label><label className="field"><span>Year</span><select value={profile.year || ""} onChange={e => update("year", e.target.value)}><option value="">Select year</option>{["First Year", "Second Year", "Third Year", "Fourth Year"].map(x => <option key={x}>{x}</option>)}</select></label></div><label className="field"><span>Bio</span><textarea value={profile.bio || ""} onChange={e => update("bio", e.target.value)} /></label><label className="field"><span>Skills (comma separated)</span><input value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="React, Python, SQL" /></label>{message && <p role="status">{message}</p>}<Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button></div>}</DashboardShell>;
}

function Field({ label, value, textarea, select, options = [] }) {

  return (

    <label className="field">

      <span>{label}</span>

      {textarea

        ? <textarea defaultValue={value} />

        : select

        ? <select defaultValue={value}>{options.map(o => <option key={o}>{o}</option>)}</select>

        : <input defaultValue={value} />}

    </label>

  );

}



function StudentApplications({ setPage }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest("/applications/me").then(data => { if (active) setApplications(data.applications || []); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <DashboardShell role="student" page="student-applications" setPage={setPage}>
    <DashboardHeader eyebrow="APPLICATIONS" title="My applications" text="Track your applications from submission to completion." />
    {error && <p role="alert">{error}</p>}
    <div className="application-table">{loading ? <p>Loading applications...</p> : applications.length ? applications.map(a => <div className="application-row" key={a.id}><div className="app-icon">{(a.opportunityTitle || a.title || "A")[0]}</div><div className="app-info"><strong>{a.opportunityTitle || a.title || `Application #${a.id}`}</strong><span>{a.organization || ""}</span><small>Applied {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}</small></div><Status status={a.status} cls={(a.status || "Applied").toLowerCase().replaceAll(" ", "-")} /></div>) : <p>You have not applied to any opportunities yet.</p>}</div>
  </DashboardShell>;
}

function ApplicationRow({ app, detailed, onView }) {

  const cls = app.status.toLowerCase().replaceAll(" ", "-");



  return (

    <div className="application-row">

      <div className="app-icon">{app.title[0]}</div>

      <div className="app-info">

        <strong>{app.title}</strong>

        <span>{app.organization}</span>

        {detailed && <small>Applied {app.date}</small>}

      </div>

      <Status status={app.status} cls={cls} />

      {detailed && <Button variant="outline" onClick={onView}>View</Button>}

    </div>

  );

}



function Status({ status, cls }) {

  return <span className={`status ${cls}`}>{status}</span>;

}



function DashboardShell({ role, page, setPage, children }) {

  return (

    <div className="dashboard-shell">

      <SideBar role={role} page={page} setPage={setPage} />

      <section className="dashboard-content">{children}</section>

    </div>

  );

}



function DashboardHeader({ eyebrow, title, text, action, onAction }) {

  return (

    <div className="dashboard-header">

      <div>

        <span className="eyebrow">{eyebrow}</span>

        <h1>{title}</h1>

        <p>{text}</p>

      </div>

      {action && <Button onClick={onAction}>{action}</Button>}

    </div>

  );

}



function StatGrid({ stats }) {

  return (

    <div className="stat-grid">

      {stats.map(([a, b, c]) => (

        <div className="stat-card" key={a}>

          <span>{a}</span><strong>{b}</strong><small>{c}</small>

        </div>

      ))}

    </div>

  );

}



function Panel({ title, action, onAction, children }) {

  return (

    <div className="panel">

      <div className="panel-head">

        <div><h2>{title}</h2></div>

        {action && <button className="text-btn" onClick={onAction}>{action}</button>}

      </div>

      {children}

    </div>

  );

}



function FacultyDashboard({ setPage, role = "faculty" }) {
  const [items, setItems] = useState([]); const [applications, setApplications] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; async function load() { try { const [me, opps] = await Promise.all([apiRequest("/auth/me"), apiRequest("/opportunities")]); const owned = (opps.opportunities || []).filter(o => Number(o.ownerId) === Number(me.user.id)); const lists = await Promise.all(owned.map(o => apiRequest(`/opportunities/${o.id}/applications`).catch(() => ({ applications: [] })))); if (active) { setItems(owned); setApplications(lists.flatMap(x => x.applications || [])); } } catch(e) { if(active) setError(e.message); } finally { if(active) setLoading(false); } } load(); return () => { active = false; }; }, []);
  const selected = applications.filter(a => a.status === "Selected" || a.status === "Completed").length;
  return <DashboardShell role={role} page={`${role}-dashboard`} setPage={setPage}><DashboardHeader eyebrow={role === "club" ? "CLUB DASHBOARD" : "FACULTY DASHBOARD"} title={role === "club" ? "Club dashboard" : "Faculty dashboard"} text="Manage your published opportunities and review applications." action={role === "club" ? "Post Activity" : "Post Opportunity"} onAction={() => setPage(role === "club" ? "club-post" : "faculty-post")} />{error && <p role="alert">{error}</p>}<StatGrid stats={[[role === "club" ? "Activities" : "Opportunities", loading ? "…" : String(items.length), "Your published posts"],["Applicants", loading ? "…" : String(applications.length), "Applications received"],["Shortlisted", loading ? "…" : String(applications.filter(a => a.status === "Shortlisted").length), "Shortlisted applicants"],["Selected", loading ? "…" : String(selected), "Selected or completed"]]} /><div className="two-col"><Panel title={role === "club" ? "Your activities" : "Your opportunities"} action="Manage all →" onAction={() => setPage(role === "club" ? "club-opportunities" : "faculty-opportunities")}>{loading ? <p>Loading...</p> : items.length ? items.slice(0,4).map(o => <div className="manage-row" key={o.id}><div><strong>{o.title}</strong><span>{o.type} · {o.location}</span></div><span className="count-pill">{applications.filter(a => Number(a.opportunityId) === Number(o.id)).length} applicants</span></div>) : <p>You have not posted any opportunities yet.</p>}</Panel><Panel title="Recent applicants">{applications.slice(0,4).map(a => <div className="manage-row" key={a.id}><div><strong>{a.studentName || a.student?.name || "Student applicant"}</strong><span>{a.opportunityTitle || "Opportunity"}</span></div><Status status={a.status} cls={(a.status || "Applied").toLowerCase().replaceAll(" ", "-")} /></div>)}{!loading && !applications.length && <p>No applications received yet.</p>}</Panel></div></DashboardShell>;
}


function PostOpportunity({ setPage, role = "faculty" }) {
  const club = role === "club";
  const [form, setForm] = useState({
    title: "",
    type: club ? "Volunteer" : "Internship",
    location: "",
    deadline: "",
    description: "",
    skills: "",
    payment: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm(old => ({ ...old, [k]: v }));

  async function publish(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiRequest("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          organization:
            JSON.parse(localStorage.getItem("campusworks_user") || "{}")?.name ||
            (club ? "Campus Club" : "Faculty"),
          skills: form.skills.split(",").map(x => x.trim()).filter(Boolean),
          status: "published"
        })
      });
      setPage(club ? "club-opportunities" : "faculty-opportunities");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role={role} page={club ? "club-post" : "faculty-post"} setPage={setPage}>
      <DashboardHeader
        eyebrow={club ? "POST ACTIVITY" : "POST OPPORTUNITY"}
        title={club ? "Create a club activity" : "Create an opportunity"}
        text="Enter the details to publish this opportunity."
      />

      <form className="form-card post-form" onSubmit={publish}>
        <div className="form-grid">
          <label className="field">
            <span>Title</span>
            <input required value={form.title} onChange={e => update("title", e.target.value)} />
          </label>
          <label className="field">
            <span>Type</span>
            <select value={form.type} onChange={e => update("type", e.target.value)}>
              {(club
                ? ["Volunteer", "Event", "Competition", "Workshop", "Project"]
                : ["Internship", "Research", "Project", "Part-time", "Volunteer"]
              ).map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Location</span>
            <input required value={form.location} onChange={e => update("location", e.target.value)} />
          </label>
          <label className="field">
            <span>Deadline</span>
            <input type="date" value={form.deadline} onChange={e => update("deadline", e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea required value={form.description} onChange={e => update("description", e.target.value)} />
        </label>

        <label className="field">
          <span>Required skills (comma separated)</span>
          <input value={form.skills} onChange={e => update("skills", e.target.value)} />
        </label>

        <label className="field">
          <span>Payment / recognition</span>
          <input value={form.payment} onChange={e => update("payment", e.target.value)} />
        </label>

        <h3>Recruiter Contact Details</h3>

        <label className="field">
          <span>Contact Name</span>
          <input
            required
            value={form.contactName}
            onChange={e => update("contactName", e.target.value)}
            placeholder="Enter recruiter name"
          />
        </label>

        <label className="field">
          <span>Contact Email</span>
          <input
            type="email"
            required
            value={form.contactEmail}
            onChange={e => update("contactEmail", e.target.value)}
            placeholder="recruiter@example.com"
          />
        </label>

        <label className="field">
          <span>Contact Phone (optional)</span>
          <input
            type="tel"
            value={form.contactPhone}
            onChange={e => update("contactPhone", e.target.value)}
            placeholder="Enter phone number"
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <div className="form-actions">
          <Button variant="outline" onClick={() => setPage(club ? "club-dashboard" : "faculty-dashboard")}>
            Cancel
          </Button>
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Publishing..." : `Publish ${club ? "activity" : "opportunity"}`}
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}



function ManageOpportunities({ setPage, role }) {
  const club = role === "club";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    title: "",
    organization: "",
    type: "Internship",
    location: "",
    deadline: "",
    payment: "",
    description: "",
    skills: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);

    try {
      const [me, all] = await Promise.all([
        apiRequest("/auth/me"),
        apiRequest("/opportunities"),
      ]);

      setItems(
        (all.opportunities || []).filter(
          (o) => Number(o.ownerId) === Number(me.user.id)
        )
      );

      setError("");
    } catch (e) {
      setError(e.message || "Could not load your opportunities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEditing(opportunity) {
    setEditing(opportunity.id);

    setForm({
      title: opportunity.title || "",
      organization: opportunity.organization || "",
      type: opportunity.type || "Internship",
      location: opportunity.location || "",
      deadline: opportunity.deadline || "",
      payment: opportunity.payment || "",
      description: opportunity.description || "",
      skills: Array.isArray(opportunity.skills)
        ? opportunity.skills.join(", ")
        : opportunity.skills || "",
      contactName: opportunity.contactName || "",
      contactEmail: opportunity.contactEmail || "",
      contactPhone: opportunity.contactPhone || "",
    });

    setError("");
  }

  function cancelEditing() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveChanges(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.organization.trim() ||
        !form.location.trim() || !form.description.trim() ||
        !form.contactName.trim() || !form.contactEmail.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await apiRequest(`/opportunities/${editing}`, {
        method: "PATCH",
        body: {
          title: form.title.trim(),
          organization: form.organization.trim(),
          type: form.type,
          location: form.location.trim(),
          deadline: form.deadline,
          payment: form.payment.trim(),
          description: form.description.trim(),
          skills: form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          contactName: form.contactName.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
        },
      });

      const updated = response.opportunity;

      setItems((previous) =>
        previous.map((item) =>
          item.id === editing ? updated : item
        )
      );

      cancelEditing();
    } catch (e) {
      setError(e.message || "Could not update the opportunity.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this opportunity?")) return;

    setError("");

    try {
      await apiRequest(`/opportunities/${id}`, {
        method: "DELETE",
      });

      setItems((previous) => previous.filter((item) => item.id !== id));

      if (editing === id) {
        cancelEditing();
      }
    } catch (e) {
      setError(e.message || "Could not delete the opportunity.");
    }
  }

  return (
    <DashboardShell
      role={role}
      page={club ? "club-opportunities" : "faculty-opportunities"}
      setPage={setPage}
    >
      <DashboardHeader
        eyebrow={club ? "MY ACTIVITIES" : "MY OPPORTUNITIES"}
        title={club ? "Manage activities" : "Manage opportunities"}
        text="Edit or delete your own posts."
        action={club ? "Post Activity" : "Post Opportunity"}
        onAction={() => setPage(club ? "club-post" : "faculty-post")}
      />

      {error && <p role="alert">{error}</p>}

      {editing !== null && (
        <form className="application-table" onSubmit={saveChanges}>
          <h2>Edit Opportunity</h2>

          <label>
            Title *
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Organization *
            <input
              name="organization"
              value={form.organization}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Type *
            <select name="type" value={form.type} onChange={updateField}>
              <option value="Internship">Internship</option>
              <option value="Job">Job</option>
              <option value="Research">Research</option>
              <option value="Event">Event</option>
              <option value="Competition">Competition</option>
              <option value="Workshop">Workshop</option>
              <option value="Club Activity">Club Activity</option>
            </select>
          </label>

          <label>
            Location *
            <input
              name="location"
              value={form.location}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Deadline
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={updateField}
            />
          </label>

          <label>
            Payment / Stipend
            <input
              name="payment"
              value={form.payment}
              onChange={updateField}
            />
          </label>

          <label>
            Required Skills (comma-separated)
            <input
              name="skills"
              value={form.skills}
              onChange={updateField}
              placeholder="Python, React, Communication"
            />
          </label>

          <label>
            Description *
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              required
              rows={5}
            />
          </label>

          <label>
            Contact Name *
            <input
              name="contactName"
              value={form.contactName}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Contact Email *
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Contact Phone
            <input
              type="tel"
              name="contactPhone"
              value={form.contactPhone}
              onChange={updateField}
            />
          </label>

          <div className="manage-actions">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="application-table">
        {loading ? (
          <p>Loading opportunities...</p>
        ) : items.length ? (
          items.map((opportunity) => (
            <div className="manage-card" key={opportunity.id}>
              <div>
                <span className="tag">{opportunity.type}</span>
                <h3>{opportunity.title}</h3>
                <p>
                  {opportunity.location} · Deadline{" "}
                  {opportunity.deadline || "Not specified"}
                </p>
              </div>

              <div className="manage-actions">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage(club ? "club-applicants" : "faculty-applicants")
                  }
                >
                  Applicants
                </Button>

                <Button
                  variant="outline"
                  onClick={() => startEditing(opportunity)}
                >
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => remove(opportunity.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p>You have not published any opportunities.</p>
        )}
      </div>
    </DashboardShell>
  );
}


function ApplicantsPage({ setPage, role }) {
 const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{const [me,opps]=await Promise.all([apiRequest("/auth/me"),apiRequest("/opportunities")]);const owned=(opps.opportunities||[]).filter(o=>Number(o.ownerId)===Number(me.user.id));const lists=await Promise.all(owned.map(o=>apiRequest(`/opportunities/${o.id}/applications`).catch(()=>({applications:[]}))));if(active)setItems(lists.flatMap(d=>d.applications||[]));}catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}})();return()=>{active=false};},[]);
 async function update(id,status){try{await apiRequest(`/applications/${id}`,{method:"PATCH",body:JSON.stringify({status})});setItems(old=>old.map(a=>a.id===id?{...a,status}:a));}catch(e){setError(e.message);}}
 return <DashboardShell role={role} page={role==="club"?"club-applicants":"faculty-applicants"} setPage={setPage}><DashboardHeader eyebrow="APPLICANTS" title="Manage applicants" text="Review real applications and update their status."/>{error&&<p role="alert">{error}</p>}<div className="application-table">{loading?<p>Loading applicants...</p>:items.length?items.map(a=><div className="applicant-card" key={a.id}><div className="large-avatar small">{(a.studentName||"S").split(" ").map(x=>x[0]).join("")}</div><div className="app-info"><strong>{a.studentName||a.student?.name||"Student"}</strong><span>{a.opportunityTitle||"Opportunity"}</span></div><Status status={a.status} cls={(a.status||"Applied").toLowerCase().replaceAll(" ","-")}/><select value={a.status} onChange={e=>update(a.id,e.target.value)}>{["Applied","Under Review","Shortlisted","Selected","Rejected","Completed"].map(x=><option key={x}>{x}</option>)}</select></div>):<p>No applications received yet.</p>}</div></DashboardShell>;
}

function AdminDashboard({ setPage }) {
 const [summary,setSummary]=useState(null);const [error,setError]=useState("");
 useEffect(()=>{apiRequest("/admin/summary").then(setSummary).catch(e=>setError(e.message));},[]);
 return <DashboardShell role="admin" page="admin-dashboard" setPage={setPage}><DashboardHeader eyebrow="ADMIN PANEL" title="CampusWorks administration" text="Database totals from the backend."/>{error&&<p role="alert">{error}</p>}<StatGrid stats={[["Users",summary?.users??"…","Registered users"],["Opportunities",summary?.opportunities??"…","Database opportunities"],["Applications",summary?.applications??"…","Submitted applications"],["Reports",summary?.pendingReviews??"N/A","Reports endpoint not implemented"]]}/><div className="two-col"><Panel title="Administration"><p>View registered users and published opportunities from the database.</p><Button onClick={()=>setPage("admin-users")}>Manage users</Button> <Button onClick={()=>setPage("admin-opportunities")}>Manage opportunities</Button></Panel><Panel title="Reports"><p>The current Flask backend does not provide report/moderation endpoints.</p></Panel></div></DashboardShell>;
}



function AdminList({ setPage, type }) {
  const users = type === "users";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        users ? "/admin/users" : "/admin/opportunities"
      );
      setItems(data[users ? "users" : "opportunities"] || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [users]);

  function openEdit(item) {
    setEditingItem({
      ...item,
      skillsText: (item.skills || []).join(", "),
      contactName: item.contactName || "",
      contactEmail: item.contactEmail || "",
      contactPhone: item.contactPhone || "",
    });
    setError("");
    setNotice("");
  }

  async function saveOpportunity(event) {
    event.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        title: editingItem.title,
        organization: editingItem.organization,
        type: editingItem.type,
        location: editingItem.location,
        deadline: editingItem.deadline,
        payment: editingItem.payment,
        description: editingItem.description,
        status: editingItem.status,
        contactName: editingItem.contactName,
        contactEmail: editingItem.contactEmail,
        contactPhone: editingItem.contactPhone,
        skills: editingItem.skillsText
          .split(",")
          .map(skill => skill.trim())
          .filter(Boolean),
      };

      const data = await apiRequest(
        `/opportunities/${editingItem.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      setItems(previous =>
        previous.map(item =>
          item.id === data.opportunity.id
            ? data.opportunity
            : item
        )
      );

      setEditingItem(null);
      setNotice("Opportunity updated successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(
      `Permanently delete ${user.name}? This cannot be undone.`
    )) return;

    setDeletingId(user.id);
    setError("");

    try {
      await apiRequest(`/admin/users/${user.id}`, {
        method: "DELETE",
      });

      setItems(previous =>
        previous.filter(item => item.id !== user.id)
      );

      setNotice("User deleted successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteOpportunity(item) {
    if (!window.confirm(
      `Delete "${item.title}"? This cannot be undone.`
    )) return;

    setDeletingId(item.id);
    setError("");

    try {
      await apiRequest(`/opportunities/${item.id}`, {
        method: "DELETE",
      });

      setItems(previous =>
        previous.filter(x => x.id !== item.id)
      );

      setNotice("Opportunity deleted successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      role="admin"
      page={users ? "admin-users" : "admin-opportunities"}
      setPage={setPage}
    >
      <DashboardHeader
        eyebrow="ADMIN"
        title={users ? "Users Management" : "Opportunities Management"}
        text="Manage records from the backend database."
      />

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {notice && (
        <p style={{ color: "#15803d" }}>
          {notice}
        </p>
      )}

      <div className="application-table">
        {loading ? (
          <p>Loading records...</p>
        ) : items.length ? (
          items.map(x => (
            <div className="manage-card" key={x.id}>
              <div>
                <h3>{users ? x.name : x.title}</h3>
                <p>
                  {users
                    ? `${x.email} · ${x.role}`
                    : `${x.organization} · ${x.type} · ${x.status}`}
                </p>
              </div>

              <div className="manage-actions">
                {users ? (
                  <Button
                    variant="ghost"
                    disabled={deletingId === x.id}
                    onClick={() => deleteUser(x)}
                  >
                    {deletingId === x.id ? "Deleting..." : "Delete User"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => openEdit(x)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      disabled={deletingId === x.id}
                      onClick={() => deleteOpportunity(x)}
                    >
                      {deletingId === x.id ? "Deleting..." : "Delete"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No records found.</p>
        )}
      </div>

      {editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              background: "#fff",
              color: "#111827",
              width: "min(720px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 16,
            }}
          >
            <h2>Edit Opportunity</h2>
            <p>Update the opportunity details below.</p>

            <form onSubmit={saveOpportunity}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                  marginTop: 20,
                }}
              >
                {[
                  ["title", "Opportunity Title"],
                  ["organization", "Organization"],
                  ["type", "Opportunity Type"],
                  ["location", "Location"],
                  ["deadline", "Deadline"],
                  ["payment", "Payment"],
                  ["contactName", "Contact Name"],
                  ["contactEmail", "Contact Email"],
                  ["contactPhone", "Contact Phone"],
                ].map(([key, label]) => (
                  <label key={key} style={{ display: "grid", gap: 6 }}>
                    <span>{label}</span>
                    <input
                      type={key === "deadline" ? "date" : "text"}
                      value={editingItem[key] || ""}
                      onChange={e =>
                        setEditingItem(previous => ({
                          ...previous,
                          [key]: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                      }}
                    />
                  </label>
                ))}

                <label style={{ display: "grid", gap: 6 }}>
                  <span>Status</span>
                  <select
                    value={editingItem.status || ""}
                    onChange={e =>
                      setEditingItem(previous => ({
                        ...previous,
                        status: e.target.value,
                      }))
                    }
                    style={{
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="pending">Pending</option>
                  </select>
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: 6,
                    gridColumn: "1 / -1",
                  }}
                >
                  <span>Required Skills (comma separated)</span>
                  <input
                    value={editingItem.skillsText}
                    onChange={e =>
                      setEditingItem(previous => ({
                        ...previous,
                        skillsText: e.target.value,
                      }))
                    }
                    style={{
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: 6,
                    gridColumn: "1 / -1",
                  }}
                >
                  <span>Description</span>
                  <textarea
                    rows={5}
                    value={editingItem.description || ""}
                    onChange={e =>
                      setEditingItem(previous => ({
                        ...previous,
                        description: e.target.value,
                      }))
                    }
                    style={{
                      padding: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      resize: "vertical",
                    }}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 22,
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}



function About({ setPage }) {

  return (

    <section className="page-section about-page">

      <span className="eyebrow">ABOUT CAMPUSWORKS</span>

      <h1>A simple campus talent marketplace.</h1>

      <p>

        CampusWorks helps students find meaningful campus opportunities while giving

        faculty and clubs a simple way to discover student talent and manage applications.

      </p>

      <div className="about-grid">

        <RoleCard icon="🎓" title="Students" text="Profile, discover, apply, track and build reputation." onClick={() => setPage("register")} />

        <RoleCard icon="👩‍🏫" title="Faculty" text="Post research, project and academic opportunities." onClick={() => setPage("register")} />

        <RoleCard icon="🏫" title="Clubs" text="Find volunteers and student contributors." onClick={() => setPage("register")} />

      </div>

    </section>

  );

}



export default function App() {

  const [page, setPage] = useState("home");

  const [role, setRole] = useState(() => { try { return JSON.parse(localStorage.getItem("campusworks_user") || "null")?.role || ""; } catch { return ""; } });

  const [opportunities, setOpportunities] = useState([]);

  const [loadingOpportunities, setLoadingOpportunities] = useState(true);

  const [apiError, setApiError] = useState("");



  useEffect(() => {

    let cancelled = false;



    fetch("http://127.0.0.1:5000/api/opportunities")

      .then(response => {

        if (!response.ok) throw new Error("Could not load opportunities from Flask.");

        return response.json();

      })

      .then(data => {

        if (cancelled) return;

        setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);

        setApiError("");

      })

      .catch(() => {

        if (!cancelled) {

          setApiError("Could not connect to Flask. Make sure the backend is running at http://127.0.0.1:5000.");

        }

      })

      .finally(() => {

        if (!cancelled) setLoadingOpportunities(false);

      });



    return () => { cancelled = true; };

  }, []);



  const getOpportunity = (id) => opportunities.find(o => o.id === Number(id));



  let content;



  if (page === "home") {

    content = <Home setPage={setPage} opportunities={opportunities} loading={loadingOpportunities} error={apiError} />;

  } else if (page === "explore") {

    content = <Explore setPage={setPage} opportunities={opportunities} loading={loadingOpportunities} error={apiError} />;

  } else if (page === "about") {

    content = <About setPage={setPage} />;

  } else if (page === "login") {

    content = <Auth mode="login" setPage={setPage} setRole={setRole} />;

  } else if (page === "register") {

    content = <Auth mode="register" setPage={setPage} setRole={setRole} />;

  } else if (page.startsWith("opportunity-")) {

    content = <OpportunityDetails opportunity={getOpportunity(page.split("-")[1])} setPage={setPage} role={role} />;

  } else if (page === "student-dashboard") {

    content = <StudentDashboard setPage={setPage} opportunities={opportunities} />;

  } else if (page === "student-profile") {

    content = <StudentProfile setPage={setPage} />;

  } else if (page === "student-applications") {

    content = <StudentApplications setPage={setPage}  opportunities={opportunities} />;

  } else if (page === "faculty-dashboard") {

    content = <FacultyDashboard setPage={setPage} />;

  } else if (page === "faculty-post") {

    content = <PostOpportunity setPage={setPage} role="faculty" />;

  } else if (page === "faculty-applicants") {

    content = <ApplicantsPage setPage={setPage} role="faculty" />;

  } else if (page === "faculty-opportunities") {

    content = <ManageOpportunities setPage={setPage} role="faculty" />;

  } else if (page === "club-dashboard") {

    content = <FacultyDashboard setPage={setPage} role="club" />;

  } else if (page === "club-post") {

    content = <PostOpportunity setPage={setPage} role="club" />;

  } else if (page === "club-applicants") {

    content = <ApplicantsPage setPage={setPage} role="club" />;

  } else if (page === "club-opportunities") {

    content = <ManageOpportunities setPage={setPage} role="club" />;

  } else if (page === "admin-dashboard") {

    content = <AdminDashboard setPage={setPage} />;

  } else if (page === "admin-users") {

    content = <AdminList setPage={setPage} type="users" />;

  } else if (page === "admin-opportunities") {

    content = <AdminList setPage={setPage} type="opportunities" />;

  } else if (page === "admin-reviews") {

    content = <AdminList setPage={setPage} type="reviews" />;

  } else {

    content = <Home setPage={setPage} opportunities={opportunities} loading={loadingOpportunities} error={apiError} />;

  }



  return (

    <div className="app">

      <Navbar page={page} setPage={setPage} role={role} />

      <main>{content}</main>

      <Footer />

    </div>

  );

}