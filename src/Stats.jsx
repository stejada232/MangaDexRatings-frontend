import './Stats.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

function Stats({
    url,
    id,
    title, 
    cover, 
    user, 
    global, 
    follows, 
    pub_status, 
    year, 
    content_rating, 
    reading_status, 
    tags, 
    closeFunc,
    rateFunc,
}) {
    
    const chartData = [
        {
            name: 'Ratings',
            Global: global || 0,
            User: user || 0,
        }
    ];

    const [selectedRating, setSelectedRating] = useState(user || 10)
    const [distro, setDistro] = useState(null)

    const getDistro = async(id) => {
        try{
            const response = await fetch(
            `${url}/api/distribution`,
                {
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id })
                }
            )

            const data = await response.json()
            const distroData = data ? Object.keys(data).map(key => ({
                rating: key,
                count: data[key]
            })) : [];

            if (response.ok){
                setDistro(distroData)
            }
            else{
                console.log("failed1")
            }
        }
        catch(error){
            console.log(error)
        }
    }

  return (
    <div className="stats">
        <header className="stats-header">
            <img loading="lazy" src={cover} alt={title} className="stats-cover" />
            <div className="stats-title-area">
                <h2>{title} {year ? <span className="stats-year">({year})</span> : null}</h2>
                {content_rating && <span className="content-rating">{content_rating}</span>}
            </div>
        </header>

        <div className="stats-grid">
            <div className="stat-item">
                <span className="stat-label">Publication Status</span>
                <span className="stat-value">{pub_status || 'Unknown'}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">Follows</span>
                <span className="stat-value">{follows ? follows.toLocaleString() : 0}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">Reading</span>
                <span className="stat-value">{reading_status || 'Unknown'}</span>
            </div>
        </div>

        {tags && tags.length > 0 && (
            <div className="stats-tags">
                {tags.map((tag, index) => (
                    <span key={index} className="tag-pill">{tag}</span>
                ))}
            </div>
        )}

        <div className='stat_container'>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend/>
                <Bar dataKey="Global" fill="#82ca9d" name="Global Average" />
                <Bar dataKey="User" fill="#8884d8" name="My Rating" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="stats-footer"> 
            
            <div className="rating-controls">
                <select 
                    value={selectedRating} 
                    onChange={(e) => setSelectedRating(parseInt(e.target.value))}
                    className="rating-dropdown"
                >
                    {[10,9,8,7,6,5,4,3,2,1].map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
                <button className="rate-btn" onClick={() => rateFunc(id, selectedRating)}>
                    Submit Rating
                </button>
            </div>

            <button className='distro-btn' onClick={()=>getDistro(id)}>Get Ratings Distribution</button>

            <button className="close-btn" onClick={closeFunc}>Close</button>
            
        </div>

        {distro && (
            <div className="distro-section">
                <h3>Rating Distribution</h3>
                <div className='distro-container'>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={distro}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="rating" />
                            <YAxis allowDecimals={false} /> 
                            <Tooltip cursor={{fill: 'transparent'}}/>
                            <Bar 
                                dataKey="count" 
                                fill="#ff0000" 
                                name="Votes" 
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

    </div>
  )
}

export default Stats;