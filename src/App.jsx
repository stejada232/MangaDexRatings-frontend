import { useState, useEffect } from 'react'

import './App.css'
import Stats from './Stats.jsx'
import Tile from './Tile.jsx'


function App() {
  useEffect(() => {

    const savedToken = localStorage.getItem('mdToken')
  
  if (savedToken) {
    setToken(savedToken)
    getGallery(savedToken)
  }}, [])

  const [user, setUser] = useState('')
  const [pw, setPW] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(null)
  const [library, setLibrary] = useState({})
  const [isLoading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  const base_url = import.meta.env.VITE_API_BASE_URL  
  
  const handleLogin = async(e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const response = await fetch(
        `${base_url}/api/login`,
        {
          method : 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user, pw })
        }
      )
      const data = await response.json()

      if (response.ok){
        const token = data.token
        setToken(token)
        localStorage.setItem('mdToken', token)
        setMessage("Login Successful. Loading Library")
        getGallery(token)
      }
      else{
        setMessage(`Login Unsuccessful ${data.detail}`)
        setLoading(false)
      }
    }
    catch(error){
      setMessage(`Login Unsuccessful (Server Error) ${error}`)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setLibrary({})
    setSelected(null)
    setMessage("")
    localStorage.removeItem('mdToken')
  }

  const getGallery = async(tokenOveride) => {
    setLoading(true)
    const newTok = tokenOveride || token
    try{
      const response = await fetch(
        `${base_url}/api/library`,
        {
          method : 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: newTok })
        }
      )
      const data = await response.json()

      if (response.ok){
        setLibrary(data)
        setLoading(false)
        setMessage("")
      }
      else{
        setMessage(`Library Unsuccessful ${data.detail}`)
        setLoading(false)

        if (response.status == 401){
          handleLogout()
          setMessage("Session expired. Please log in again.")
        }
      }
    }
    catch(error){
      setMessage(`Library Unsuccessful ${error}`)
      setLoading(false)
    } 
  }

  const handleRating = async(id, rating) => {
    try {
      const response = await fetch(
        `${base_url}/api/rate`,
        {
          method : 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, id, rating })
        }
      )

      const data = await response.json()

      if (response.ok){
        setLibrary(prevLibrary => ({
          ...prevLibrary,
          [id]: {
            ...prevLibrary[id],
            "user":rating
          }
        }));
      }
      else{
        setMessage("Unable to rate manga")
      }
    }
    catch(error){
      setMessage("Unable to rate manga")
    }

  }

  return (
    <div>
      {(!token) && (
      <form onSubmit={handleLogin}>
        <input 
        type='text'
        placeholder='Username'
        value={user}
        onChange={(e)=>setUser(e.target.value)}>
        </input>
        <input 
        type='password'
        placeholder='Password'
        value={pw}
        onChange={(e)=>setPW(e.target.value)}>
        </input>
        <button type="submit">{isLoading ? "Working..." : "Log In"}</button>
        {message && <p className="status-message">{message}</p>}
      </form>
      )
    }

    {selected && token && (
    <Stats
    key={"stat_"+selected}
    url={base_url}
    id={selected}
    cover={library[selected].cover}
    title={library[selected].title}
    user={library[selected].user}
    global={library[selected].global}
    closeFunc={()=>setSelected(null)}
    rateFunc={handleRating}
    follows={library[selected].follows}
    year={library[selected].year}
    pub_status={library[selected].pub_status}
    content_rating={library[selected].content_rating}
    reading_status={library[selected].reading_status}
    tags={library[selected].tags}
    >
    </Stats>
    )
    }

    {(token && !selected) && (
      <div>
      <button onClick={handleLogout}>Log out</button>
      {message && <p className="status-message">{message}</p>}
      <div>
        {isLoading 
        ? <h2 className="global-loading">Fetching your library from MangaDex...</h2>
        :
        (<div className='library-grid'>
          {Object.keys(library).map(manga =>(
            <Tile
            key={manga}
            user={library[manga].user}
            func={() => setSelected(manga)}
            img={library[manga].cover}
            name={library[manga].title}
            ></Tile>
          ))}
        </div>)
      }

      </div>


     </div>
    )
    }
    </div>
  )
}

export default App
